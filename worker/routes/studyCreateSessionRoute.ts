// worker/routes/studyCreateSessionRoute.ts
import { Hono } from 'hono'
import type { SessionPurpose } from '../../src/domain/models/PracticeSession.ts'
import type {
  CreateSessionRequestDto,
  CreateSessionResponseDto,
} from '../../src/app/dto/StudyDto.ts'
import { type Env, getStudyRepo } from '../types.ts'
import { getSessionCreator } from '../studySessionFactory.ts'

export const studyCreateSessionRoute = new Hono<{ Bindings: Env }>()

studyCreateSessionRoute.post('/api/study/session', async (c) => {
  const body = await c.req
    .json<CreateSessionRequestDto>()
    .catch(() => ({} as Partial<CreateSessionRequestDto>))
  const purpose: SessionPurpose = ['DIAGNOSTIC', 'IMPROVEMENT', 'MOCK_EXAM'].includes(
    body.purpose as string
  )
    ? (body.purpose as SessionPurpose)
    : 'DIAGNOSTIC'

  const repo = getStudyRepo(c.env, c.env?.STUDY_SESSION_DO ? (task) => c.executionCtx.waitUntil(task) : undefined)
  const session = await getSessionCreator(c.env, repo).execute(purpose, body.targetCount)

  const response: CreateSessionResponseDto = {
    sessionId: session.sessionId,
    purpose: session.purpose,
    targetQuestionCount: session.targetQuestionCount,
    currentQuestionIndex: session.currentQuestionIndex,
    ...(session.generation ? { preparingQuestions: session.generation.until - session.generation.from } : {}),
  }
  return c.json(response, 201)
})
