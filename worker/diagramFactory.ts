// worker/diagramFactory.ts
import { GetQuestionDiagramUseCase } from '../src/app/usecases/GetQuestionDiagramUseCase.ts'
import type { StudyRepository } from '../src/domain/ports/StudyRepository.ts'
import { ModelDiagramRouter, GeminiStructuredDiagramAdapter } from '../src/infra/ai/TextDiagramModels.ts'
import { GeminiDiagramAdapter } from '../src/infra/ai/GeminiDiagramAdapter.ts'
import { KvDiagramCache } from '../src/infra/cache/KvDiagramCache.ts'
import { R2DiagramImageStore } from '../src/infra/storage/R2DiagramImageStore.ts'
import { InMemoryDiagramImageStore } from '../src/infra/storage/InMemoryDiagramImageStore.ts'
import type { Env } from './types.ts'

let localImages: InMemoryDiagramImageStore | null = null

/** Gemma 26B → Flash-Lite judge; 3.8 Flash writes Mermaid/tables; Nano Banana 2 images go to R2. */
export function getDiagramUseCase(env: Env | undefined, repo: StudyRepository): GetQuestionDiagramUseCase {
  const apiKey = env?.GEMINI_API_KEY
  const routers = env?.DIAGRAM_ROUTERS ?? (apiKey ? [
    new ModelDiagramRouter({ apiKey, model: 'gemma-4-26b-a4b-it' }, false),
    new ModelDiagramRouter({ apiKey, model: 'gemini-3.5-flash-lite' }, true),
  ] : [])
  const imageStore = env?.DIAGRAM_BUCKET
    ? new R2DiagramImageStore(env.DIAGRAM_BUCKET)
    : env?.STORAGE_MODE === 'persistent' ? undefined : (localImages ??= new InMemoryDiagramImageStore())
  return new GetQuestionDiagramUseCase({
    sessions: repo.sessions,
    questions: repo.questions,
    concepts: repo.concepts,
    routers,
    structured: env?.STRUCTURED_DIAGRAM ?? (apiKey ? new GeminiStructuredDiagramAdapter({ apiKey }) : undefined),
    image: env?.DIAGRAM_PORT ?? (apiKey ? new GeminiDiagramAdapter({ apiKey }) : undefined),
    imageStore,
    cache: env?.KAGEMORI_KV ? new KvDiagramCache(env.KAGEMORI_KV) : undefined,
  })
}

export function hasDiagramModels(env: Env | undefined): boolean {
  return !!(env?.GEMINI_API_KEY || env?.STRUCTURED_DIAGRAM || env?.DIAGRAM_PORT)
}
