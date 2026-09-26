// src/domain/models/CalendarDate.ts

export class CalendarDate {
  public readonly year: number
  public readonly month: number
  public readonly day: number

  private constructor(year: number, month: number, day: number) {
    this.year = year
    this.month = month
    this.day = day
  }

  public static fromString(dateString: string): CalendarDate {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString.trim())
    if (!match) {
      throw new Error(`Invalid calendar date format: ${dateString}. Expected YYYY-MM-DD.`)
    }

    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      throw new Error(`Out of range date values: ${dateString}`)
    }

    return new CalendarDate(year, month, day)
  }

  public static fromNumbers(year: number, month: number, day: number): CalendarDate {
    return new CalendarDate(year, month, day)
  }

  public diffInDays(target: CalendarDate): number {
    const thisUtc = Date.UTC(this.year, this.month - 1, this.day)
    const targetUtc = Date.UTC(target.year, target.month - 1, target.day)
    const msPerDay = 1000 * 60 * 60 * 24
    return Math.round((targetUtc - thisUtc) / msPerDay)
  }

  public getDayOfWeekKorean(): string {
    const utcDate = new Date(Date.UTC(this.year, this.month - 1, this.day))
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return days[utcDate.getUTCDay()]
  }

  public toFormattedKorean(): string {
    return `${this.year}년 ${this.month}월 ${this.day}일 (${this.getDayOfWeekKorean()})`
  }

  public toString(): string {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${this.year}-${pad(this.month)}-${pad(this.day)}`
  }

  public equals(other: CalendarDate): boolean {
    return this.year === other.year && this.month === other.month && this.day === other.day
  }
}
