import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { KoreaTimeProvider } from '../../../src/infra/time/KoreaTimeProvider.ts'

describe('[Integration / Infra] Feature: KoreaTimeProvider', () => {
  describe('Scenario: Providing current date in Asia/Seoul', () => {
    it('Given KoreaTimeProvider, When getToday is called, Then returns a valid CalendarDate representing KST today', () => {
      // Given
      const provider = new KoreaTimeProvider()

      // When
      const today = provider.getToday()

      // Then
      assert.ok(today.year >= 2026)
      assert.ok(today.month >= 1 && today.month <= 12)
      assert.ok(today.day >= 1 && today.day <= 31)
      assert.match(today.toString(), /^\d{4}-\d{2}-\d{2}$/)
    })
  })
})
