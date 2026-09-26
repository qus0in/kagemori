// worker/types.ts
import type { D1Database } from '@cloudflare/workers-types'
import type { StudyRepository } from '../src/domain/ports/StudyRepository.ts'
import type { AiExplanationPort } from '../src/domain/ports/AiExplanationPort.ts'
import { InMemoryStudyRepository } from '../src/infra/study/InMemoryStudyRepository.ts'
import {
  DurableObjectSessionRepository,
  type DurableObjectNamespaceLike,
  type BackgroundTask,
} from '../src/infra/study/DurableObjectSessionRepository.ts'
import type { CloudflareKvBinding } from '../src/infra/study/KvSessionCache.ts'
import { GeminiAiAdapter } from '../src/infra/ai/GeminiAiAdapter.ts'
import { KvAiResponseCache } from '../src/infra/ai/KvAiResponseCache.ts'
import { StorageUnavailableError } from '../src/domain/models/StorageErrors.ts'
import type { QuestionAuthoringPort } from '../src/domain/ports/QuestionBankPorts.ts'
import { D1QuestionBank } from '../src/infra/d1/D1QuestionBank.ts'

export type Env = {
  STORAGE_MODE?: 'persistent' | 'local'
  DB?: D1Database
  GEMINI_API_KEY?: string
  STUDY_SESSION_DO?: DurableObjectNamespaceLike
  KAGEMORI_KV?: CloudflareKvBinding
  STUDY_REPO?: StudyRepository
  AI_ADAPTER?: AiExplanationPort
  QUESTION_AUTHOR?: QuestionAuthoringPort
}

let defaultStudyRepo: InMemoryStudyRepository | null = null

export function getStudyRepo(env?: Env, background?: BackgroundTask): StudyRepository {
  if (env?.STUDY_REPO) {
    return env.STUDY_REPO
  }
  if (env?.STORAGE_MODE === 'persistent' && !env.DB) throw new StorageUnavailableError('D1 binding')
  if (env?.STUDY_SESSION_DO) {
    const doRepo = new DurableObjectSessionRepository(env.STUDY_SESSION_DO, env.KAGEMORI_KV, background)
    return new InMemoryStudyRepository(doRepo, env.DB ? new D1QuestionBank(env.DB) : undefined)
  }
  if (env?.STORAGE_MODE === 'persistent' || (env?.STORAGE_MODE !== 'local' && (env?.DB || env?.KAGEMORI_KV))) {
    throw new StorageUnavailableError('DO binding')
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
  const cache = env?.KAGEMORI_KV ? new KvAiResponseCache(env.KAGEMORI_KV) : undefined
  return new GeminiAiAdapter({ apiKey: env?.GEMINI_API_KEY, cache })
}
