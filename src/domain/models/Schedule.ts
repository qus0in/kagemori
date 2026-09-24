import { CalendarDate } from './CalendarDate.ts'

export interface ScheduleItemProps {
  id: string
  title: string
  targetName: string
  targetDate: CalendarDate
}

export class ScheduleItem {
  public readonly id: string
  public readonly title: string
  public readonly targetName: string
  public readonly targetDate: CalendarDate

  constructor(props: ScheduleItemProps) {
    this.id = props.id
    this.title = props.title
    this.targetName = props.targetName
    this.targetDate = props.targetDate
  }
}

export interface ScheduleProps {
  round: number
  title: string
  items: ScheduleItem[]
}

export class Schedule {
  public readonly round: number
  public readonly title: string
  public readonly items: readonly ScheduleItem[]

  constructor(props: ScheduleProps) {
    this.round = props.round
    this.title = props.title
    this.items = Object.freeze([...props.items])
  }
}
