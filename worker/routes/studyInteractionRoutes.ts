// worker/routes/studyInteractionRoutes.ts
import { Hono } from 'hono'
import type { Env } from '../types.ts'
import { studyHintRoute } from './studyHintRoute.ts'
import { studySubmitRoute } from './studySubmitRoute.ts'

export const studyInteractionRoutes = new Hono<{ Bindings: Env }>()

studyInteractionRoutes.route('/', studyHintRoute)
studyInteractionRoutes.route('/', studySubmitRoute)
