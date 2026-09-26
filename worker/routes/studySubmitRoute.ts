// worker/routes/studySubmitRoute.ts
import { Hono } from 'hono'
import { SubmitAnswerUseCase } from '../../src/app/usecases/SubmitAnswerUseCase.ts'
import type { SubmitAnswerRequestDto } from '../../src/app/dto/StudyDto.ts'
import { type Env, getStudyRepo, getAiAdapter } from '../types.ts'
import { SessionConflictError, StorageUnavailableError } from '../../src/domain/models/StorageErrors.ts'

export const studySubmitRoute = new Hono<{ Bindings: Env }>()

studySubmitRoute.post('/api/study/session/:sessionId/submit', async (c) => {
  const sessionId = c.req.param('sessionId')
  const repo = getStudyRepo(c.env)
  const session = await repo.sessions.findById(sessionId)
  if (!session) return c.json({ error: 'Session not found' }, 404)

  const body = await c.req.json<SubmitAnswerRequestDto>().catch(() => ({} as Partial<SubmitAnswerRequestDto>))
  if (!body.questionId || !body.optionId) return c.json({ error: 'questionId and optionId are required' }, 400)

  const ai = getAiAdapter(c.env)
  const useCase = new SubmitAnswerUseCase(repo.sessions, repo.questions, repo.concepts, ai, repo.sources)

  try {
    const res = await useCase.execute({
      sessionId,
      questionId: body.questionId,
      optionId: body.optionId,
      hintUsed: Boolean(body.hintUsed),
      durationMs: Number(body.durationMs) || 0,
    })

    return c.json({ ...res, aiExplanation: res.explanation })
  } catch (err: unknown) {
    if (err instanceof SessionConflictError || err instanceof StorageUnavailableError) throw err
    const msg = err instanceof Error ? err.message : 'Failed to submit answer'
    return c.json({ error: msg }, 400)
  }
})
