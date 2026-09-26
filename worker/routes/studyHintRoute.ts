// worker/routes/studyHintRoute.ts
import { Hono } from 'hono'
import { GetConceptHintUseCase } from '../../src/app/usecases/GetConceptHintUseCase.ts'
import type { ConceptHintRequestDto, ConceptHintResponseDto } from '../../src/app/dto/StudyDto.ts'
import { type Env, getStudyRepo, getAiAdapter } from '../types.ts'

export const studyHintRoute = new Hono<{ Bindings: Env }>()

studyHintRoute.post('/api/study/session/:sessionId/hint', async (c) => {
  const sessionId = c.req.param('sessionId')
  const repo = getStudyRepo(c.env)
  const session = await repo.sessions.findById(sessionId)
  if (!session) return c.json({ error: 'Session not found' }, 404)

  const body = await c.req.json<ConceptHintRequestDto>().catch(() => ({} as Partial<ConceptHintRequestDto>))
  if (!body.questionId) return c.json({ error: 'questionId is required' }, 400)

  const ai = getAiAdapter(c.env)
  const useCase = new GetConceptHintUseCase(repo.questions, repo.concepts, ai, repo.sessions, repo.sources)

  try {
    const hintResult = await useCase.execute({ sessionId, questionId: body.questionId })
    const question = await repo.questions.findById(body.questionId)
    const concept = question?.conceptId ? await repo.concepts.findById(question.conceptId) : null
    const source = concept?.sourceId ? await repo.sources.findById(concept.sourceId) : null

    const response: ConceptHintResponseDto = {
      questionId: body.questionId,
      hint: hintResult.hintText,
      hintText: hintResult.hintText,
      conceptTitle: hintResult.conceptTitle,
      sourceTitle: hintResult.sourceTitle,
      sourceUrl: source?.url,
    }
    return c.json(response)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve hint'
    return c.json({ error: msg }, 400)
  }
})
