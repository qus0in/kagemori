// src/infra/cache/KvDiagramCache.ts
import type { DiagramContent } from '../../domain/models/DiagramContent.ts'
import type { DiagramCache } from '../../domain/ports/SemanticPorts.ts'
import type { CloudflareKvBinding } from '../study/KvSessionCache.ts'
import { withStorageDeadline } from '../storage/withStorageDeadline.ts'

/** Permanent structured diagrams and image pointers; failures only cost a regeneration. */
export class KvDiagramCache implements DiagramCache {
  private readonly kv: CloudflareKvBinding
  constructor(kv: CloudflareKvBinding) { this.kv = kv }

  async get(key: string): Promise<DiagramContent | null> {
    try {
      const value = await withStorageDeadline(this.kv.get(key, 'json'), 'KV', 2000) as DiagramContent | null
      return value && ['mermaid', 'table', 'image'].includes(value.kind) ? value : null
    } catch (error) {
      console.warn('Diagram cache read failed', { service: 'KV', error: String(error) })
      return null
    }
  }

  async put(key: string, content: DiagramContent): Promise<void> {
    try {
      await withStorageDeadline(this.kv.put(key, JSON.stringify(content)), 'KV', 3000)
    } catch (error) {
      console.warn('Diagram cache write failed', { service: 'KV', error: String(error) })
    }
  }
}
