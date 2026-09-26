// worker/types.ts
import type { D1Database } from '@cloudflare/workers-types'
import type { StudyRepository } from '../src/domain/ports/StudyRepository.ts'
import type { AiExplanationPort } from '../src/domain/ports/AiExplanationPort.ts'
import { InMemoryStudyRepository } from '../src/infra/study/InMemoryStudyRepository.ts'
import {
  DurableObjectSessionRepository,
  type DurableObjectNamespaceLike,
} from '../src/infra/study/DurableObjectSessionRepository.ts'
import type { CloudflareKvBinding } from '../src/infra/study/KvSessionCache.ts'
import { GeminiAiAdapter } from '../src/infra/ai/GeminiAiAdapter.ts'

export type Env = {
  DB?: D1Database
  GEMINI_API_KEY?: string
  STUDY_SESSION_DO?: DurableObjectNamespaceLike
  KAGEMORI_KV?: CloudflareKvBinding
  STUDY_REPO?: StudyRepository
  AI_ADAPTER?: AiExplanationPort
}

let defaultStudyRepo: InMemoryStudyRepository | null = null

export function getStudyRepo(env?: Env): StudyRepository {
  if (env?.STUDY_REPO) {
    return env.STUDY_REPO
  }
  if (env?.STUDY_SESSION_DO || env?.KAGEMORI_KV) {
    const doRepo = new DurableObjectSessionRepository(env.STUDY_SESSION_DO, env.KAGEMORI_KV)
    return new InMemoryStudyRepository(doRepo)
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
