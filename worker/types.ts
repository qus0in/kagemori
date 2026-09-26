// worker/types.ts
import type { D1Database } from '@cloudflare/workers-types'
import type { StudyRepository } from '../src/domain/ports/StudyRepository.ts'
import type { AiExplanationPort } from '../src/domain/ports/AiExplanationPort.ts'
import { InMemoryStudyRepository } from '../src/infra/study/InMemoryStudyRepository.ts'
import { GeminiAiAdapter } from '../src/infra/ai/GeminiAiAdapter.ts'

export type Env = {
  DB?: D1Database
  GEMINI_API_KEY?: string
  STUDY_REPO?: StudyRepository
  AI_ADAPTER?: AiExplanationPort
}

let defaultStudyRepo: InMemoryStudyRepository | null = null

export function getStudyRepo(env?: Env): StudyRepository {
  if (env?.STUDY_REPO) {
    return env.STUDY_REPO
  }
  if (!defaultStudyRepo) {
    defaultStudyRepo = new InMemoryStudyRepository()
  }
  return defaultStudyRepo
}

export function resetDefaultStudyRepo(): void {
  defaultStudyRepo = null
}

export function getAiAdapter(env?: Env): AiExplanationPort {
  if (env?.AI_ADAPTER) {
    return env.AI_ADAPTER
  }
  return new GeminiAiAdapter({ apiKey: env?.GEMINI_API_KEY })
}
