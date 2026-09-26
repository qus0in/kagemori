// src/infra/ai/KvAiResponseCache.ts
import type { CloudflareKvBinding } from '../study/KvSessionCache.ts'
import { withStorageDeadline } from '../storage/withStorageDeadline.ts'

export interface AiResponseCache {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

const TTL_SECONDS = 60 * 60 * 24 * 30

export async function aiCacheKey(model: string, maxTokens: number, prompt: string): Promise<string> {
  const data = new TextEncoder().encode(`${model}\n${maxTokens}\n${prompt}`)
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', data))
  return `ai:${Array.from(digest, (b) => b.toString(16).padStart(2, '0')).join('')}`
}

// Best-effort cost saver: failures never block AI generation or the response.
export class KvAiResponseCache implements AiResponseCache {
  private readonly kv: CloudflareKvBinding
  constructor(kv: CloudflareKvBinding) { this.kv = kv }

  async get(key: string): Promise<string | null> {
    try {
      const value = await withStorageDeadline(this.kv.get(key, 'text'), 'KV', 1000)
      return typeof value === 'string' && value ? value : null
    } catch (error) {
      console.warn('AI response cache read failed', { service: 'KV', error: String(error) })
      return null
    }
  }

  async put(key: string, value: string): Promise<void> {
    try {
      await withStorageDeadline(this.kv.put(key, value, { expirationTtl: TTL_SECONDS }), 'KV', 1000)
    } catch (error) {
      console.warn('AI response cache write failed', { service: 'KV', error: String(error) })
    }
  }
}
