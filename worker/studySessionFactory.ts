// worker/studySessionFactory.ts
import { CreateStudySessionUseCase } from '../src/app/usecases/CreateStudySessionUseCase.ts'
import { ReplenishQuestionBankUseCase } from '../src/app/usecases/ReplenishQuestionBankUseCase.ts'
import type { StudyRepository } from '../src/domain/ports/StudyRepository.ts'
import { D1StudyHistory } from '../src/infra/d1/D1StudyHistory.ts'
import { D1CatalogRepository } from '../src/infra/d1/D1CatalogRepository.ts'
import { GeminiQuestionAuthor } from '../src/infra/ai/GeminiQuestionAuthor.ts'
import { CatalogTopicContext } from '../src/infra/study/CatalogTopicContext.ts'
import type { Env } from './types.ts'

/** History-first planning; AI drafting + blind review only when a key (or test author) is configured. */
export function getSessionCreator(env: Env | undefined, repo: StudyRepository): CreateStudySessionUseCase {
  const author = env?.QUESTION_AUTHOR ?? (env?.GEMINI_API_KEY ? new GeminiQuestionAuthor({ apiKey: env.GEMINI_API_KEY }) : undefined)
  const replenish = author && new ReplenishQuestionBankUseCase({
    bank: repo.questions,
    topics: new CatalogTopicContext(new D1CatalogRepository(env?.DB), repo.concepts),
    author,
  })
  return new CreateStudySessionUseCase({
    repo,
    bank: repo.questions,
    history: env?.DB ? new D1StudyHistory(env.DB) : undefined,
    replenish,
  })
}
