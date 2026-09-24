import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { StaticScheduleRepository } from '../../../src/infra/api/StaticScheduleRepository.ts'
import { GetScheduleWithDDayUseCase } from '../../../src/app/usecases/GetScheduleWithDDayUseCase.ts'
import { CalendarDate } from '../../../src/domain/models/CalendarDate.ts'
import type { TimeProvider } from '../../../src/domain/ports/TimeProvider.ts'

class FixedTimeProvider implements TimeProvider {
  private readonly date: CalendarDate

  constructor(date: CalendarDate) {
    this.date = date
  }

  public getToday(): CalendarDate {
    return this.date
  }
}

describe('[Slice / UI] Feature: Schedule D-Day View Model State Transition', () => {
  describe('Scenario: Presenting UI state under different target dates', () => {
    it('Given today is target day for registration (2026-10-12), When view model state is produced, Then registration card is marked isToday=true and displayText=D-Day', async () => {
      // Given
      const repo = new StaticScheduleRepository()
      const timeProvider = new FixedTimeProvider(CalendarDate.fromString('2026-10-12'))
      const useCase = new GetScheduleWithDDayUseCase(repo, timeProvider)

      // When
      const result = await useCase.execute()

      // Then
      const reg = result.items.find((i) => i.id === 'registration')!
      assert.equal(reg.isToday, true)
      assert.equal(reg.ddayText, 'D-Day')
      assert.equal(reg.statusMessage, '오늘이 바로 대상일입니다!')

      const exam = result.items.find((i) => i.id === 'exam')!
      assert.equal(exam.isToday, false)
      assert.equal(exam.isFuture, true)
      assert.equal(exam.diffDays, 27)
      assert.equal(exam.ddayText, 'D-27')
    })

    it('Given today is past registration (2026-10-15), When view model state is produced, Then registration card is marked isPast=true and displayText=D+3', async () => {
      // Given
      const repo = new StaticScheduleRepository()
      const timeProvider = new FixedTimeProvider(CalendarDate.fromString('2026-10-15'))
      const useCase = new GetScheduleWithDDayUseCase(repo, timeProvider)

      // When
      const result = await useCase.execute()

      // Then
      const reg = result.items.find((i) => i.id === 'registration')!
      assert.equal(reg.isPast, true)
      assert.equal(reg.diffDays, -3)
      assert.equal(reg.ddayText, 'D+3')
      assert.equal(reg.statusMessage, '3일 지남')
    })
  })
})
