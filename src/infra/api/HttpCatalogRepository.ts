// src/infra/api/HttpCatalogRepository.ts
import ky from 'ky'
import type { BookCatalog, ExamBlueprint } from '../../domain/models/Catalog.ts'
import type { CatalogOverview, CatalogRepository } from '../../domain/ports/CatalogRepository.ts'
import type { CachePort } from '../../domain/ports/CachePort.ts'
import { createComponentLogger } from '../logger/logger.ts'
import { LruCacheAdapter } from '../cache/LruCacheAdapter.ts'

export class HttpCatalogRepository implements CatalogRepository {
  private readonly baseUrl: string
  private readonly client: typeof ky
  private readonly cache: CachePort<object>
  private readonly log = createComponentLogger('HttpCatalogRepository')

  constructor(
    baseUrl = '/api/catalog',
    client = ky,
    cache: CachePort<object> = new LruCacheAdapter({ max: 50, defaultTtlMs: 60000 }),
  ) {
    this.baseUrl = baseUrl
    this.client = client
    this.cache = cache
  }

  private async fetchCached<T extends object | null>(p: string, op: string): Promise<T> {
    const key = `${this.baseUrl}${p}`
    const cached = this.cache.get(key) as T | undefined
    if (cached) return cached

    try {
      const data = await this.client
        .get(key, { retry: { limit: 2, methods: ['get'] }, timeout: 5000 })
        .json<T>()
      if (data) this.cache.set(key, data)
      return data
    } catch (err) {
      this.log.error({ err, p }, `Failed to ${op}`)
      throw err
    }
  }

  public getOverview(): Promise<CatalogOverview> {
    return this.fetchCached('/overview', 'fetch catalog overview')
  }

  public getBooks(): Promise<BookCatalog[]> {
    return this.fetchCached('/books', 'fetch books catalog')
  }

  public getBookById(id: string): Promise<BookCatalog | null> {
    return this.fetchCached(`/books/${id}`, 'fetch book by id')
  }

  public getExamBlueprint(): Promise<ExamBlueprint> {
    return this.fetchCached('/blueprint', 'fetch exam blueprint')
  }
}
