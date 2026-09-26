import type { ErrorHandler } from 'hono'
import type { Env } from './types.ts'
import { SessionConflictError, StorageUnavailableError } from '../src/domain/models/StorageErrors.ts'

export const storageErrorHandler: ErrorHandler<{ Bindings: Env }> = (error, c) => {
  const requestId = c.req.header('cf-ray') ?? crypto.randomUUID()
  console.error('Request failed', { requestId, path: c.req.path, name: error.name, message: error.message })
  c.header('Cache-Control', 'no-store')
  if (error instanceof SessionConflictError) {
    return c.json({ code: 'SESSION_CONFLICT', error: '다른 요청에서 풀이가 갱신됐어요. 다시 불러와 주세요.', requestId }, 409)
  }
  if (error instanceof StorageUnavailableError) {
    c.header('Retry-After', '2')
    return c.json({ code: 'STORAGE_UNAVAILABLE', error: '저장소 연결이 지연되고 있어요. 잠시 후 다시 시도해 주세요.', requestId }, 503)
  }
  return c.json({ code: 'INTERNAL_ERROR', error: '요청을 처리하지 못했어요.', requestId }, 500)
}
