import { CalendarDate } from '../../domain/models/CalendarDate.ts'
import type { TimeProvider } from '../../domain/ports/TimeProvider.ts'

export class KoreaTimeProvider implements TimeProvider {
  private readonly formatter: Intl.DateTimeFormat

  constructor() {
    this.formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  public getToday(): CalendarDate {
    const todayStr = this.formatter.format(new Date())
    return CalendarDate.fromString(todayStr)
  }
}
