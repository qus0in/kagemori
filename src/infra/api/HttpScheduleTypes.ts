import { CalendarDate } from '../../domain/models/CalendarDate.ts'
import { Schedule, ScheduleItem } from '../../domain/models/Schedule.ts'

export interface ApiScheduleResponse {
  round: number
  title: string
  items: Array<{
    id: string
    title: string
    targetName: string
    targetDate: string
  }>
}

export function mapApiToSchedule(data: ApiScheduleResponse): Schedule {
  return new Schedule({
    round: data.round,
    title: data.title,
    items: data.items.map(
      (item) =>
        new ScheduleItem({
          id: item.id,
          title: item.title,
          targetName: item.targetName,
          targetDate: CalendarDate.fromString(item.targetDate),
        }),
    ),
  })
}
