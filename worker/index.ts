// worker/index.ts
import { Hono } from 'hono'
import {
  type Env,
  getStudyRepo,
  resetDefaultStudyRepo,
  getAiAdapter,
} from './types.ts'
import { scheduleRoutes, type ScheduleItem, type ScheduleResponse } from './routes/scheduleRoutes.ts'
import { catalogRoutes } from './routes/catalogRoutes.ts'
import { studySessionRoutes } from './routes/studySessionRoutes.ts'
import { studyInteractionRoutes } from './routes/studyInteractionRoutes.ts'

export type { Env, ScheduleItem, ScheduleResponse }
export { getStudyRepo, resetDefaultStudyRepo, getAiAdapter }

const app = new Hono<{ Bindings: Env }>()

app.route('/', scheduleRoutes)
app.route('/', catalogRoutes)
app.route('/', studySessionRoutes)
app.route('/', studyInteractionRoutes)

export default app
