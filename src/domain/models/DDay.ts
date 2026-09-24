import { CalendarDate } from './CalendarDate.ts'

export type DDayStatus = 'FUTURE' | 'TODAY' | 'PAST'

/**
 * Domain entity / Value object representing a D-day calculation result and state.
 */
export class DDay {
  public readonly diffDays: number
  public readonly status: DDayStatus
  public readonly displayText: string
  public readonly statusMessage: string

  private constructor(
    diffDays: number,
    status: DDayStatus,
    displayText: string,
    statusMessage: string,
  ) {
    this.diffDays = diffDays
    this.status = status
    this.displayText = displayText
    this.statusMessage = statusMessage
  }

  public static calculate(today: CalendarDate, targetDate: CalendarDate): DDay {
    const diff = today.diffInDays(targetDate)

    if (diff > 0) {
      return new DDay(
        diff,
        'FUTURE',
        `D-${diff}`,
        `${diff}일 남음`,
      )
    }

    if (diff === 0) {
      return new DDay(
        0,
        'TODAY',
        'D-Day',
        '오늘이 바로 대상일입니다!',
      )
    }

    const pastDays = Math.abs(diff)
    return new DDay(
      diff,
      'PAST',
      `D+${pastDays}`,
      `${pastDays}일 지남`,
    )
  }

  public isToday(): boolean {
    return this.status === 'TODAY'
  }

  public isPast(): boolean {
    return this.status === 'PAST'
  }

  public isFuture(): boolean {
    return this.status === 'FUTURE'
  }
}
