// test/slice/app/SubmitAnswerUseCase.test.ts

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { SubmitAnswerUseCase } from '../../../src/app/usecases/SubmitAnswerUseCase.ts'
import { Question } from '../../../src/domain/models/Question.ts'
import { Concept } from '../../../src/domain/models/Concept.ts'
import { PracticeSession } from '../../../src/domain/models/PracticeSession.ts'
import type { PracticeSessionRepository } from '../../../src/domain/ports/PracticeSessionRepository.ts'
import type { QuestionRepository } from '../../../src/domain/ports/QuestionRepository.ts'
import type { ConceptRepository } from '../../../src/domain/ports/ConceptRepository.ts'
import type { AiExplanationPort } from '../../../src/domain/ports/AiExplanationPort.ts'
import type { SourceRepository } from '../../../src/domain/ports/SourceRepository.ts'

describe('[Slice / App] Feature: SubmitAnswerUseCase', () => {
  const sampleQuestion = new Question({
    id: 'q-301',
    version: 1,
    topicId: 'topic-tax',
    chapterId: 'chap-income-tax',
    type: 'REGULATION',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    prompt: '소득세법상 금융소득 종합과세 기준 금액으로 옳은 것은?',
    options: [
      { id: 'opt-1', text: '연간 1,000만 원 초과' },
      { id: 'opt-2', text: '연간 2,000만 원 초과' },
      { id: 'opt-3', text: '연간 3,000만 원 초과' },
      { id: 'opt-4', text: '연간 4,000만 원 초과' },
    ],
    correctOptionId: 'opt-2',
    explanation: '금융소득(이자·배당소득)의 합계액이 연간 2,000만 원을 초과할 경우 종합과세 대상이 됩니다.',
    conceptId: 'concept-fin-tax',
    sourceId: 'src-income-tax-act',
  })

  const sampleConcept = new Concept({
    conceptId: 'concept-fin-tax',
    topicId: 'topic-tax',
    chapterId: 'chap-income-tax',
    title: '금융소득 종합과세 기준',
    body: '이자소득과 배당소득의 합계액이 연간 2,000만 원을 초과하는 경우 다른 종합소득과 합산하여 기본세율로 과세한다.',
    status: 'PUBLISHED',
    version: 1,
    sourceId: 'src-income-tax-act',
    locator: '제14조 제3항 제6호',
  })

  describe('Scenario: Submitting a correct answer with AI explanation', () => {
    it('Given active session and valid answer, When use case executes, Then evaluates correct, updates session, and returns response DTO', async () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-submit-1',
        learnerId: 'learner-1',
        purpose: 'IMPROVEMENT',
        blueprintId: 'bp-2026',
        targetQuestionCount: 1,
      })

      let savedSession: PracticeSession | null = null
      const mockSessionRepo: PracticeSessionRepository = {
        findById: async () => session,
        save: async (s) => {
          savedSession = s
        },
      }

      const mockQuestionRepo: QuestionRepository = {
        findById: async (id: string) => (id === sampleQuestion.id ? sampleQuestion : null),
        findNextForSession: async () => null,
      }

      const mockConceptRepo: ConceptRepository = {
        findById: async (id: string) => (id === sampleConcept.conceptId ? sampleConcept : null),
        findByTopicId: async () => [sampleConcept],
      }

      let capturedParams: unknown = null
      const mockAiPort: AiExplanationPort = {
        generateHint: async () => 'hint',
        generateExplanation: async (paramOrConcept, _q, _sel, isCorrect) => {
          capturedParams = paramOrConcept
          const correct = typeof paramOrConcept === 'object' ? paramOrConcept.isCorrect : isCorrect
          return `[AI 해설] ${correct ? '정답입니다!' : '오답입니다.'} 2,000만 원 초과 시 종합과세됩니다.`
        },
      }

      const mockSourceRepo: SourceRepository = {
        findById: async () => ({
          id: 'src-income-tax-act',
          title: '소득세법 제14조',
          url: 'https://law.go.kr',
        }),
      }

      const useCase = new SubmitAnswerUseCase(
        mockSessionRepo,
        mockQuestionRepo,
        mockConceptRepo,
        mockAiPort,
        mockSourceRepo
      )

      // When
      const result = await useCase.execute({
        sessionId: 'sess-submit-1',
        questionId: 'q-301',
        optionId: 'opt-2',
        hintUsed: false,
        durationMs: 25000,
      })

      // Then
      assert.equal(result.isCorrect, true)
      assert.equal(result.correctOptionId, 'opt-2')
      assert.match(result.explanation, /\[AI 해설\] 정답입니다!/)
      assert.equal(result.conceptTitle, '금융소득 종합과세 기준')
      assert.equal(result.sourceTitle, '소득세법 제14조')
      assert.equal(result.sourceUrl, 'https://law.go.kr')
      assert.equal(result.isSessionCompleted, true)
      assert.equal(savedSession !== null, true)
      assert.equal(savedSession?.isCompleted, true)
      assert.equal(savedSession?.attempts.length, 1)
      assert.deepEqual(capturedParams, {
        conceptBody: sampleConcept.body,
        questionPrompt: sampleQuestion.prompt,
        selectedOptionText: '연간 2,000만 원 초과',
        correctOptionText: '연간 2,000만 원 초과',
        isCorrect: true,
        allOptions: sampleQuestion.options.map((o) => ({ id: o.id, text: o.text })),
      })
    })
  })

  describe('Scenario: Submitting an incorrect answer with fallback explanation', () => {
    it('Given incorrect option, When execute is called, Then returns isCorrect false and static explanation fallback if AI fails', async () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-submit-2',
        learnerId: 'learner-1',
        purpose: 'IMPROVEMENT',
        blueprintId: 'bp-2026',
        targetQuestionCount: 5,
      })

      const mockSessionRepo: PracticeSessionRepository = {
        findById: async () => session,
        save: async () => {},
      }
      const mockQuestionRepo: QuestionRepository = {
        findById: async () => sampleQuestion,
        findNextForSession: async () => null,
      }
      const mockConceptRepo: ConceptRepository = {
        findById: async () => sampleConcept,
        findByTopicId: async () => [],
      }
      const failingAiPort: AiExplanationPort = {
        generateHint: async () => 'hint',
        generateExplanation: async () => {
          throw new Error('AI rate limit')
        },
      }

      const useCase = new SubmitAnswerUseCase(
        mockSessionRepo,
        mockQuestionRepo,
        mockConceptRepo,
        failingAiPort
      )

      // When
      const result = await useCase.execute({
        sessionId: 'sess-submit-2',
        questionId: 'q-301',
        optionId: 'opt-1', // incorrect option
        hintUsed: false,
        durationMs: 15000,
      })

      // Then
      assert.equal(result.isCorrect, false)
      assert.equal(result.correctOptionId, 'opt-2')
      // Falls back to static question explanation
      assert.equal(result.explanation, sampleQuestion.explanation)
      assert.equal(result.isSessionCompleted, false)
    })
  })

  describe('Scenario: Error handling for invalid submissions', () => {
    it('Given an invalid optionId not among the 4 options, When execute is called, Then throws error', async () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-err-1',
        learnerId: 'learner-1',
        purpose: 'IMPROVEMENT',
        blueprintId: 'bp-2026',
        targetQuestionCount: 5,
      })
      const useCase = new SubmitAnswerUseCase(
        { findById: async () => session, save: async () => {} },
        { findById: async () => sampleQuestion, findNextForSession: async () => null },
        { findById: async () => sampleConcept, findByTopicId: async () => [] }
      )

      // When & Then
      await assert.rejects(
        () =>
          useCase.execute({
            sessionId: 'sess-err-1',
            questionId: 'q-301',
            optionId: 'opt-invalid-999',
            hintUsed: false,
            durationMs: 1000,
          }),
        /Invalid optionId "opt-invalid-999"/
      )
    })

    it('Given missing practice session, When execute is called, Then throws session not found', async () => {
      // Given
      const useCase = new SubmitAnswerUseCase(
        { findById: async () => null, save: async () => {} },
        { findById: async () => sampleQuestion, findNextForSession: async () => null },
        { findById: async () => sampleConcept, findByTopicId: async () => [] }
      )

      // When & Then
      await assert.rejects(
        () =>
          useCase.execute({
            sessionId: 'sess-none',
            questionId: 'q-301',
            optionId: 'opt-1',
            hintUsed: false,
            durationMs: 1000,
          }),
        /Practice session not found/
      )
    })

    it('Given missing question, When execute is called, Then throws question not found', async () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-err-2',
        learnerId: 'learner-1',
        purpose: 'IMPROVEMENT',
        blueprintId: 'bp-2026',
        targetQuestionCount: 5,
      })
      const useCase = new SubmitAnswerUseCase(
        { findById: async () => session, save: async () => {} },
        { findById: async () => null, findNextForSession: async () => null },
        { findById: async () => sampleConcept, findByTopicId: async () => [] }
      )

      // When & Then
      await assert.rejects(
        () =>
          useCase.execute({
            sessionId: 'sess-err-2',
            questionId: 'q-none',
            optionId: 'opt-1',
            hintUsed: false,
            durationMs: 1000,
          }),
        /Question not found: q-none/
      )
    })
  })
})
