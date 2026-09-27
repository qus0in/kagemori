// src/infra/storage/R2DiagramImageStore.ts
import type { DiagramImage, DiagramImageStore, StoredImage } from '../../domain/ports/SemanticPorts.ts'
import { withStorageDeadline } from './withStorageDeadline.ts'

/** Minimal slice of the Cloudflare R2 bucket binding. */
export interface R2BucketLike {
  head(key: string): Promise<unknown | null>
  put(key: string, value: ArrayBuffer | Uint8Array, options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }): Promise<unknown>
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>
}

export function decodeBase64(data: string): Uint8Array {
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** Generated diagram images kept permanently in R2 instead of KV/base64 payloads. */
export class R2DiagramImageStore implements DiagramImageStore {
  private readonly bucket: R2BucketLike
  constructor(bucket: R2BucketLike) { this.bucket = bucket }

  async has(key: string): Promise<boolean> {
    return (await withStorageDeadline(this.bucket.head(key), 'R2')) !== null
  }

  async put(key: string, image: DiagramImage): Promise<void> {
    await withStorageDeadline(this.bucket.put(key, decodeBase64(image.data), {
      httpMetadata: { contentType: image.mimeType, cacheControl: 'private, max-age=31536000, immutable' },
    }), 'R2', 10_000)
  }

  async get(key: string): Promise<StoredImage | null> {
    const object = await withStorageDeadline(this.bucket.get(key), 'R2')
    return object ? { mimeType: object.httpMetadata?.contentType ?? 'image/png', body: object.body } : null
  }
}
