// src/infra/cache/KvDiagramCache.ts
import type { DiagramCache, DiagramImage } from '../../domain/ports/SemanticPorts.ts'
import type { CloudflareKvBinding } from '../study/KvSessionCache.ts'
import { withStorageDeadline } from '../storage/withStorageDeadline.ts'

/** Permanent per-question-version diagram cache; failures only cost a regeneration. */
export class KvDiagramCache implements DiagramCache {
  private readonly kv: CloudflareKvBinding
  constructor(kv: CloudflareKvBinding) { this.kv = kv }

  async get(key: string): Promise<DiagramImage | null> {
    try {
      const value = await withStorageDeadline(this.kv.get(key, 'json'), 'KV', 2000) as DiagramImage | null
      return value?.data && value.mimeType ? value : null
    } catch (error) {
      console.warn('Diagram cache read failed', { service: 'KV', error: String(error) })
      return null
    }
  }

  async put(key: string, image: DiagramImage): Promise<void> {
    try {
      await withStorageDeadline(this.kv.put(key, JSON.stringify(image)), 'KV', 3000)
    } catch (error) {
      console.warn('Diagram cache write failed', { service: 'KV', error: String(error) })
    }
  }
}
