// src/domain/models/QuestionPlanning.ts

export interface QuestionHistoryEntry {
  readonly questionId: string
  readonly topicId: string
  readonly isCorrect: boolean
  readonly hintUsed: boolean
  readonly answeredAt: string
}

export interface PlannableQuestion {
  readonly id: string
  readonly topicId: string
}

export interface SessionPlan {
  readonly questionIds: string[]
  /** Planned questions never answered before. */
  readonly freshCount: number
}

function hashFnv1a(text: string): number {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const shuffled = [...items]
  let state = hashFnv1a(seed) || 1
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function needsReview(entry: QuestionHistoryEntry): boolean {
  return !entry.isCorrect || entry.hintUsed
}

/** Fresh first, then wrong or hinted answers, then correct answers; older results come back first. */
export function planSessionQuestions<Q extends PlannableQuestion>(
  pool: readonly Q[],
  history: readonly QuestionHistoryEntry[],
  count: number,
  shuffleSeed: string,
  /** Similarity of fresh questions to recent review questions; higher comes first. */
  freshBoost?: ReadonlyMap<string, number>,
): SessionPlan {
  const latest = new Map<string, QuestionHistoryEntry>()
  for (const entry of history) {
    const known = latest.get(entry.questionId)
    if (!known || known.answeredAt < entry.answeredAt) latest.set(entry.questionId, entry)
  }
  const byOldest = (a: Q, b: Q) => latest.get(a.id)!.answeredAt.localeCompare(latest.get(b.id)!.answeredAt) || a.id.localeCompare(b.id)
  const boost = (q: Q) => freshBoost?.get(q.id) ?? 0
  const fresh = seededShuffle(pool.filter((q) => !latest.has(q.id)), shuffleSeed).sort((a, b) => boost(b) - boost(a))
  const answered = pool.filter((q) => latest.has(q.id))
  const review = answered.filter((q) => needsReview(latest.get(q.id)!)).sort(byOldest)
  const mastered = answered.filter((q) => !needsReview(latest.get(q.id)!)).sort(byOldest)
  const questionIds = [...fresh, ...review, ...mastered].slice(0, count).map((q) => q.id)
  return { questionIds, freshCount: Math.min(fresh.length, count) }
}
