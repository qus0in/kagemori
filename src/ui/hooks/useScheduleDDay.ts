import { useQuery } from '@tanstack/react-query'
import type { ScheduleDDayResultDto } from '../../app/dto/ScheduleDDayDto.ts'
import { useAppStore } from '../store/useAppStore.ts'
import { fetchScheduleWithFallback } from './scheduleFetcher.ts'

export interface UseScheduleDDayState {
  data: ScheduleDDayResultDto | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<unknown>
}

export function useScheduleDDay(): UseScheduleDDayState {
  const setLastRefreshedAt = useAppStore((state) => state.setLastRefreshedAt)

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ScheduleDDayResultDto, Error>({
    queryKey: ['schedule-dday'],
    queryFn: async () => {
      const result = await fetchScheduleWithFallback()
      setLastRefreshedAt(new Date().toLocaleTimeString('ko-KR'))
      return result
    },
    staleTime: 30000,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  })

  return {
    data: data ?? null,
    isLoading,
    error: queryError ? queryError.message : null,
    refetch,
  }
}
