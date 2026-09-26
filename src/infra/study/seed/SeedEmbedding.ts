// src/infra/study/seed/SeedEmbedding.ts

export function createDeterministicEmbedding(seed: number, dimension = 768): number[] {
  const vec = new Array<number>(dimension)
  let sumSq = 0
  for (let i = 0; i < dimension; i++) {
    const angle = (seed * 137.5 + i * 29.3) % 360
    const val = Math.sin((angle * Math.PI) / 180) + (i === seed % dimension ? 2.0 : 0)
    vec[i] = val
    sumSq += val * val
  }
  const norm = Math.sqrt(sumSq) || 1
  return vec.map((v) => v / norm)
}
