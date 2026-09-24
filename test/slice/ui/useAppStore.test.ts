import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { useAppStore } from '../../../src/ui/store/useAppStore.ts'

describe('[Slice / UI] Feature: Zustand useAppStore State Management', () => {
  describe('Scenario: Theme toggling and state updates', () => {
    it('Given initial theme kagemori, When toggleTheme is invoked, Then updates theme to kagemori-dark', () => {
      // Given
      const store = useAppStore.getState()
      assert.equal(store.theme, 'kagemori')

      // When
      store.toggleTheme()

      // Then
      assert.equal(useAppStore.getState().theme, 'kagemori-dark')

      // Toggle back
      useAppStore.getState().toggleTheme()
      assert.equal(useAppStore.getState().theme, 'kagemori')
    })

    it('Given store, When setLastRefreshedAt is called, Then records timestamp', () => {
      // When
      useAppStore.getState().setLastRefreshedAt('12:00:00')

      // Then
      assert.equal(useAppStore.getState().lastRefreshedAt, '12:00:00')
    })
  })
})
