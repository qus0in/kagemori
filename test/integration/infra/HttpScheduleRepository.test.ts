import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import ky from 'ky'
import { HttpScheduleRepository } from '../../../src/infra/api/HttpScheduleRepository.ts'

describe('[Integration / Infra] Feature: HttpScheduleRepository using ky', () => {
  describe('Scenario: Fetching schedule via ky HTTP client', () => {
    it('Given a mocked ky instance, When getSchedule is called, Then parses into domain Schedule model', async () => {
      // Given
      const mockKy = {
        get: () => ({
          json: async () => ({
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
          }),
        }),
      } as unknown as typeof ky

      const repo = new HttpScheduleRepository('/api/schedule', mockKy)

      // When
      const schedule = await repo.getSchedule()

      // Then
      assert.equal(schedule.round, 47)
      assert.equal(schedule.title, '제47회 투자자산운용사')
      assert.equal(schedule.items.length, 2)
      assert.equal(schedule.items[0].targetDate.toString(), '2026-10-12')
      assert.equal(schedule.items[1].targetDate.toString(), '2026-11-08')
    })
  })
})
