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
    if (!this.doNamespace) {
      return this.fallbackRepo.findById(id)
    }

    try {
      const doId = this.doNamespace.idFromName(id)
      const stub = this.doNamespace.get(doId)

      let props: PracticeSessionProps | null = null
      if (typeof stub.getSession === 'function') {
        props = await stub.getSession()
      } else {
        const res = await stub.fetch(new Request('http://do/session'))
        if (res.ok) {
          props = (await res.json()) as PracticeSessionProps
        }
      }

      if (props) {
        return new PracticeSession(props)
      }

      // If not yet persisted in DO, check KV or fallback for auto-healing
      const fallback = await this.fallbackRepo.findById(id)
      if (fallback) {
        await this.save(fallback)
        return fallback
      }
      return null
    } catch {
      return this.fallbackRepo.findById(id)
    }
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

    await this.kvCache.saveSessionMeta({
      sessionId: session.sessionId,
      purpose: session.purpose,
      targetCount: session.targetQuestionCount,
      createdAt: Date.now(),
    })

    if (!this.doNamespace) return

    try {
      const doId = this.doNamespace.idFromName(session.sessionId)
      const stub = this.doNamespace.get(doId)
      if (typeof stub.saveSession === 'function') {
        await stub.saveSession(props)
      } else {
        await stub.fetch(
          new Request('http://do/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(props),
          })
        )
      }
    } catch {
      // In case of DO network glitch, fallbackRepo preserves state in-isolate
    }
  }
}
