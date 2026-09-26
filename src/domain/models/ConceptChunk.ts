// src/domain/models/ConceptChunk.ts

export interface ConceptChunkProps {
  readonly chunkId: string
  readonly conceptId: string
  readonly body: string
  readonly embedding: readonly number[]
  readonly hash: string
}

export class ConceptChunk implements ConceptChunkProps {
  public readonly chunkId: string
  public readonly conceptId: string
  public readonly body: string
  public readonly embedding: readonly number[]
  public readonly hash: string

  constructor(props: ConceptChunkProps) {
    if (!props.chunkId || props.chunkId.trim() === '') {
      throw new Error('Chunk id cannot be empty.')
    }
    if (!props.conceptId || props.conceptId.trim() === '') {
      throw new Error('Concept id cannot be empty for chunk.')
    }
    if (props.embedding.length === 0) {
      throw new Error('Embedding array cannot be empty.')
    }

    this.chunkId = props.chunkId
    this.conceptId = props.conceptId
    this.body = props.body
    this.embedding = Object.freeze([...props.embedding])
    this.hash = props.hash
  }
}
