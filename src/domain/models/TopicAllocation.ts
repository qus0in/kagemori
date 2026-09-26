// src/domain/models/TopicAllocation.ts
import { needsReview, type PlannableQuestion, type QuestionHistoryEntry } from './QuestionPlanning.ts'

export interface WeightedTopic {
  readonly id: string
  /** Blueprint question count for the topic. */
  readonly weight: number
}

export interface TopicAllocation {
  readonly topicId: string
  readonly count: number
}

/**
 * Assigns new questions to topics with large blueprint weight, few unanswered questions
 * and a high review rate. Each assignment lowers that topic's next score.
 */
export function allocateTopics(
  topics: readonly WeightedTopic[],
  pool: readonly PlannableQuestion[],
  history: readonly QuestionHistoryEntry[],
  count: number,
): TopicAllocation[] {
  const answered = new Set(history.map((entry) => entry.questionId))
  const stats = topics.filter((topic) => topic.weight > 0).map((topic) => {
    const results = history.filter((entry) => entry.topicId === topic.id)
    const reviewRate = results.length ? results.filter(needsReview).length / results.length : 0
    const fresh = pool.filter((q) => q.topicId === topic.id && !answered.has(q.id)).length
    return { topic, reviewRate, fresh, allocated: 0 }
  })
  const score = (s: (typeof stats)[number]) => s.topic.weight * (1 + s.reviewRate) / (1 + s.fresh + s.allocated)
  for (let i = 0; i < count && stats.length; i++) {
    const best = stats.reduce((top, s) => {
      const diff = score(s) - score(top)
      if (diff !== 0) return diff > 0 ? s : top
      return s.topic.weight > top.topic.weight || (s.topic.weight === top.topic.weight && s.topic.id < top.topic.id) ? s : top
    })
    best.allocated++
  }
  return stats.filter((s) => s.allocated > 0).map((s) => ({ topicId: s.topic.id, count: s.allocated }))
}
