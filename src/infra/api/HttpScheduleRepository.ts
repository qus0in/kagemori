import ky from 'ky'
import { Schedule } from '../../domain/models/Schedule.ts'
import type { ScheduleRepository } from '../../domain/ports/ScheduleRepository.ts'
import type { CachePort } from '../../domain/ports/CachePort.ts'
import { createComponentLogger } from '../logger/logger.ts'
import { LruCacheAdapter } from '../cache/LruCacheAdapter.ts'
import { mapApiToSchedule, type ApiScheduleResponse } from './HttpScheduleTypes.ts'

export class HttpScheduleRepository implements ScheduleRepository {
  private readonly endpoint: string
  private readonly client: typeof ky
  private readonly cache: CachePort<Schedule>
  private readonly log = createComponentLogger('HttpScheduleRepository')

  constructor(
    endpoint: string = '/api/schedule',
    client: typeof ky = ky,
    cache: CachePort<Schedule> = new LruCacheAdapter<Schedule>({ max: 50, defaultTtlMs: 30000 }),
  ) {
    this.endpoint = endpoint
    this.client = client
    this.cache = cache
  }

  public async getSchedule(): Promise<Schedule> {
    const cached = this.cache.get(this.endpoint)
    if (cached) {
      this.log.info({ endpoint: this.endpoint }, 'Returning schedule from LRU cache')
      return cached
    }

    this.log.info({ endpoint: this.endpoint }, 'Fetching schedule from API via ky')
    try {
      const data = await this.client
        .get(this.endpoint, {
          retry: { limit: 2, methods: ['get'] },
          timeout: 5000,
        })
        .json<ApiScheduleResponse>()

      const schedule = mapApiToSchedule(data)
      this.cache.set(this.endpoint, schedule)
      this.log.info({ round: data.round, itemsCount: data.items.length }, 'Schedule cached and returned')
      return schedule
    } catch (err) {
      this.log.error({ err }, 'Failed to fetch schedule from API via ky')
      throw err
    }
  }
}
