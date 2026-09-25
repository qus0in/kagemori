// worker/index.ts
import { Hono } from 'hono'
import { D1CatalogRepository } from '../src/infra/d1/D1CatalogRepository.ts'

export type Env = {
  DB?: D1Database
  GEMINI_API_KEY?: string
}

const app = new Hono<{ Bindings: Env }>()

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

// 스케줄 API
app.get('/api/schedule', (c) => {
  return c.json(SCHEDULE_DATA)
})

// 카탈로그 개요 API
app.get('/api/catalog/overview', async (c) => {
  const repo = new D1CatalogRepository(c.env?.DB)
  const overview = await repo.getOverview()
  return c.json(overview)
})

// 교재 목록 API (1~5권)
app.get('/api/catalog/books', async (c) => {
  const repo = new D1CatalogRepository(c.env?.DB)
  const books = await repo.getBooks()
  return c.json(books)
})

// 개별 교재 상세 API (PART 및 Chapter 포함)
app.get('/api/catalog/books/:id', async (c) => {
  const id = c.req.param('id')
  const repo = new D1CatalogRepository(c.env?.DB)
  const book = await repo.getBookById(id)
  if (!book) {
    return c.json({ error: 'Book not found' }, 404)
  }
  return c.json(book)
})

// 출제기준 및 과목별 배분 API
app.get('/api/catalog/blueprint', async (c) => {
  const repo = new D1CatalogRepository(c.env?.DB)
  const blueprint = await repo.getExamBlueprint()
  return c.json(blueprint)
})

export default app
