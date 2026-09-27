// src/domain/models/VectorMath.ts

export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0
}

/** Text embedded for every question so seed and AI questions stay comparable. */
export function questionEmbeddingText(prompt: string, correctOptionText: string): string {
  return `${prompt.trim()}\n정답: ${correctOptionText.trim()}`
}
