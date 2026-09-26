// worker/routes/studySessionRoutes.ts
import { Hono } from 'hono'
import type { Env } from '../types.ts'
import { studyCreateSessionRoute } from './studyCreateSessionRoute.ts'
import { studyNextQuestionRoute } from './studyNextQuestionRoute.ts'

export const studySessionRoutes = new Hono<{ Bindings: Env }>()

studySessionRoutes.route('/', studyCreateSessionRoute)
studySessionRoutes.route('/', studyNextQuestionRoute)
