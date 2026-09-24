import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ScheduleDDayResultDto } from '../../app/dto/ScheduleDDayDto.ts'
import { GetScheduleWithDDayUseCase } from '../../app/usecases/GetScheduleWithDDayUseCase.ts'
import { HttpScheduleRepository } from '../../infra/api/HttpScheduleRepository.ts'
import { StaticScheduleRepository } from '../../infra/api/StaticScheduleRepository.ts'
import { KoreaTimeProvider } from '../../infra/time/KoreaTimeProvider.ts'
import { createComponentLogger } from '../../infra/logger/logger.ts'
import { useAppStore } from '../store/useAppStore.ts'

export interface UseScheduleDDayState {
  data: ScheduleDDayResultDto | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<unknown>
}

const log = createComponentLogger('useScheduleDDay')

export function useScheduleDDay(): UseScheduleDDayState {
  const timeProvider = useMemo(() => new KoreaTimeProvider(), [])
  const primaryRepo = useMemo(() => new HttpScheduleRepository(), [])
  const fallbackRepo = useMemo(() => new StaticScheduleRepository(), [])
  const setLastRefreshedAt = useAppStore((state) => state.setLastRefreshedAt)

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ScheduleDDayResultDto, Error>({
    queryKey: ['schedule-dday'],
    queryFn: async () => {
      log.info('Executing GetScheduleWithDDayUseCase query')
      try {
        const useCase = new GetScheduleWithDDayUseCase(primaryRepo, timeProvider)
        const result = await useCase.execute()
        setLastRefreshedAt(new Date().toLocaleTimeString('ko-KR'))
        return result
      } catch (primaryErr) {
        log.warn({ primaryErr }, 'Primary API fetch failed, falling back to static repository')
        const fallbackUseCase = new GetScheduleWithDDayUseCase(fallbackRepo, timeProvider)
        const fallbackResult = await fallbackUseCase.execute()
        setLastRefreshedAt(new Date().toLocaleTimeString('ko-KR'))
        return fallbackResult
      }
    },
    staleTime: 30000,
    refetchInterval: 10000, // Check and update every 10 seconds for midnight rollover
    refetchOnWindowFocus: true,
  })

  return {
    data: data ?? null,
    isLoading,
    error: queryError ? queryError.message : null,
    refetch,
  }
}
