import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import type { D1Database } from '@cloudflare/workers-types'
import type { DurableObjectState, SessionStorage } from '../../worker/do/StudySessionDO.ts'

export function sqliteD1() {
  const sqlite = new DatabaseSync(':memory:')
  for (const name of ['0001_create_catalog_schema.sql', '0002_seed_2026_catalog.sql', '0003_study_history.sql', '0004_generated_questions.sql', '0005_question_semantics.sql', '0006_generated_question_tier.sql', '0007_study_chat.sql']) {
    sqlite.exec(readFileSync(new URL(`../../migrations/${name}`, import.meta.url), 'utf8'))
  }
  function prepare(sql: string, values: (string | number | null)[] = []) {
    return {
      bind: (...bound: (string | number | null)[]) => prepare(sql, bound),
      first: async () => sqlite.prepare(sql).get(...values) ?? null,
      all: async () => ({ success: true, results: sqlite.prepare(sql).all(...values) }),
      run: async () => ({ success: true, ...sqlite.prepare(sql).run(...values) }),
    }
  }
  // D1 accepts concurrent batches; SQLite cannot nest transactions, so queue them.
  let queue: Promise<unknown> = Promise.resolve()
  const runBatch = async (statements: ReturnType<typeof prepare>[]) => {
    sqlite.exec('BEGIN')
    try {
      const results = []
      for (const statement of statements) results.push(await statement.all())
      sqlite.exec('COMMIT')
      return results
    } catch (error) { sqlite.exec('ROLLBACK'); throw error }
  }
  const db = {
    prepare,
    batch: (statements: ReturnType<typeof prepare>[]) => {
      const run = queue.then(() => runBatch(statements))
      queue = run.catch(() => {})
      return run
    },
  } as unknown as D1Database
  return { db, sqlite }
}

export function memoryDOState() {
  let data = new Map<string, unknown>()
  let tail = Promise.resolve()
  let failWrites = false
  const methods = (map: Map<string, unknown>): SessionStorage => ({
    get: async <T>(key: string) => structuredClone(map.get(key)) as T | undefined,
    put: async (key, value) => { if (failWrites) throw new Error('Disk unavailable'); map.set(key, structuredClone(value)) },
    setAlarm: async (time) => { if (failWrites) throw new Error('Disk unavailable'); map.set('alarm', time) },
  })
  const state: DurableObjectState = { storage: {
    get: async <T>(key: string) => methods(data).get<T>(key),
    put: async (key, value) => methods(data).put(key, value),
    setAlarm: async (time) => methods(data).setAlarm(time),
    transaction: async <T>(callback: (txn: SessionStorage) => Promise<T>) => {
      const run = tail.then(async () => {
        const draft = structuredClone(data)
        const value = await callback(methods(draft))
        data = draft
        return value
      })
      tail = run.then(() => {}, () => {})
      return run
    },
  } }
  return { state, fail: (value: boolean) => { failWrites = value } }
}
