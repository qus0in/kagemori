import type { SessionPurpose } from '../../domain/models/PracticeSession.ts'
import { withStorageDeadline } from '../storage/withStorageDeadline.ts'

export interface SessionMetaKv {
  sessionId: string
  purpose: SessionPurpose
  targetCount: number
  createdAt: number
}
export interface CloudflareKvBinding {
  get(key: string, type?: 'text' | 'json'): Promise<unknown>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
}

// Optional, immutable metadata only. Never an authority for answers or progress.
export class KvSessionCache {
  private readonly kv?: CloudflareKvBinding
  constructor(kv?: CloudflareKvBinding) { this.kv = kv }

  async saveSessionMeta(meta: SessionMetaKv): Promise<void> {
    if (!this.kv) return
    try {
      await withStorageDeadline(this.kv.put(`session:${meta.sessionId}`, JSON.stringify(meta), {
        expirationTtl: 60 * 60 * 24 * 7,
      }), 'KV', 1000)
    } catch (error) {
      console.warn('Optional session metadata cache unavailable', { service: 'KV', error: String(error) })
    }
  }
}
