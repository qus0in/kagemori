export interface CachePort<T> {
  get(key: string): T | undefined
  set(key: string, value: T, ttlMs?: number): void
  has(key: string): boolean
  clear(): void
}
