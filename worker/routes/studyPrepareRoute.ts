// worker/routes/studyPrepareRoute.ts
import { Hono } from 'hono'
import { SessionNotFoundError } from '../../src/app/usecases/AnsweredQuestionLoader.ts'
import { type Env, getStudyRepo } from '../types.ts'
import { getPrepareUseCase } from '../studySessionFactory.ts'

export const studyPrepareRoute = new Hono<{ Bindings: Env }>()

/** Long-running on purpose: the client fires it after the first question and keeps answering. */
studyPrepareRoute.post('/api/study/session/:sessionId/prepare', async (c) => {
  const repo = getStudyRepo(c.env)
  try {
    return c.json(await getPrepareUseCase(c.env, repo).execute(c.req.param('sessionId')))
  } catch (err) {
    if (err instanceof SessionNotFoundError) return c.json({ error: 'Session not found' }, 404)
    throw err
  }
})
