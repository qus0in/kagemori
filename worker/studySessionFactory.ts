// worker/studySessionFactory.ts
import { CreateStudySessionUseCase } from '../src/app/usecases/CreateStudySessionUseCase.ts'
import { ReplenishQuestionBankUseCase } from '../src/app/usecases/ReplenishQuestionBankUseCase.ts'
import { PrepareSessionQuestionsUseCase } from '../src/app/usecases/PrepareSessionQuestionsUseCase.ts'
import { SemanticQuestionService } from '../src/app/usecases/SemanticQuestionService.ts'
import type { StudyRepository } from '../src/domain/ports/StudyRepository.ts'
import type { BlindReviewPort } from '../src/domain/ports/QuestionBankPorts.ts'
import { D1StudyHistory } from '../src/infra/d1/D1StudyHistory.ts'
import { D1CatalogRepository } from '../src/infra/d1/D1CatalogRepository.ts'
import { GeminiQuestionAuthor } from '../src/infra/ai/GeminiQuestionAuthor.ts'
import { GemmaBlindReviewer, GemmaDraftScreener } from '../src/infra/ai/GemmaQuestionModels.ts'
import { GeminiEmbeddingAdapter } from '../src/infra/ai/GeminiEmbeddingAdapter.ts'
import { CatalogTopicContext } from '../src/infra/study/CatalogTopicContext.ts'
import { VectorizeQuestionIndex } from '../src/infra/vector/VectorizeQuestionIndex.ts'
import { InMemoryQuestionIndex } from '../src/infra/vector/InMemoryQuestionIndex.ts'
import type { Env } from './types.ts'

let localIndex: InMemoryQuestionIndex | null = null

/** Vectorize in production; an isolate-local index for local mode; nothing when unavailable. */
export function getSemanticService(env: Env | undefined): SemanticQuestionService | undefined {
  const embedder = env?.EMBEDDER ?? (env?.GEMINI_API_KEY ? new GeminiEmbeddingAdapter({ apiKey: env.GEMINI_API_KEY }) : undefined)
  if (!embedder) return undefined
  if (env?.QUESTION_INDEX && env.DB) return new SemanticQuestionService(embedder, new VectorizeQuestionIndex(env.QUESTION_INDEX, env.DB, embedder.model))
  if (env?.STORAGE_MODE === 'persistent') return undefined
  return new SemanticQuestionService(embedder, localIndex ??= new InMemoryQuestionIndex())
}

function getReplenisher(env: Env | undefined, repo: StudyRepository): ReplenishQuestionBankUseCase | undefined {
  const key = env?.GEMINI_API_KEY
  const author = env?.QUESTION_AUTHOR ?? (key ? new GeminiQuestionAuthor({ apiKey: key }) : undefined)
  if (!author) return undefined
  const reviewers: BlindReviewPort[] = [author]
  if (key && !env?.QUESTION_AUTHOR) reviewers.push(new GemmaBlindReviewer({ apiKey: key }))
  return new ReplenishQuestionBankUseCase({
    bank: repo.questions,
    topics: new CatalogTopicContext(new D1CatalogRepository(env?.DB), repo.concepts),
    author,
    reviewers,
    screener: key && !env?.QUESTION_AUTHOR ? new GemmaDraftScreener({ apiKey: key }) : undefined,
    semantic: getSemanticService(env),
  })
}

const historyOf = (env: Env | undefined) => (env?.DB ? new D1StudyHistory(env.DB) : undefined)

/** History-first plan; later slots are generated in the background when AI drafting is configured. */
export function getSessionCreator(env: Env | undefined, repo: StudyRepository): CreateStudySessionUseCase {
  return new CreateStudySessionUseCase({
    repo,
    bank: repo.questions,
    history: historyOf(env),
    canGenerate: !!(env?.QUESTION_AUTHOR || env?.GEMINI_API_KEY),
    semantic: getSemanticService(env),
  })
}

/** gemini-3.8-flash drafts and reviews; Gemma screens and cross-reviews when a key is set. */
export function getPrepareUseCase(env: Env | undefined, repo: StudyRepository): PrepareSessionQuestionsUseCase {
  return new PrepareSessionQuestionsUseCase({
    sessions: repo.sessions, bank: repo.questions, history: historyOf(env), replenish: getReplenisher(env, repo),
  })
}
