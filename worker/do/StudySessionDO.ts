import type { PracticeSessionProps } from '../../src/domain/models/PracticeSessionTypes.ts'
import { validateSessionUpdate } from './validateSessionUpdate.ts'
import type { D1Database } from '@cloudflare/workers-types'
import { queueArchive, archiveSession } from './StudySessionArchive.ts'

export interface SessionStorage {
  get<T>(key: string): Promise<T | undefined>
  put<T>(key: string, value: T): Promise<void>
  setAlarm(time: number): Promise<void>
}
export interface DurableObjectState {
  storage: SessionStorage & { transaction<T>(callback: (txn: SessionStorage) => Promise<T>): Promise<T> }
}

export class StudySessionDO {
  private readonly state: DurableObjectState
  private readonly db?: D1Database
  constructor(state: DurableObjectState, env?: { DB?: D1Database }) { this.state = state; this.db = env?.DB }

  async alarm(): Promise<void> { await archiveSession(this.state, this.db) }

  async fetch(request: Request): Promise<Response> {
    if (new URL(request.url).pathname !== '/session') return new Response('Not Found', { status: 404 })
    if (request.method === 'GET') {
      const snapshot = await this.state.storage.transaction(async (txn) => {
        const session = await txn.get<PracticeSessionProps>('session')
        const revision = (await txn.get<number>('revision')) ?? 0
        if (session) await queueArchive(txn, session, revision)
        return { session, revision }
      })
      return snapshot.session ? Response.json(snapshot) : Response.json({ error: 'Session not found' }, { status: 404 })
    }
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
    const body = await request.json().catch(() => null) as {
      session?: PracticeSessionProps; expectedRevision?: number | null
    } | null
    if (!body?.session || !(body.expectedRevision === null ||
      (Number.isInteger(body.expectedRevision) && Number(body.expectedRevision) >= 0))) {
      return Response.json({ error: 'Invalid session update' }, { status: 400 })
    }
    const session = body.session
    return this.state.storage.transaction(async (txn) => {
      const previous = await txn.get<PracticeSessionProps>('session')
      const revision = (await txn.get<number>('revision')) ?? 0
      if (previous ? body.expectedRevision !== revision : body.expectedRevision !== null) {
        return Response.json({ error: 'Session conflict' }, { status: 409 })
      }
      if (!validateSessionUpdate(session, previous)) return Response.json({ error: 'Invalid transition' }, { status: 400 })
      await txn.put('session', session)
      await txn.put('revision', revision + 1)
      await queueArchive(txn, session, revision + 1)
      return Response.json({ revision: revision + 1 })
    })
  }
}
