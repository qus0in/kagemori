import { DDay } from '../../domain/models/DDay.ts'
import type { ScheduleRepository } from '../../domain/ports/ScheduleRepository.ts'
import type { TimeProvider } from '../../domain/ports/TimeProvider.ts'
import type { ScheduleDDayResultDto, ScheduleItemDDayDto } from '../dto/ScheduleDDayDto.ts'

export class GetScheduleWithDDayUseCase {
  private readonly scheduleRepo: ScheduleRepository
  private readonly timeProvider: TimeProvider

  constructor(scheduleRepo: ScheduleRepository, timeProvider: TimeProvider) {
    this.scheduleRepo = scheduleRepo
    this.timeProvider = timeProvider
  }

  public async execute(): Promise<ScheduleDDayResultDto> {
    const [schedule, today] = await Promise.all([
      this.scheduleRepo.getSchedule(),
      Promise.resolve(this.timeProvider.getToday()),
    ])

    const itemDtos: ScheduleItemDDayDto[] = schedule.items.map((item) => {
      const dday = DDay.calculate(today, item.targetDate)

      return {
        id: item.id,
        title: item.title,
        targetName: item.targetName,
        targetDateStr: item.targetDate.toString(),
        targetDateFormatted: item.targetDate.toFormattedKorean(),
        diffDays: dday.diffDays,
        ddayText: dday.displayText,
        status: dday.status,
        statusMessage: dday.statusMessage,
        isToday: dday.isToday(),
        isPast: dday.isPast(),
        isFuture: dday.isFuture(),
      }
    })

    return {
      round: schedule.round,
      title: schedule.title,
      todayStr: today.toString(),
      todayFormatted: today.toFormattedKorean(),
      items: itemDtos,
    }
  }
}
