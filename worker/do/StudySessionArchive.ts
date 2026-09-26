import type { D1Database } from '@cloudflare/workers-types'
import type { PracticeSessionProps } from '../../src/domain/models/PracticeSessionTypes.ts'
import { D1StudyHistory } from '../../src/infra/d1/D1StudyHistory.ts'
import type { DurableObjectState, SessionStorage } from './StudySessionDO.ts'

export async function queueArchive(txn: SessionStorage, session: PracticeSessionProps, revision: number): Promise<void> {
  if (!session.attempts?.length) return
  if ((await txn.get<number>('archivedRevision')) === revision) return
  await txn.setAlarm(Date.now() + 1000)
}

export async function archiveSession(state: DurableObjectState, db?: D1Database): Promise<void> {
  try {
    if (!db) throw new Error('D1 binding missing')
    const snapshot = await state.storage.transaction(async (txn) => ({
      session: await txn.get<PracticeSessionProps>('session'), revision: (await txn.get<number>('revision')) ?? 0,
    }))
    if (!snapshot.session) return
    await new D1StudyHistory(db).archive(snapshot.session)
    await state.storage.transaction(async (txn) => {
      await txn.put('archivedRevision', snapshot.revision)
      if ((await txn.get<number>('revision') ?? 0) !== snapshot.revision) await txn.setAlarm(Date.now() + 1000)
    })
  } catch (error) {
    console.error('Study history archive deferred', { error: String(error) })
    // Explicit scheduling continues even after the platform's automatic retries run out.
    await state.storage.setAlarm(Date.now() + 60000)
    throw error
  }
}
