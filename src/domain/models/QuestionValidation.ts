// src/domain/models/QuestionValidation.ts
import type { QuestionProps } from './QuestionTypes.ts'

export function validateQuestionProps(props: QuestionProps): void {
  if (!props.id || props.id.trim() === '') {
    throw new Error('Question id cannot be empty.')
  }
  if (!props.prompt || props.prompt.trim() === '') {
    throw new Error('Question prompt cannot be empty.')
  }
  if (props.options.length !== 4) {
    throw new Error(`A question must have exactly 4 options, received ${props.options.length}.`)
  }
  for (const opt of props.options) {
    if (!opt.text || opt.text.trim() === '') {
      throw new Error(`Option "${opt.id}" cannot have empty text.`)
    }
  }
  const optionIds = new Set(props.options.map((opt) => opt.id))
  if (optionIds.size !== 4) {
    throw new Error('Question options must have unique IDs.')
  }
  if (!optionIds.has(props.correctOptionId)) {
    throw new Error(`correctOptionId "${props.correctOptionId}" must match one of the 4 options.`)
  }
}
