import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import app from '../../../worker/index.ts'
import type { CatalogOverview } from '../../../src/domain/ports/CatalogRepository.ts'
import type { BookCatalog, ExamBlueprint } from '../../../src/domain/models/Catalog.ts'

describe('[Integration / Infra] Feature: Hono Catalog Endpoints', () => {
  describe('Scenario: GET /api/catalog/overview integration', () => {
    it('Given Hono worker, When GET /api/catalog/overview is requested, Then returns 200 OK with overview statistics', async () => {
      // Given & When
      const res = await app.request('/api/catalog/overview')

      // Then
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('content-type')?.includes('application/json'), true)

      const body = (await res.json()) as CatalogOverview
      assert.equal(body.books.length, 5)
      assert.equal(body.totalParts, 28)
      assert.equal(body.totalChapters, 125)
      assert.equal(body.blueprintSummary.totalQuestions, 100)
      assert.equal(body.blueprintSummary.subjectsCount, 3)
      assert.equal(body.blueprintSummary.topicsCount, 17)
    })
  })

  describe('Scenario: GET /api/catalog/books integration', () => {
    it('Given Hono worker, When GET /api/catalog/books is requested, Then returns 200 OK with 5 books and part hierarchy', async () => {
      // Given & When
      const res = await app.request('/api/catalog/books')

      // Then
      assert.equal(res.status, 200)
      const books = (await res.json()) as BookCatalog[]
      assert.equal(books.length, 5)

      // Book 1 check
      const book1 = books.find((b) => b.id === 'book-1')!
      assert.equal(book1.volumeNo, 1)
      assert.equal(book1.isbn13, '9788960507845')
      assert.equal(book1.parts.length, 12)

      // Book 5 check
      const book5 = books.find((b) => b.id === 'book-5')!
      assert.equal(book5.volumeNo, 5)
      assert.equal(book5.parts.length, 2)
      assert.equal(book5.parts[0].chapters.length, 4)
      assert.equal(book5.parts[1].chapters.length, 6)
    })
  })

  describe('Scenario: GET /api/catalog/books/:id integration', () => {
    it('Given existing book id book-3, When requested, Then returns 200 OK with parts and chapters', async () => {
      const res = await app.request('/api/catalog/books/book-3')
      assert.equal(res.status, 200)
      const book = (await res.json()) as BookCatalog
      assert.equal(book.id, 'book-3')
      assert.equal(book.volumeNo, 3)
      assert.equal(book.parts.length, 4)
    })

    it('Given non-existent book id invalid-id, When requested, Then returns 404', async () => {
      const res = await app.request('/api/catalog/books/invalid-id')
      assert.equal(res.status, 404)
    })
  })

  describe('Scenario: GET /api/catalog/blueprint integration', () => {
    it('Given Hono worker, When GET /api/catalog/blueprint is requested, Then returns 200 OK with 3 subjects and 17 topics', async () => {
      const res = await app.request('/api/catalog/blueprint')
      assert.equal(res.status, 200)

      const bp = (await res.json()) as ExamBlueprint
      assert.equal(bp.subjects.length, 3)

      const subj1 = bp.subjects.find((s) => s.id === 'subj-1')!
      assert.equal(subj1.questionCount, 20)
      assert.equal(subj1.minimumCorrect, 8)
      assert.equal(subj1.topics.length, 3)

      const subj2 = bp.subjects.find((s) => s.id === 'subj-2')!
      assert.equal(subj2.questionCount, 30)
      assert.equal(subj2.minimumCorrect, 12)
      assert.equal(subj2.topics.length, 4)

      const subj3 = bp.subjects.find((s) => s.id === 'subj-3')!
      assert.equal(subj3.questionCount, 50)
      assert.equal(subj3.minimumCorrect, 20)
      assert.equal(subj3.topics.length, 10)
    })
  })
})
