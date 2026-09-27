// src/app/usecases/BlindReviewPanel.ts
import type { QuestionDraft } from '../../domain/models/GeneratedQuestion.ts'
import type { AuthoringRequest, BlindReviewPort, QuestionReview } from '../../domain/ports/QuestionBankPorts.ts'

export interface PanelVerdict {
  /** Models whose review arrived; recorded with each stored question. */
  readonly models: string[]
  passed(index: number, draft: QuestionDraft): boolean
  notes(index: number): string
}

type Warn = (message: string, detail: Record<string, unknown>) => void

/**
 * Runs reviewers in parallel. The first (primary) reviewer must answer; others add
 * independent cross-checks when available. A draft passes only if every responding
 * reviewer approves it and solved it to the drafted answer.
 */
export async function runBlindReviews(
  reviewers: readonly BlindReviewPort[],
  drafts: readonly QuestionDraft[],
  request: AuthoringRequest,
  warn: Warn,
): Promise<PanelVerdict> {
  const settled = await Promise.allSettled(reviewers.map((reviewer) => reviewer.review(drafts, request)))
  if (settled[0]?.status !== 'fulfilled') throw settled[0]?.reason ?? new Error('No primary reviewer')
  const responded: { model: string; reviews: QuestionReview[] }[] = []
  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') responded.push({ model: reviewers[i].model, reviews: result.value })
    else warn('Secondary question reviewer unavailable', { model: reviewers[i].model, error: String(result.reason) })
  })
  const find = (reviews: QuestionReview[], index: number) => reviews.find((review) => review.index === index)
  return {
    models: responded.map((r) => r.model),
    passed: (index, draft) => responded.every(({ reviews }) => {
      const review = find(reviews, index)
      return !!review && review.approved && review.solvedIndex === draft.correctIndex
    }),
    notes: (index) => responded.map(({ model, reviews }) => {
      const issues = find(reviews, index)?.issues
      return issues ? `${model}: ${issues}` : ''
    }).filter(Boolean).join(' / '),
  }
}
