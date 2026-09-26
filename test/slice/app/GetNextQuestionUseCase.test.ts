// test/slice/app/GetNextQuestionUseCase.test.ts

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GetNextQuestionUseCase } from '../../../src/app/usecases/GetNextQuestionUseCase.ts'
import { Question } from '../../../src/domain/models/Question.ts'
import { PracticeSession } from '../../../src/domain/models/PracticeSession.ts'
import type { PracticeSessionRepository } from '../../../src/domain/ports/PracticeSessionRepository.ts'
import type { QuestionRepository } from '../../../src/domain/ports/QuestionRepository.ts'

describe('[Slice / App] Feature: GetNextQuestionUseCase', () => {
  const sampleQuestion = new Question({
    id: 'q-201',
    version: 1,
    topicId: 'topic-derivatives',
    chapterId: 'chap-futures',
    type: 'CONCEPT',
    difficulty: 'HARD',
    status: 'PUBLISHED',
    prompt: '선물환과 선물(Futures)의 주요 차이점에 관한 설명으로 틀린 것은?',
    options: [
      { id: 'opt-a', text: '선물환은 장외거래이고 선물은 장내거래이다.' },
      { id: 'opt-b', text: '선물은 일일정산제도와 마진콜이 적용된다.' },
      { id: 'opt-c', text: '선물환은 표준화된 계약 단위로만 거래된다.' },
      { id: 'opt-d', text: '선물거래는 청산소가 결제이행을 보증한다.' },
    ],
    correctOptionId: 'opt-c',
    explanation: '선물환은 장외거래(OTC)이므로 거래 당사자 간 합의에 의해 계약 조건이 결정되는 비표준화 거래입니다.',
    conceptId: 'concept-derivatives-futures',
    sourceId: 'src-kofia-manual',
  })

  describe('Scenario: Fetching next question for an active session', () => {
    it('Given an already loaded session, When selecting its question, Then performs no additional session read', async () => {
      const session = new PracticeSession({
        sessionId: 'loaded', learnerId: 'learner', purpose: 'DIAGNOSTIC', blueprintId: 'bp', targetQuestionCount: 6,
      })
      const useCase = new GetNextQuestionUseCase({
        findById: async () => { throw new Error('Duplicate session read') }, save: async () => {},
      }, { findById: async () => sampleQuestion, findNextForSession: async () => sampleQuestion })
      assert.equal((await useCase.executeForSession(session))?.id, sampleQuestion.id)
    })
    it('Given active session, When execute is called, Then returns PublicQuestionDto with correctOptionId omitted', async () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-active',
        learnerId: 'learner-1',
        purpose: 'IMPROVEMENT',
        blueprintId: 'bp-2026',
        targetQuestionCount: 5,
      })

      const mockSessionRepo: PracticeSessionRepository = {
        findById: async (id: string) => (id === 'sess-active' ? session : null),
        save: async () => {},
      }

      const mockQuestionRepo: QuestionRepository = {
        findById: async () => sampleQuestion,
        findNextForSession: async () => sampleQuestion,
      }

      const useCase = new GetNextQuestionUseCase(mockSessionRepo, mockQuestionRepo)

      // When
      const result = await useCase.execute('sess-active')

      // Then
      assert.ok(result)
      assert.equal(result.id, 'q-201')
      assert.equal(result.prompt, '선물환과 선물(Futures)의 주요 차이점에 관한 설명으로 틀린 것은?')
      assert.equal(result.options.length, 4)
      // Critical security rule: correctOptionId must not be present in public DTO
      assert.equal('correctOptionId' in result, false)
      assert.equal('explanation' in result, false)
    })
  })

  describe('Scenario: Session is already completed', () => {
    it('Given completed session, When execute is called, Then returns null', async () => {
      // Given
      const completedSession = new PracticeSession({
        sessionId: 'sess-done',
        learnerId: 'learner-1',
        purpose: 'DIAGNOSTIC',
        blueprintId: 'bp-2026',
        targetQuestionCount: 1,
        isCompleted: true,
      })

      const mockSessionRepo: PracticeSessionRepository = {
        findById: async () => completedSession,
        save: async () => {},
      }

      const mockQuestionRepo: QuestionRepository = {
        findById: async () => sampleQuestion,
        findNextForSession: async () => sampleQuestion,
      }

      const useCase = new GetNextQuestionUseCase(mockSessionRepo, mockQuestionRepo)

      // When
      const result = await useCase.execute('sess-done')

      // Then
      assert.equal(result, null)
    })
  })

  describe('Scenario: Session not found', () => {
    it('Given non-existent session ID, When execute is called, Then throws error', async () => {
      // Given
      const mockSessionRepo: PracticeSessionRepository = {
        findById: async () => null,
        save: async () => {},
      }
      const mockQuestionRepo: QuestionRepository = {
        findById: async () => null,
        findNextForSession: async () => null,
      }

      const useCase = new GetNextQuestionUseCase(mockSessionRepo, mockQuestionRepo)

      // When & Then
      await assert.rejects(
        () => useCase.execute('non-existent'),
        /Practice session not found/
      )
    })
  })
})
