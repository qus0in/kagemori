import { StorageUnavailableError } from '../../domain/models/StorageErrors.ts'

export async function withStorageDeadline<T>(operation: Promise<T>, service: string, timeoutMs = 5000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new StorageUnavailableError(service)), timeoutMs)
      }),
    ])
  } finally {
    if (timer !== undefined) clearTimeout(timer)
  }
}
