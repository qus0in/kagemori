import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CalendarDate } from '../../../src/domain/models/CalendarDate.ts'
import { Schedule, ScheduleItem } from '../../../src/domain/models/Schedule.ts'
import type { ScheduleRepository } from '../../../src/domain/ports/ScheduleRepository.ts'
import type { TimeProvider } from '../../../src/domain/ports/TimeProvider.ts'
import { GetScheduleWithDDayUseCase } from '../../../src/app/usecases/GetScheduleWithDDayUseCase.ts'

class MockScheduleRepository implements ScheduleRepository {
  private readonly schedule: Schedule

  constructor(schedule: Schedule) {
    this.schedule = schedule
  }

  public async getSchedule(): Promise<Schedule> {
    return this.schedule
  }
}

class MockTimeProvider implements TimeProvider {
  private readonly today: CalendarDate

  constructor(today: CalendarDate) {
    this.today = today
  }

  public getToday(): CalendarDate {
    return this.today
  }
}

describe('[Slice / App] Feature: GetScheduleWithDDayUseCase', () => {
  describe('Scenario: Orchestrating schedule retrieval and D-day calculations', () => {
    it('Given a test schedule and fixed current date 2026-09-24, When use case executes, Then returns combined result DTO with D-18 and D-45', async () => {
      // Given
      const testSchedule = new Schedule({
        round: 47,
        title: '제47회 투자자산운용사',
        items: [
          new ScheduleItem({
            id: 'registration',
            title: '원서접수',
            targetName: '접수 시작',
            targetDate: CalendarDate.fromString('2026-10-12'),
          }),
          new ScheduleItem({
            id: 'exam',
            title: '시험',
            targetName: '시험일',
            targetDate: CalendarDate.fromString('2026-11-08'),
          }),
        ],
      })
      const mockRepo = new MockScheduleRepository(testSchedule)
      const mockTimeProvider = new MockTimeProvider(CalendarDate.fromString('2026-09-24'))
      const useCase = new GetScheduleWithDDayUseCase(mockRepo, mockTimeProvider)

      // When
      const result = await useCase.execute()

      // Then
      assert.equal(result.round, 47)
      assert.equal(result.title, '제47회 투자자산운용사')
      assert.equal(result.todayStr, '2026-09-24')
      assert.equal(result.items.length, 2)

      const regItem = result.items.find((i) => i.id === 'registration')!
      assert.equal(regItem.targetName, '접수 시작')
      assert.equal(regItem.diffDays, 18)
      assert.equal(regItem.ddayText, 'D-18')
      assert.equal(regItem.isFuture, true)

      const examItem = result.items.find((i) => i.id === 'exam')!
      assert.equal(examItem.targetName, '시험일')
      assert.equal(examItem.diffDays, 45)
      assert.equal(examItem.ddayText, 'D-45')
      assert.equal(examItem.isFuture, true)
    })
  })
})
