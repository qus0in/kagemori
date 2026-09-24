import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { LruCacheAdapter } from '../../../src/infra/cache/LruCacheAdapter.ts'

describe('[Integration / Infra] Feature: LruCacheAdapter using lru-cache', () => {
  describe('Scenario: Setting and getting cached entries', () => {
    it('Given a key and value, When set and retrieved, Then returns the cached value', () => {
      // Given
      const cache = new LruCacheAdapter<string>({ max: 5, defaultTtlMs: 1000 })

      // When
      cache.set('foo', 'bar')

      // Then
      assert.equal(cache.has('foo'), true)
      assert.equal(cache.get('foo'), 'bar')
    })

    it('Given max capacity is exceeded, When new item is added, Then evicts least recently used item', () => {
      // Given
      const cache = new LruCacheAdapter<number>({ max: 2, defaultTtlMs: 5000 })
      cache.set('a', 1)
      cache.set('b', 2)

      // When adding 3rd item
      cache.set('c', 3)

      // Then 'a' should be evicted
      assert.equal(cache.has('a'), false)
      assert.equal(cache.get('b'), 2)
      assert.equal(cache.get('c'), 3)
    })

    it('Given cache is cleared, When checking items, Then all items are removed', () => {
      // Given
      const cache = new LruCacheAdapter<string>()
      cache.set('key', 'val')

      // When
      cache.clear()

      // Then
      assert.equal(cache.has('key'), false)
      assert.equal(cache.get('key'), undefined)
    })
  })
})
