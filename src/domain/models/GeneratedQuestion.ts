// src/domain/models/GeneratedQuestion.ts
import { Concept } from './Concept.ts'
import { Question } from './Question.ts'
import type { Difficulty, QuestionType } from './QuestionTypes.ts'
import { seededShuffle } from './QuestionPlanning.ts'

export const GENERATED_QUESTION_PREFIX = 'gq-'
const GENERATED_CONCEPT_PREFIX = 'gc-'

export interface QuestionDraft {
  readonly topicId: string
  readonly chapterId: string
  readonly type: QuestionType
  readonly difficulty: Difficulty
  readonly prompt: string
  readonly options: readonly string[]
  readonly correctIndex: number
  readonly explanation: string
  /** Law, theory or formula the question relies on; grounds hints and explanations. */
  readonly basis: string
}

export interface GeneratedQuestionRecord {
  readonly question: Question
  readonly topicTitle: string
  readonly basis: string
  readonly generatorModel: string
  readonly reviewerModel: string
  readonly reviewNotes: string
  readonly createdAt: string
}

export const isGeneratedQuestionId = (id: string) => id.startsWith(GENERATED_QUESTION_PREFIX)
export const isGeneratedConceptId = (id: string) => id.startsWith(GENERATED_CONCEPT_PREFIX)
export const questionIdOfConcept = (conceptId: string) =>
  GENERATED_QUESTION_PREFIX + conceptId.slice(GENERATED_CONCEPT_PREFIX.length)
export const conceptIdOfQuestion = (questionId: string) =>
  GENERATED_CONCEPT_PREFIX + questionId.slice(GENERATED_QUESTION_PREFIX.length)

export function normalizePrompt(text: string): string {
  return text.replace(/\s+/g, '').replace(/[.,?!·'"“”‘’()]/g, '').toLowerCase()
}

/** Shuffles options so the model's answer position carries no signal. */
export function buildGeneratedQuestion(draft: QuestionDraft, id: string): Question {
  const options = draft.options.map((text, index) => ({ text, correct: index === draft.correctIndex }))
  const shuffled = seededShuffle(options, id).map((option, index) => ({ ...option, id: `${id}-o${index + 1}` }))
  return new Question({
    id, version: 1, topicId: draft.topicId, chapterId: draft.chapterId, type: draft.type,
    difficulty: draft.difficulty, status: 'REVIEWED', prompt: draft.prompt.trim(),
    options: shuffled.map(({ id: optionId, text }) => ({ id: optionId, text: text.trim() })),
    correctOptionId: shuffled.find((option) => option.correct)!.id,
    explanation: draft.explanation.trim(),
    conceptId: conceptIdOfQuestion(id),
    sourceId: '',
  })
}

export function generatedConcept(record: GeneratedQuestionRecord): Concept {
  const { question } = record
  return new Concept({
    conceptId: question.conceptId, topicId: question.topicId, chapterId: question.chapterId,
    title: `${record.topicTitle} 핵심 근거`, body: record.basis, status: 'REVIEWED',
    version: 1, sourceId: '', locator: 'AI 출제·검수 문항',
  })
}
