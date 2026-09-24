import { CalendarDate } from '../models/CalendarDate.ts'

export interface TimeProvider {
  getToday(): CalendarDate
}
