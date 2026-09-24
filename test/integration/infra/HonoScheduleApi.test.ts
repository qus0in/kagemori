import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import app from '../../../worker/index.ts'

describe('[Integration / Infra] Feature: Hono Schedule Endpoint', () => {
  describe('Scenario: GET /api/schedule integration', () => {
    it('Given Hono worker application, When GET /api/schedule is requested, Then returns 200 OK with round 47 schedule JSON', async () => {
      // Given & When
      const res = await app.request('/api/schedule')

      // Then
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('content-type')?.includes('application/json'), true)

      const body = (await res.json()) as {
        round: number
        title: string
        items: Array<{
          id: string
          title: string
          targetName: string
          targetDate: string
        }>
      }

      assert.equal(body.round, 47)
      assert.equal(body.title, '제47회 투자자산운용사')
      assert.equal(body.items.length, 2)

      const regItem = body.items.find((i) => i.id === 'registration')!
      assert.equal(regItem.targetName, '접수 시작')
      assert.equal(regItem.targetDate, '2026-10-12')

      const examItem = body.items.find((i) => i.id === 'exam')!
      assert.equal(examItem.targetName, '시험일')
      assert.equal(examItem.targetDate, '2026-11-08')
    })
  })
})
