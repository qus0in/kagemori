// test/unit/domain/PracticeSession.test.ts

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { PracticeSession } from '../../../src/domain/models/PracticeSession.ts'

describe('[Unit / Domain] Feature: PracticeSession Entity and Rules', () => {
  describe('Scenario: Session purpose and hint rules', () => {
    it('Given DIAGNOSTIC purpose, When allowsHint is checked, Then returns false', () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-diag-1',
        learnerId: 'learner-1',
        purpose: 'DIAGNOSTIC',
        blueprintId: 'bp-2026',
        targetQuestionCount: 17,
      })

      // When & Then
      assert.equal(session.allowsHint(), false)
      assert.equal(session.allowsAdaptiveSelection(), false)
      assert.equal(session.isBlueprintDistributionEnforced(), false)
    })

    it('Given IMPROVEMENT purpose, When allowsHint is checked, Then returns true', () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-imp-1',
        learnerId: 'learner-1',
        purpose: 'IMPROVEMENT',
        blueprintId: 'bp-2026',
        targetQuestionCount: 10,
      })

      // When & Then
      assert.equal(session.allowsHint(), true)
      assert.equal(session.allowsAdaptiveSelection(), true)
      assert.equal(session.isBlueprintDistributionEnforced(), false)
    })

    it('Given MOCK_EXAM purpose, When blueprint enforcement is checked, Then returns true and hints are false', () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-mock-1',
        learnerId: 'learner-1',
        purpose: 'MOCK_EXAM',
        blueprintId: 'bp-2026',
        targetQuestionCount: 100,
      })

      // When & Then
      assert.equal(session.allowsHint(), false)
      assert.equal(session.allowsAdaptiveSelection(), false)
      assert.equal(session.isBlueprintDistributionEnforced(), true)
    })
  })

  describe('Scenario: Recording attempts and session completion', () => {
    it('Given a session with target 2 questions, When 2 attempts are recorded, Then advances index and completes session', () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-test',
        learnerId: 'learner-1',
        purpose: 'IMPROVEMENT',
        blueprintId: 'bp-2026',
        targetQuestionCount: 2,
      })

      assert.equal(session.currentQuestionIndex, 0)
      assert.equal(session.isCompleted, false)

      // When 1st attempt recorded
      const attempt1 = session.recordAttempt({
        questionId: 'q-1',
        optionId: 'opt-2',
        isCorrect: true,
        hintUsed: false,
        durationMs: 45000,
      })

      // Then
      assert.equal(session.currentQuestionIndex, 1)
      assert.equal(session.isCompleted, false)
      assert.equal(attempt1.isFirstCorrect, true)
      assert.equal(attempt1.isFinalCorrect, true)

      // When 2nd attempt recorded (with hint used)
      const attempt2 = session.recordAttempt({
        questionId: 'q-2',
        optionId: 'opt-4',
        isCorrect: true,
        hintUsed: true,
        durationMs: 30000,
      })

      // Then
      assert.equal(session.currentQuestionIndex, 2)
      assert.equal(session.isCompleted, true)
      assert.equal(attempt2.isFirstCorrect, false) // hint was used, first correct is false
      assert.equal(attempt2.isFinalCorrect, true)
      assert.equal(session.attempts.length, 2)
    })

    it('Given an already completed session, When another attempt is recorded, Then throws an error', () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-done',
        learnerId: 'learner-1',
        purpose: 'IMPROVEMENT',
        blueprintId: 'bp-2026',
        targetQuestionCount: 1,
      })
      session.recordAttempt({
        questionId: 'q-1',
        optionId: 'opt-1',
        isCorrect: true,
        hintUsed: false,
        durationMs: 12000,
      })
      assert.equal(session.isCompleted, true)

      // When & Then
      assert.throws(
        () => session.recordAttempt({
          questionId: 'q-2',
          optionId: 'opt-2',
          isCorrect: true,
          hintUsed: false,
          durationMs: 15000,
        }),
        /already completed/
      )
    })

    it('Given a DIAGNOSTIC session, When attempt is submitted with hintUsed true, Then throws error', () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-diag-error',
        learnerId: 'learner-1',
        purpose: 'DIAGNOSTIC',
        blueprintId: 'bp-2026',
        targetQuestionCount: 17,
      })

      // When & Then
      assert.throws(
        () => session.recordAttempt({
          questionId: 'q-1',
          optionId: 'opt-3',
          isCorrect: true,
          hintUsed: true,
          durationMs: 15000,
        }),
        /Hints are not allowed in DIAGNOSTIC session/
      )
    })
  })

  describe('Scenario: Scoring metrics and summary calculations', () => {
    it('Given multiple attempts with and without hints, When summary is queried, Then computes correct counts and accuracy percentage', () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-summary',
        learnerId: 'learner-42',
        purpose: 'IMPROVEMENT',
        blueprintId: 'bp-2026',
        targetQuestionCount: 3,
      })

      assert.equal(session.accuracyPercentage, 0)
      assert.equal(session.correctCount, 0)
      assert.equal(session.firstTryCorrectCount, 0)

      // 1st attempt: correct without hint
      session.recordAttempt({
        questionId: 'q-1',
        optionId: 'opt-1',
        isCorrect: true,
        hintUsed: false,
        durationMs: 10000,
      })

      // 2nd attempt: incorrect
      session.recordAttempt({
        questionId: 'q-2',
        optionId: 'opt-2',
        isCorrect: false,
        hintUsed: false,
        durationMs: 12000,
      })

      // 3rd attempt: correct with hint
      session.recordAttempt({
        questionId: 'q-3',
        optionId: 'opt-3',
        isCorrect: true,
        hintUsed: true,
        durationMs: 25000,
      })

      // Then
      assert.equal(session.correctCount, 2)
      assert.equal(session.firstTryCorrectCount, 1)
      // 2 correct out of 3 = 67%
      assert.equal(session.accuracyPercentage, 67)
      assert.equal(session.isCompleted, true)

      const summary = session.getSummary()
      assert.equal(summary.sessionId, 'sess-summary')
      assert.equal(summary.learnerId, 'learner-42')
      assert.equal(summary.purpose, 'IMPROVEMENT')
      assert.equal(summary.totalAttempts, 3)
      assert.equal(summary.targetQuestionCount, 3)
      assert.equal(summary.correctCount, 2)
      assert.equal(summary.firstTryCorrectCount, 1)
      assert.equal(summary.accuracyPercentage, 67)
      assert.equal(summary.isCompleted, true)
    })
  })
})
