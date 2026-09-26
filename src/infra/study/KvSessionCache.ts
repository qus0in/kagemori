// src/infra/study/KvSessionCache.ts
import type { SessionPurpose } from '../../domain/models/PracticeSession.ts'

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

export class KvSessionCache {
  private kv?: CloudflareKvBinding
  private readonly defaultTtlSeconds = 60 * 60 * 24 * 7 // 7 days

  constructor(kv?: CloudflareKvBinding) {
    this.kv = kv
  }

  async getSessionMeta(sessionId: string): Promise<SessionMetaKv | null> {
    if (!this.kv) return null
    try {
      const data = await this.kv.get(`session:${sessionId}`, 'json')
      return (data as SessionMetaKv) ?? null
    } catch {
      return null
    }
  }

  async saveSessionMeta(meta: SessionMetaKv): Promise<void> {
    if (!this.kv) return
    try {
      await this.kv.put(`session:${meta.sessionId}`, JSON.stringify(meta), {
        expirationTtl: this.defaultTtlSeconds,
      })
    } catch {
      // Graceful fallback on KV failure
    }
  }

  async removeSessionMeta(sessionId: string): Promise<void> {
    if (!this.kv) return
    try {
      await this.kv.delete(`session:${sessionId}`)
    } catch {
      // Graceful fallback
    }
  }
}
