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
    baseUrl: string = '/api/catalog',
    client: typeof ky = ky,
    cache: CachePort<object> = new LruCacheAdapter<object>({ max: 50, defaultTtlMs: 60000 }),
  ) {
    this.baseUrl = baseUrl
    this.client = client
    this.cache = cache
  }

  public async getOverview(): Promise<CatalogOverview> {
    const key = `${this.baseUrl}/overview`
    const cached = this.cache.get(key) as CatalogOverview | undefined
    if (cached) {
      return cached
    }

    try {
      const data = await this.client
        .get(key, { retry: { limit: 2, methods: ['get'] }, timeout: 5000 })
        .json<CatalogOverview>()

      this.cache.set(key, data)
      return data
    } catch (err) {
      this.log.error({ err }, 'Failed to fetch catalog overview')
      throw err
    }
  }

  public async getBooks(): Promise<BookCatalog[]> {
    const key = `${this.baseUrl}/books`
    const cached = this.cache.get(key) as BookCatalog[] | undefined
    if (cached) {
      return cached
    }

    try {
      const data = await this.client
        .get(key, { retry: { limit: 2, methods: ['get'] }, timeout: 5000 })
        .json<BookCatalog[]>()

      this.cache.set(key, data)
      return data
    } catch (err) {
      this.log.error({ err }, 'Failed to fetch books catalog')
      throw err
    }
  }

  public async getBookById(id: string): Promise<BookCatalog | null> {
    const key = `${this.baseUrl}/books/${id}`
    const cached = this.cache.get(key) as BookCatalog | null | undefined
    if (cached !== undefined) {
      return cached
    }

    try {
      const data = await this.client
        .get(key, { retry: { limit: 2, methods: ['get'] }, timeout: 5000 })
        .json<BookCatalog | null>()

      if (data) {
        this.cache.set(key, data)
      }
      return data
    } catch (err) {
      this.log.error({ err, id }, 'Failed to fetch book by id')
      throw err
    }
  }

  public async getExamBlueprint(): Promise<ExamBlueprint> {
    const key = `${this.baseUrl}/blueprint`
    const cached = this.cache.get(key) as ExamBlueprint | undefined
    if (cached) {
      return cached
    }

    try {
      const data = await this.client
        .get(key, { retry: { limit: 2, methods: ['get'] }, timeout: 5000 })
        .json<ExamBlueprint>()

      this.cache.set(key, data)
      return data
    } catch (err) {
      this.log.error({ err }, 'Failed to fetch exam blueprint')
      throw err
    }
  }
}
