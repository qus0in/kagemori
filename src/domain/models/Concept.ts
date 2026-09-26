// src/domain/models/Concept.ts
import { ConceptChunk, type ConceptChunkProps } from './ConceptChunk.ts'

export type ConceptStatus = 'DRAFT' | 'REVIEWED' | 'PUBLISHED'

export interface ConceptProps {
  readonly conceptId: string
  readonly topicId: string
  readonly chapterId: string
  readonly title: string
  readonly body: string
  readonly status: ConceptStatus
  readonly version: number
  readonly sourceId: string
  readonly locator: string
}

export class Concept implements ConceptProps {
  public readonly conceptId: string
  public readonly topicId: string
  public readonly chapterId: string
  public readonly title: string
  public readonly body: string
  public readonly status: ConceptStatus
  public readonly version: number
  public readonly sourceId: string
  public readonly locator: string

  constructor(props: ConceptProps) {
    if (!props.conceptId || props.conceptId.trim() === '') {
      throw new Error('Concept id cannot be empty.')
    }
    if (!props.title || props.title.trim() === '') {
      throw new Error('Concept title cannot be empty.')
    }
    if (!props.body || props.body.trim() === '') {
      throw new Error('Concept body cannot be empty.')
    }

    this.conceptId = props.conceptId
    this.topicId = props.topicId
    this.chapterId = props.chapterId
    this.title = props.title
    this.body = props.body
    this.status = props.status
    this.version = props.version
    this.sourceId = props.sourceId
    this.locator = props.locator
  }
}

export { ConceptChunk, type ConceptChunkProps }
