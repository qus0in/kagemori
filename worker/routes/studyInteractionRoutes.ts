// worker/routes/studyInteractionRoutes.ts
import { Hono } from 'hono'
import type { Env } from '../types.ts'
import { studyHintRoute } from './studyHintRoute.ts'
import { studySubmitRoute } from './studySubmitRoute.ts'
import { studyPostAnswerRoutes } from './studyPostAnswerRoutes.ts'
import { studyPrepareRoute } from './studyPrepareRoute.ts'

export const studyInteractionRoutes = new Hono<{ Bindings: Env }>()

studyInteractionRoutes.route('/', studyHintRoute)
studyInteractionRoutes.route('/', studySubmitRoute)
studyInteractionRoutes.route('/', studyPostAnswerRoutes)
studyInteractionRoutes.route('/', studyPrepareRoute)
