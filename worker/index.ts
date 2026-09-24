import { Hono } from 'hono'

const app = new Hono()

export interface ScheduleItem {
  id: string
  title: string
  targetName: string
  targetDate: string
}

export interface ScheduleResponse {
  round: number
  title: string
  items: ScheduleItem[]
}

const SCHEDULE_DATA: ScheduleResponse = {
  round: 47,
  title: '제47회 투자자산운용사',
  items: [
    {
      id: 'registration',
      title: '원서접수',
      targetName: '접수 시작',
      targetDate: '2026-10-12',
    },
    {
      id: 'exam',
      title: '시험',
      targetName: '시험일',
      targetDate: '2026-11-08',
    },
  ],
}

app.get('/api/schedule', (c) => {
  return c.json(SCHEDULE_DATA)
})

export default app
