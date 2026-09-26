import { Hono } from 'hono'
import type { Env } from '../types.ts'
import { D1StudyHistory } from '../../src/infra/d1/D1StudyHistory.ts'
import { StorageUnavailableError } from '../../src/domain/models/StorageErrors.ts'

export const studyCoverageRoute = new Hono<{ Bindings: Env }>()
studyCoverageRoute.get('/api/study/coverage', async (c) => {
  if (!c.env?.DB) throw new StorageUnavailableError('D1 binding')
  c.header('Cache-Control', 'no-store')
  return c.json({ results: await new D1StudyHistory(c.env.DB).coverage() })
})
