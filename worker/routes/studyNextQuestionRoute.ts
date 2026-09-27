// worker/routes/studyNextQuestionRoute.ts
import { Hono } from 'hono'
import { GetNextQuestionUseCase, PREPARING_RETRY_MS } from '../../src/app/usecases/GetNextQuestionUseCase.ts'
import { type Env, getStudyRepo } from '../types.ts'

export const studyNextQuestionRoute = new Hono<{ Bindings: Env }>()

studyNextQuestionRoute.get('/api/study/session/:sessionId/next', async (c) => {
  const sessionId = c.req.param('sessionId')
  const repo = getStudyRepo(c.env)
  const session = await repo.sessions.findById(sessionId)

  if (!session) {
    return c.json({ error: 'Session not found' }, 404)
  }

  const useCase = new GetNextQuestionUseCase(repo.sessions, repo.questions)
  const result = await useCase.executeForSession(session, c.req.query('existing') === '1')

  if (result.kind === 'preparing') {
    return c.json({ preparing: true, remainingMs: result.remainingMs, retryAfterMs: PREPARING_RETRY_MS }, 202)
  }
  if (result.kind === 'completed') {
    return c.json({
      completed: true,
      message: 'All questions in this session have been completed',
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.targetQuestionCount,
    })
  }
  return c.json({
    ...result.question,
    currentQuestionIndex: result.session.currentQuestionIndex,
    totalQuestions: result.session.targetQuestionCount,
  })
})
