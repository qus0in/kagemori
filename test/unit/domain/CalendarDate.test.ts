import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CalendarDate } from '../../../src/domain/models/CalendarDate.ts'

describe('[Unit / Domain] Feature: CalendarDate Value Object', () => {
  describe('Scenario: Valid date string parsing', () => {
    it('Given a valid YYYY-MM-DD string, When CalendarDate.fromString is called, Then returns correct date components', () => {
      // Given
      const dateStr = '2026-10-12'

      // When
      const date = CalendarDate.fromString(dateStr)

      // Then
      assert.equal(date.year, 2026)
      assert.equal(date.month, 10)
      assert.equal(date.day, 12)
      assert.equal(date.toString(), '2026-10-12')
    })
  })

  describe('Scenario: Invalid date string handling', () => {
    it('Given an invalid format string, When CalendarDate.fromString is called, Then throws an error', () => {
      // Given & When & Then
      assert.throws(() => CalendarDate.fromString('invalid-date'), /Invalid calendar date format/)
      assert.throws(() => CalendarDate.fromString('2026-13-01'), /Out of range date values/)
      assert.throws(() => CalendarDate.fromString('2026-00-10'), /Out of range date values/)
    })
  })

  describe('Scenario: Calendar day difference calculation', () => {
    it('Given today 2026-09-24 and target 2026-10-12, When diffInDays is calculated, Then returns 18 days', () => {
      // Given
      const today = CalendarDate.fromString('2026-09-24')
      const target = CalendarDate.fromString('2026-10-12')

      // When
      const diff = today.diffInDays(target)

      // Then
      assert.equal(diff, 18)
    })

    it('Given today 2026-09-24 and target 2026-11-08, When diffInDays is calculated, Then returns 45 days', () => {
      // Given
      const today = CalendarDate.fromString('2026-09-24')
      const examDate = CalendarDate.fromString('2026-11-08')

      // When
      const diff = today.diffInDays(examDate)

      // Then
      assert.equal(diff, 45)
    })
  })

  describe('Scenario: Korean calendar formatting', () => {
    it('Given 2026-10-12 (Monday), When toFormattedKorean is called, Then returns date with Korean weekday', () => {
      // Given
      const date = CalendarDate.fromString('2026-10-12')

      // When
      const formatted = date.toFormattedKorean()

      // Then
      assert.equal(formatted, '2026년 10월 12일 (월)')
    })

    it('Given 2026-11-08 (Sunday), When toFormattedKorean is called, Then returns date with Sunday', () => {
      // Given
      const date = CalendarDate.fromString('2026-11-08')

      // When
      const formatted = date.toFormattedKorean()

      // Then
      assert.equal(formatted, '2026년 11월 8일 (일)')
    })
  })
})
