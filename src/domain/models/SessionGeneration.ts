// src/domain/models/SessionGeneration.ts

export type GenerationStatus = 'pending' | 'running' | 'done' | 'failed'

/** Slots [from, until) start with fallback questions and may be swapped for new AI questions. */
export interface GenerationPlan {
  readonly status: GenerationStatus
  readonly from: number
  readonly until: number
  /** After this instant, waiting learners get the fallback question. */
  readonly deadline: string
  /** Highest slot served with its fallback while generation was unfinished; never replaced. */
  readonly lockedIndex: number
}

export const GENERATION_WAIT_MS = 75_000
export const FIRST_GENERATED_SLOT = 2

export type NextSlot =
  | { readonly kind: 'completed' }
  | { readonly kind: 'question'; readonly questionId: string }
  | { readonly kind: 'preparing'; readonly remainingMs: number }
  /** Serve the fallback, locking the slot first. */
  | { readonly kind: 'fallback'; readonly questionId: string; readonly index: number }

export const isGenerating = (plan?: GenerationPlan) => plan?.status === 'pending' || plan?.status === 'running'

export function resolveNextSlot(
  questionIds: readonly string[], answered: number, plan: GenerationPlan | undefined, now: number, useExisting: boolean,
): NextSlot {
  if (answered >= questionIds.length) return { kind: 'completed' }
  const questionId = questionIds[answered]
  if (!plan || !isGenerating(plan) || answered < plan.from || answered >= plan.until || answered <= plan.lockedIndex) {
    return { kind: 'question', questionId }
  }
  const remainingMs = Date.parse(plan.deadline) - now
  if (remainingMs > 0 && !useExisting) return { kind: 'preparing', remainingMs }
  return { kind: 'fallback', questionId, index: answered }
}

/** Slots that were neither served nor locked, in order. */
export function replaceableSlots(plan: GenerationPlan, answered: number): number[] {
  const slots: number[] = []
  for (let i = Math.max(plan.from, answered, plan.lockedIndex + 1); i < plan.until; i++) slots.push(i)
  return slots
}

export function validGenerationPlan(plan: GenerationPlan, questionCount: number): boolean {
  return ['pending', 'running', 'done', 'failed'].includes(plan.status) &&
    Number.isInteger(plan.from) && Number.isInteger(plan.until) && Number.isInteger(plan.lockedIndex) &&
    plan.from >= FIRST_GENERATED_SLOT && plan.from < plan.until && plan.until <= questionCount &&
    plan.lockedIndex >= -1 && plan.lockedIndex < plan.until && Number.isFinite(Date.parse(plan.deadline))
}
