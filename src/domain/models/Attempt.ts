// src/domain/models/Attempt.ts

export interface AttemptProps {
  readonly attemptId: string
  readonly sessionId: string
  readonly questionId: string
  readonly firstAnswerOptionId: string
  readonly finalAnswerOptionId: string
  readonly isFirstCorrect: boolean
  readonly isFinalCorrect: boolean
  readonly hintUsed: boolean
  readonly durationMs: number
  readonly answeredAt: string
}

export class Attempt implements AttemptProps {
  public readonly attemptId: string
  public readonly sessionId: string
  public readonly questionId: string
  public readonly firstAnswerOptionId: string
  public readonly finalAnswerOptionId: string
  public readonly isFirstCorrect: boolean
  public readonly isFinalCorrect: boolean
  public readonly hintUsed: boolean
  public readonly durationMs: number
  public readonly answeredAt: string

  constructor(props: AttemptProps) {
    this.attemptId = props.attemptId
    this.sessionId = props.sessionId
    this.questionId = props.questionId
    this.firstAnswerOptionId = props.firstAnswerOptionId
    this.finalAnswerOptionId = props.finalAnswerOptionId
    this.isFirstCorrect = props.isFirstCorrect
    this.isFinalCorrect = props.isFinalCorrect
    this.hintUsed = props.hintUsed
    this.durationMs = Math.max(0, props.durationMs)
    this.answeredAt = props.answeredAt
  }
}
