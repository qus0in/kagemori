import { PracticeSession } from '../../domain/models/PracticeSession.ts'
import type { PracticeSessionProps } from '../../domain/models/PracticeSessionTypes.ts'
import type { PracticeSessionRepository } from '../../domain/ports/PracticeSessionRepository.ts'
import { sessionSnapshot } from '../../domain/models/SessionSnapshot.ts'
import { SessionConflictError, StorageUnavailableError } from '../../domain/models/StorageErrors.ts'
import { withStorageDeadline } from '../storage/withStorageDeadline.ts'
import { KvSessionCache, type CloudflareKvBinding } from './KvSessionCache.ts'

export interface DurableObjectStubLike { fetch(request: Request): Promise<Response> }
export interface DurableObjectNamespaceLike {
  idFromName(name: string): unknown
  get(id: unknown): DurableObjectStubLike
}
export type BackgroundTask = (task: Promise<unknown>) => void

export class DurableObjectSessionRepository implements PracticeSessionRepository {
  private readonly versions = new WeakMap<PracticeSession, number>()
  private readonly namespace: DurableObjectNamespaceLike
  private readonly kv: KvSessionCache
  private readonly background?: BackgroundTask
  private readonly timeoutMs: number

  constructor(namespace: DurableObjectNamespaceLike, kv?: CloudflareKvBinding, background?: BackgroundTask, timeoutMs = 5000) {
    this.namespace = namespace
    this.kv = new KvSessionCache(kv)
    this.background = background
    this.timeoutMs = timeoutMs
  }

  private async request(id: string, init?: RequestInit): Promise<Response> {
    try {
      const stub = this.namespace.get(this.namespace.idFromName(id))
      return await withStorageDeadline((async () => {
        const response = await stub.fetch(new Request('https://session.internal/session', init))
        return new Response(await response.arrayBuffer(), { status: response.status, headers: response.headers })
      })(), 'DO', this.timeoutMs)
    } catch (cause) {
      throw new StorageUnavailableError('DO', { cause })
    }
  }

  async findById(id: string): Promise<PracticeSession | null> {
    const response = await this.request(id)
    if (response.status === 404) return null
    if (!response.ok) throw new StorageUnavailableError('DO')
    try {
      const data = await response.json() as { session: PracticeSessionProps; revision: number }
      if (data.session.sessionId !== id || !Number.isInteger(data.revision) || data.revision < 0) throw new Error('Invalid snapshot')
      const session = new PracticeSession(data.session)
      this.versions.set(session, data.revision)
      return session
    } catch (cause) {
      throw new StorageUnavailableError('DO', { cause })
    }
  }

  async save(session: PracticeSession): Promise<void> {
    const expectedRevision = this.versions.get(session) ?? null
    const response = await this.request(session.sessionId, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: sessionSnapshot(session), expectedRevision }),
    })
    if (response.status === 409) throw new SessionConflictError()
    if (!response.ok) throw new StorageUnavailableError('DO')
    this.versions.set(session, expectedRevision === null ? 1 : expectedRevision + 1)
    if (expectedRevision === null && this.background) {
      try {
        this.background(this.kv.saveSessionMeta({
          sessionId: session.sessionId, purpose: session.purpose,
          targetCount: session.targetQuestionCount, createdAt: Date.now(),
        }))
      } catch (error) { console.warn('Optional cache task unavailable', { error: String(error) }) }
    }
  }
}
