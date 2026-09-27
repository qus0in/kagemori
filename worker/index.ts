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
import { StudySessionDO } from './do/StudySessionDO.ts'
import { studyCoverageRoute } from './routes/studyCoverageRoute.ts'
import { storageErrorHandler } from './storageErrorHandler.ts'
import { studyChatRoute } from './routes/studyChatRoute.ts'

export type { Env, ScheduleItem, ScheduleResponse }
export { getStudyRepo, resetDefaultStudyRepo, getAiAdapter, StudySessionDO }

const app = new Hono<{ Bindings: Env }>()
app.onError(storageErrorHandler)
app.use('/api/study/*', async (c, next) => { c.header('Cache-Control', 'no-store'); await next() })

app.route('/', scheduleRoutes)
app.route('/', catalogRoutes)
app.route('/', studySessionRoutes)
app.route('/', studyInteractionRoutes)
app.route('/', studyCoverageRoute)
app.route('/', studyChatRoute)

export default app
