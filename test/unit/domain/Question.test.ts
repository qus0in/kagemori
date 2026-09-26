// test/unit/domain/Question.test.ts

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Question, type QuestionProps } from '../../../src/domain/models/Question.ts'

describe('[Unit / Domain] Feature: Question Entity and Evaluation', () => {
  const baseValidProps: QuestionProps = {
    id: 'q-101',
    version: 1,
    topicId: 'topic-1',
    chapterId: 'chap-1',
    type: 'CONCEPT',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    prompt: '투자신탁과 투자회사의 법적 형태에 관한 설명으로 옳은 것은?',
    options: [
      { id: 'opt-1', text: '투자신탁은 법인격이 있는 주식회사 형태이다.' },
      { id: 'opt-2', text: '투자회사는 신탁계약에 의해 성립되는 계약형이다.' },
      { id: 'opt-3', text: '투자신탁은 위탁자, 수탁자, 수익자의 3당사자 계약형 구조이다.' },
      { id: 'opt-4', text: '투자회사는 이사회를 둘 수 없다.' },
    ],
    correctOptionId: 'opt-3',
    explanation: '투자신탁은 신탁계약에 기반한 계약형 구조로 위탁자, 수탁자, 수익자로 구성됩니다.',
    conceptId: 'concept-trust-company',
    sourceId: 'src-kofia-manual',
  }

  describe('Scenario: Instantiating a valid Question entity', () => {
    it('Given valid question properties with 4 unique options, When Question is instantiated, Then properties are set correctly', () => {
      // When
      const question = new Question(baseValidProps)

      // Then
      assert.equal(question.id, 'q-101')
      assert.equal(question.type, 'CONCEPT')
      assert.equal(question.options.length, 4)
      assert.equal(question.correctOptionId, 'opt-3')
    })
  })

  describe('Scenario: Option count validation', () => {
    it('Given options array with 3 options, When Question is instantiated, Then throws an error', () => {
      // Given
      const invalidProps: QuestionProps = {
        ...baseValidProps,
        options: baseValidProps.options.slice(0, 3),
      }

      // When & Then
      assert.throws(
        () => new Question(invalidProps),
        /A question must have exactly 4 options/
      )
    })
  })

  describe('Scenario: Option ID uniqueness and correctOptionId presence', () => {
    it('Given duplicate option IDs, When Question is instantiated, Then throws duplicate IDs error', () => {
      // Given
      const invalidProps: QuestionProps = {
        ...baseValidProps,
        options: [
          { id: 'opt-1', text: 'Option 1' },
          { id: 'opt-1', text: 'Option 2' },
          { id: 'opt-3', text: 'Option 3' },
          { id: 'opt-4', text: 'Option 4' },
        ],
      }

      // When & Then
      assert.throws(
        () => new Question(invalidProps),
        /Question options must have unique IDs/
      )
    })

    it('Given correctOptionId not present in options, When Question is instantiated, Then throws error', () => {
      // Given
      const invalidProps: QuestionProps = {
        ...baseValidProps,
        correctOptionId: 'opt-999',
      }

      // When & Then
      assert.throws(
        () => new Question(invalidProps),
        /correctOptionId "opt-999" must match one of the 4 options/
      )
    })
  })

  describe('Scenario: Evaluating answers', () => {
    it('Given a valid Question, When evaluateAnswer is called with correct option ID, Then returns true', () => {
      // Given
      const question = new Question(baseValidProps)

      // When
      const isCorrect = question.evaluateAnswer('opt-3')

      // Then
      assert.equal(isCorrect, true)
    })

    it('Given a valid Question, When evaluateAnswer is called with incorrect option ID, Then returns false', () => {
      // Given
      const question = new Question(baseValidProps)

      // When
      const isCorrect = question.evaluateAnswer('opt-1')

      // Then
      assert.equal(isCorrect, false)
    })

    it('Given an unknown or empty option ID, When evaluateAnswer is called, Then returns false', () => {
      // Given
      const question = new Question(baseValidProps)

      // When & Then
      assert.equal(question.evaluateAnswer('opt-unknown'), false)
      assert.equal(question.evaluateAnswer(''), false)
    })
  })

  describe('Scenario: Option text emptiness validation', () => {
    it('Given an option with empty or whitespace text, When Question is instantiated, Then throws error', () => {
      // Given
      const invalidProps: QuestionProps = {
        ...baseValidProps,
        options: [
          { id: 'opt-1', text: 'Valid' },
          { id: 'opt-2', text: '   ' },
          { id: 'opt-3', text: 'Valid 3' },
          { id: 'opt-4', text: 'Valid 4' },
        ],
      }

      // When & Then
      assert.throws(
        () => new Question(invalidProps),
        /Option "opt-2" cannot have empty text/
      )
    })
  })
})
