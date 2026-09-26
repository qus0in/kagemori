import type { ScheduleDDayResultDto } from '../../app/dto/ScheduleDDayDto.ts'
import { GetScheduleWithDDayUseCase } from '../../app/usecases/GetScheduleWithDDayUseCase.ts'
import { HttpScheduleRepository } from '../../infra/api/HttpScheduleRepository.ts'
import { StaticScheduleRepository } from '../../infra/api/StaticScheduleRepository.ts'
import { KoreaTimeProvider } from '../../infra/time/KoreaTimeProvider.ts'
import { createComponentLogger } from '../../infra/logger/logger.ts'

const log = createComponentLogger('scheduleFetcher')

export async function fetchScheduleWithFallback(): Promise<ScheduleDDayResultDto> {
  const time = new KoreaTimeProvider()
  const primary = new HttpScheduleRepository()
  const fallback = new StaticScheduleRepository()
  log.info('Executing GetScheduleWithDDayUseCase')
  try {
    return await new GetScheduleWithDDayUseCase(primary, time).execute()
  } catch (primaryErr) {
    log.warn({ primaryErr }, 'Primary API fetch failed, falling back')
    return await new GetScheduleWithDDayUseCase(fallback, time).execute()
  }
}
