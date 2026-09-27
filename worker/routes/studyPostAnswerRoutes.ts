// worker/routes/studyPostAnswerRoutes.ts
import { Hono, type Context } from 'hono'
import { RegenerateExplanationUseCase } from '../../src/app/usecases/RegenerateExplanationUseCase.ts'
import { DiagramUnavailableError, type DiagramMode } from '../../src/app/usecases/GetQuestionDiagramUseCase.ts'
import { QuestionNotAnsweredError, SessionNotFoundError } from '../../src/app/usecases/AnsweredQuestionLoader.ts'
import { SessionConflictError, StorageUnavailableError } from '../../src/domain/models/StorageErrors.ts'
import { getDiagramUseCase, hasDiagramModels } from '../diagramFactory.ts'
import { type Env, getStudyRepo, getAiAdapter } from '../types.ts'

export const studyPostAnswerRoutes = new Hono<{ Bindings: Env }>()

type Body = { questionId?: string; previousExplanation?: string; mode?: string }

function mapError(c: Context, err: unknown, fallbackStatus: 400 | 502, fallback: string) {
  if (err instanceof SessionConflictError || err instanceof StorageUnavailableError) throw err
  if (err instanceof SessionNotFoundError) return c.json({ error: 'Session not found' }, 404)
  if (err instanceof QuestionNotAnsweredError) return c.json({ error: err.message }, 409)
  if (err instanceof DiagramUnavailableError) return c.json({ error: '이 도식 방식은 지금 사용할 수 없어요.' }, 503)
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
  if (!hasDiagramModels(c.env)) return c.json({ error: '도식 생성 기능이 설정되지 않았어요.' }, 503)
  const sessionId = c.req.param('sessionId')
  const mode: DiagramMode = body.mode === 'image' ? 'image' : 'auto'
  try {
    const { content, cached, reason } = await getDiagramUseCase(c.env, getStudyRepo(c.env)).execute(sessionId, body.questionId, mode)
    const imageUrl = content.kind === 'image'
      ? `/api/study/session/${encodeURIComponent(sessionId)}/diagram/image?questionId=${encodeURIComponent(body.questionId)}`
      : undefined
    const { imageKey: _hidden, ...publicContent } = content as typeof content & { imageKey?: string }
    return c.json({ ...publicContent, cached, reason, imageUrl })
  } catch (err) { return mapError(c, err, 502, '도식을 만들지 못했어요. 잠시 후 다시 시도해 주세요.') }
})

studyPostAnswerRoutes.get('/api/study/session/:sessionId/diagram/image', async (c) => {
  const questionId = c.req.query('questionId')
  if (!questionId) return c.json({ error: 'questionId is required' }, 400)
  try {
    const image = await getDiagramUseCase(c.env, getStudyRepo(c.env)).openImage(c.req.param('sessionId'), questionId)
    if (!image) return c.json({ error: 'Diagram image not found' }, 404)
    return new Response(image.body, { headers: { 'Content-Type': image.mimeType, 'Cache-Control': 'private, max-age=86400' } })
  } catch (err) { return mapError(c, err, 502, '도식 이미지를 불러오지 못했어요.') }
})
