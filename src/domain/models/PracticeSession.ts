// src/domain/models/PracticeSession.ts
import type { Attempt } from './Attempt.ts'
import type {
  SessionPurpose,
  PracticeSessionProps,
  RecordAttemptInput,
  SessionSummary,
} from './PracticeSessionTypes.ts'
import { initSessionState, type SessionState } from './PracticeSessionInit.ts'
import { executeRecordAttempt } from './PracticeSessionRecorder.ts'
import { replaceableSlots, type GenerationPlan, type GenerationStatus } from './SessionGeneration.ts'
import {
  countCorrect,
  countFirstTry,
  computeAccuracy,
  buildSessionSummary,
} from './PracticeSessionMetrics.ts'

export type { SessionPurpose }

export class PracticeSession {
  private readonly _state: SessionState

  constructor(p: PracticeSessionProps) {
    this._state = initSessionState(p)
  }

  public get sessionId(): string { return this._state.sessionId }
  public get learnerId(): string { return this._state.learnerId }
  public get purpose(): SessionPurpose { return this._state.purpose }
  public get blueprintId(): string { return this._state.blueprintId }
  public get targetQuestionCount(): number { return this._state.targetCount }
  public get currentQuestionIndex(): number { return this._state.currentIndex }
  public get questionIds(): readonly string[] | undefined { return this._state.questionIds }
  public get generation(): GenerationPlan | undefined { return this._state.generation }
  public get attempts(): readonly Attempt[] { return Object.freeze([...this._state.attempts]) }
  public get isCompleted(): boolean { return this._state.isCompleted }
  public get correctCount(): number { return countCorrect(this._state.attempts) }
  public get firstTryCorrectCount(): number { return countFirstTry(this._state.attempts) }
  public get accuracyPercentage(): number { return computeAccuracy(this._state.attempts) }
  public getSummary(): SessionSummary { return buildSessionSummary(this) }
  public allowsHint(): boolean { return this.purpose === 'IMPROVEMENT' }
  public isBlueprintDistributionEnforced(): boolean { return this.purpose === 'MOCK_EXAM' }
  public allowsAdaptiveSelection(): boolean { return this.purpose === 'IMPROVEMENT' }

  public recordAttempt(input: RecordAttemptInput): Attempt {
    return executeRecordAttempt(this._state, input, this.allowsHint())
  }

  public setGenerationStatus(status: GenerationStatus): void {
    if (this._state.generation) this._state.generation = { ...this._state.generation, status }
  }

  /** Marks a generation slot as served with its fallback so later AI output never replaces it. */
  public lockGenerationSlot(index: number): void {
    const plan = this._state.generation
    if (plan) this._state.generation = { ...plan, lockedIndex: Math.max(plan.lockedIndex, index) }
  }

  /** Fills unserved, unlocked slots with new questions; returns how many were placed. */
  public applyGeneratedQuestions(ids: readonly string[]): number {
    const plan = this._state.generation
    const planned = this._state.questionIds
    if (!plan || !planned) return 0
    const fresh = ids.filter((id) => !planned.includes(id))
    const slots = replaceableSlots(plan, this._state.attempts.length).slice(0, fresh.length)
    slots.forEach((slot, i) => { planned[slot] = fresh[i] })
    this.setGenerationStatus(slots.length ? 'done' : 'failed')
    return slots.length
  }
}
