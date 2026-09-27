// src/domain/models/MockExamPool.ts
import type { Question } from './Question.ts'
import { isGeneratedQuestionId } from './GeneratedQuestion.ts'
import { seededShuffle } from './QuestionPlanning.ts'

/** Share of a mock exam that fully verified AI questions may fill; tuned after validation. */
export const MOCK_EXAM_AI_MAX_RATIO = 0.4

/**
 * Non-generated questions plus a seeded sample of `VERIFIED` AI questions, capped as a
 * share of the target length. `REVIEWED` AI questions never enter a mock exam.
 */
export function selectMockExamPool(
  pool: readonly Question[], verifiedIds: ReadonlySet<string>, count: number, shuffleSeed: string,
): Question[] {
  const base = pool.filter((q) => !isGeneratedQuestionId(q.id))
  const allowed = Math.floor(count * MOCK_EXAM_AI_MAX_RATIO)
  const ai = seededShuffle(pool.filter((q) => verifiedIds.has(q.id)), shuffleSeed).slice(0, allowed)
  return [...base, ...ai]
}
