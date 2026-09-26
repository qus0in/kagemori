// worker/routes/catalogRoutes.ts
import { Hono } from 'hono'
import { D1CatalogRepository } from '../../src/infra/d1/D1CatalogRepository.ts'
import type { Env } from '../types.ts'

export const catalogRoutes = new Hono<{ Bindings: Env }>()

catalogRoutes.get('/api/catalog/overview', async (c) => {
  const repo = new D1CatalogRepository(c.env?.DB)
  const overview = await repo.getOverview()
  return c.json(overview)
})

catalogRoutes.get('/api/catalog/books', async (c) => {
  const repo = new D1CatalogRepository(c.env?.DB)
  const books = await repo.getBooks()
  return c.json(books)
})

catalogRoutes.get('/api/catalog/books/:id', async (c) => {
  const id = c.req.param('id')
  const repo = new D1CatalogRepository(c.env?.DB)
  const book = await repo.getBookById(id)
  if (!book) {
    return c.json({ error: 'Book not found' }, 404)
  }
  return c.json(book)
})

catalogRoutes.get('/api/catalog/blueprint', async (c) => {
  const repo = new D1CatalogRepository(c.env?.DB)
  const blueprint = await repo.getExamBlueprint()
  return c.json(blueprint)
})
