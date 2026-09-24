import { CalendarDate } from '../../domain/models/CalendarDate.ts'
import { Schedule, ScheduleItem } from '../../domain/models/Schedule.ts'
import type { ScheduleRepository } from '../../domain/ports/ScheduleRepository.ts'

export class StaticScheduleRepository implements ScheduleRepository {
  public async getSchedule(): Promise<Schedule> {
    return new Schedule({
      round: 47,
      title: '제47회 투자자산운용사',
      items: [
        new ScheduleItem({
          id: 'registration',
          title: '원서접수',
          targetName: '접수 시작',
          targetDate: CalendarDate.fromString('2026-10-12'),
        }),
        new ScheduleItem({
          id: 'exam',
          title: '시험',
          targetName: '시험일',
          targetDate: CalendarDate.fromString('2026-11-08'),
        }),
      ],
    })
  }
}
