// src/infra/study/DurableObjectSessionRepository.ts
import { PracticeSession } from '../../domain/models/PracticeSession.ts'
import type { PracticeSessionProps } from '../../domain/models/PracticeSessionTypes.ts'
import type { PracticeSessionRepository } from '../../domain/ports/PracticeSessionRepository.ts'
import { InMemorySessionRepository } from './InMemorySessionRepository.ts'
import { KvSessionCache, type CloudflareKvBinding } from './KvSessionCache.ts'

export interface DurableObjectStubLike {
  getSession?(): Promise<PracticeSessionProps | null>
  saveSession?(props: PracticeSessionProps): Promise<void>
  fetch(request: Request): Promise<Response>
}

export interface DurableObjectNamespaceLike {
  idFromName(name: string): unknown
  get(id: unknown): DurableObjectStubLike
}

export class DurableObjectSessionRepository implements PracticeSessionRepository {
  private doNamespace?: DurableObjectNamespaceLike
  private kvCache: KvSessionCache
  private fallbackRepo: InMemorySessionRepository

  constructor(doNamespace?: DurableObjectNamespaceLike, kv?: CloudflareKvBinding) {
    this.doNamespace = doNamespace
    this.kvCache = new KvSessionCache(kv)
    this.fallbackRepo = new InMemorySessionRepository()
  }

  async findById(id: string): Promise<PracticeSession | null> {
    const props = (await this.fetchFromDo(id)) ?? (await this.kvCache.getSessionState(id))
    if (props && props.sessionId) {
      return new PracticeSession(props)
    }
    return this.fallbackRepo.findById(id)
  }

  async save(session: PracticeSession): Promise<void> {
    await this.fallbackRepo.save(session)
    const props: PracticeSessionProps = {
      sessionId: session.sessionId,
      learnerId: session.learnerId,
      purpose: session.purpose,
      blueprintId: session.blueprintId,
      targetQuestionCount: session.targetQuestionCount,
      currentQuestionIndex: session.currentQuestionIndex,
      attempts: [...session.attempts],
      isCompleted: session.isCompleted,
    }

    await this.kvCache.saveSessionState(props)
    await this.kvCache.saveSessionMeta({
      sessionId: session.sessionId,
      purpose: session.purpose,
      targetCount: session.targetQuestionCount,
      createdAt: Date.now(),
    })
    await this.saveToDo(props)
  }

  private async fetchFromDo(id: string): Promise<PracticeSessionProps | null> {
    if (!this.doNamespace) return null
    try {
      const stub = this.doNamespace.get(this.doNamespace.idFromName(id))
      if (typeof stub.getSession === 'function') {
        try {
          const res = await stub.getSession()
          if (res) return res
        } catch { /* fallback to fetch */ }
      }
      const res = await stub.fetch(new Request('http://do/session'))
      return res.ok ? ((await res.json()) as PracticeSessionProps) : null
    } catch {
      return null
    }
  }

  private async saveToDo(props: PracticeSessionProps): Promise<void> {
    if (!this.doNamespace) return
    try {
      const stub = this.doNamespace.get(this.doNamespace.idFromName(props.sessionId))
      if (typeof stub.saveSession === 'function') {
        try {
          await stub.saveSession(props)
          return
        } catch { /* fallback to fetch */ }
      }
      await stub.fetch(
        new Request('http://do/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(props),
        })
      )
    } catch { /* graceful fallback */ }
  }
}
