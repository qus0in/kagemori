import { DDayStatus } from '../../domain/models/DDay.ts'

export interface ScheduleItemDDayDto {
  id: string
  title: string
  targetName: string
  targetDateStr: string
  targetDateFormatted: string
  diffDays: number
  ddayText: string
  status: DDayStatus
  statusMessage: string
  isToday: boolean
  isPast: boolean
  isFuture: boolean
}

export interface ScheduleDDayResultDto {
  round: number
  title: string
  todayStr: string
  todayFormatted: string
  items: ScheduleItemDDayDto[]
}
