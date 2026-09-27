// worker/routes/studyPostAnswerRoutes.ts
import { Hono, type Context } from 'hono'
import { RegenerateExplanationUseCase } from '../../src/app/usecases/RegenerateExplanationUseCase.ts'
import { GetQuestionDiagramUseCase } from '../../src/app/usecases/GetQuestionDiagramUseCase.ts'
import { QuestionNotAnsweredError, SessionNotFoundError } from '../../src/app/usecases/AnsweredQuestionLoader.ts'
import { SessionConflictError, StorageUnavailableError } from '../../src/domain/models/StorageErrors.ts'
import { GeminiDiagramAdapter } from '../../src/infra/ai/GeminiDiagramAdapter.ts'
import { KvDiagramCache } from '../../src/infra/cache/KvDiagramCache.ts'
import { type Env, getStudyRepo, getAiAdapter } from '../types.ts'

export const studyPostAnswerRoutes = new Hono<{ Bindings: Env }>()

type Body = { questionId?: string; previousExplanation?: string }

function mapError(c: Context, err: unknown, fallbackStatus: 400 | 502, fallback: string) {
  if (err instanceof SessionConflictError || err instanceof StorageUnavailableError) throw err
  if (err instanceof SessionNotFoundError) return c.json({ error: 'Session not found' }, 404)
  if (err instanceof QuestionNotAnsweredError) return c.json({ error: err.message }, 409)
  console.warn(fallback, { error: String(err) })
  return c.json({ error: fallback }, fallbackStatus)
}

studyPostAnswerRoutes.post('/api/study/session/:sessionId/explanation', async (c) => {
  const body = await c.req.json<Body>().catch(() => ({} as Body))
  if (!body.questionId) return c.json({ error: 'questionId is required' }, 400)
  const repo = getStudyRepo(c.env)
  try {
    const useCase = new RegenerateExplanationUseCase(repo.sessions, repo.questions, repo.concepts, getAiAdapter(c.env))
    return c.json(await useCase.execute({
      sessionId: c.req.param('sessionId'), questionId: body.questionId,
      previousExplanation: typeof body.previousExplanation === 'string' ? body.previousExplanation : undefined,
    }))
  } catch (err) { return mapError(c, err, 400, 'Failed to regenerate explanation') }
})

studyPostAnswerRoutes.post('/api/study/session/:sessionId/diagram', async (c) => {
  const body = await c.req.json<Body>().catch(() => ({} as Body))
  if (!body.questionId) return c.json({ error: 'questionId is required' }, 400)
  const diagram = c.env?.DIAGRAM_PORT ?? (c.env?.GEMINI_API_KEY ? new GeminiDiagramAdapter({ apiKey: c.env.GEMINI_API_KEY }) : undefined)
  if (!diagram) return c.json({ error: '도식 생성 기능이 설정되지 않았어요.' }, 503)
  const repo = getStudyRepo(c.env)
  const cache = c.env?.KAGEMORI_KV ? new KvDiagramCache(c.env.KAGEMORI_KV) : undefined
  try {
    const useCase = new GetQuestionDiagramUseCase(repo.sessions, repo.questions, repo.concepts, diagram, cache)
    return c.json(await useCase.execute(c.req.param('sessionId'), body.questionId))
  } catch (err) { return mapError(c, err, 502, '도식을 만들지 못했어요. 잠시 후 다시 시도해 주세요.') }
})
