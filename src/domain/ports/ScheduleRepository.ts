import { Schedule } from '../models/Schedule.ts'

export interface ScheduleRepository {
  getSchedule(): Promise<Schedule>
}
