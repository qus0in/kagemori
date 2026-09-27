// src/infra/storage/InMemoryDiagramImageStore.ts
import type { DiagramImage, DiagramImageStore, StoredImage } from '../../domain/ports/SemanticPorts.ts'
import { decodeBase64 } from './R2DiagramImageStore.ts'

/** Local/test stand-in for R2. */
export class InMemoryDiagramImageStore implements DiagramImageStore {
  private readonly images = new Map<string, { mimeType: string; bytes: Uint8Array }>()

  async has(key: string): Promise<boolean> { return this.images.has(key) }

  async put(key: string, image: DiagramImage): Promise<void> {
    this.images.set(key, { mimeType: image.mimeType, bytes: decodeBase64(image.data) })
  }

  async get(key: string): Promise<StoredImage | null> {
    const image = this.images.get(key)
    return image ? { mimeType: image.mimeType, body: image.bytes.slice().buffer } : null
  }
}
