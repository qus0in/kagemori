import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CalendarDate } from '../../../src/domain/models/CalendarDate.ts'
import { DDay } from '../../../src/domain/models/DDay.ts'

describe('[Unit / Domain] Feature: DDay Calculation and State Rules', () => {
  describe('Scenario: Future event (D-N)', () => {
    it('Given today is 2026-09-24 and target is 2026-10-12, When DDay.calculate is called, Then returns D-18 with FUTURE status', () => {
      // Given
      const today = CalendarDate.fromString('2026-09-24')
      const target = CalendarDate.fromString('2026-10-12')

      // When
      const dday = DDay.calculate(today, target)

      // Then
      assert.equal(dday.status, 'FUTURE')
      assert.equal(dday.diffDays, 18)
      assert.equal(dday.displayText, 'D-18')
      assert.equal(dday.statusMessage, '18일 남음')
      assert.equal(dday.isFuture(), true)
      assert.equal(dday.isToday(), false)
      assert.equal(dday.isPast(), false)
    })
  })

  describe('Scenario: D-Day event (target day)', () => {
    it('Given today is 2026-10-12 and target is 2026-10-12, When DDay.calculate is called, Then returns D-Day with TODAY status', () => {
      // Given
      const today = CalendarDate.fromString('2026-10-12')
      const target = CalendarDate.fromString('2026-10-12')

      // When
      const dday = DDay.calculate(today, target)

      // Then
      assert.equal(dday.status, 'TODAY')
      assert.equal(dday.diffDays, 0)
      assert.equal(dday.displayText, 'D-Day')
      assert.equal(dday.statusMessage, '오늘이 바로 대상일입니다!')
      assert.equal(dday.isToday(), true)
      assert.equal(dday.isFuture(), false)
      assert.equal(dday.isPast(), false)
    })
  })

  describe('Scenario: Past event (D+N)', () => {
    it('Given today is 2026-10-13 and target is 2026-10-12, When DDay.calculate is called, Then returns D+1 with PAST status', () => {
      // Given
      const today = CalendarDate.fromString('2026-10-13')
      const target = CalendarDate.fromString('2026-10-12')

      // When
      const dday = DDay.calculate(today, target)

      // Then
      assert.equal(dday.status, 'PAST')
      assert.equal(dday.diffDays, -1)
      assert.equal(dday.displayText, 'D+1')
      assert.equal(dday.statusMessage, '1일 지남')
      assert.equal(dday.isPast(), true)
      assert.equal(dday.isToday(), false)
      assert.equal(dday.isFuture(), false)
    })
  })
})
