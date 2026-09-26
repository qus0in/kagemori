// worker/routes/studyNextQuestionRoute.ts
import { Hono } from 'hono'
import { GetNextQuestionUseCase } from '../../src/app/usecases/GetNextQuestionUseCase.ts'
import type { PublicQuestionDto } from '../../src/app/dto/StudyDto.ts'
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
  const publicQuestion: PublicQuestionDto | null = await useCase.executeForSession(session)

  if (!publicQuestion) {
    return c.json({
      completed: true,
      message: 'All questions in this session have been completed',
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.targetQuestionCount,
    })
  }

  publicQuestion.currentQuestionIndex = session.currentQuestionIndex
  publicQuestion.totalQuestions = session.targetQuestionCount

  return c.json(publicQuestion)
})
