import { LRUCache } from 'lru-cache'
import type { CachePort } from '../../domain/ports/CachePort.ts'
import { createComponentLogger } from '../logger/logger.ts'

export interface LruCacheOptions {
  max?: number
  defaultTtlMs?: number
}

export class LruCacheAdapter<T extends {} = any> implements CachePort<T> {
  private readonly cache: LRUCache<string, T>
  private readonly defaultTtlMs: number
  private readonly log = createComponentLogger('LruCacheAdapter')

  constructor(options: LruCacheOptions = {}) {
    const max = options.max ?? 100
    this.defaultTtlMs = options.defaultTtlMs ?? 60000

    this.cache = new LRUCache<string, T>({
      max,
      ttl: this.defaultTtlMs,
    })
  }

  public get(key: string): T | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      this.log.debug({ key }, 'LRU Cache HIT')
      return value
    }
    this.log.debug({ key }, 'LRU Cache MISS')
    return undefined
  }

  public set(key: string, value: T, ttlMs?: number): void {
    this.cache.set(key, value, {
      ttl: ttlMs ?? this.defaultTtlMs,
    })
    this.log.debug({ key, ttlMs: ttlMs ?? this.defaultTtlMs }, 'LRU Cache SET')
  }

  public has(key: string): boolean {
    return this.cache.has(key)
  }

  public clear(): void {
    this.cache.clear()
    this.log.debug('LRU Cache CLEARED')
  }
}
