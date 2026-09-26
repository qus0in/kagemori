// test/slice/app/GetConceptHintUseCase.test.ts

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GetConceptHintUseCase } from '../../../src/app/usecases/GetConceptHintUseCase.ts'
import { Question } from '../../../src/domain/models/Question.ts'
import { Concept } from '../../../src/domain/models/Concept.ts'
import { PracticeSession } from '../../../src/domain/models/PracticeSession.ts'
import type { QuestionRepository } from '../../../src/domain/ports/QuestionRepository.ts'
import type { ConceptRepository } from '../../../src/domain/ports/ConceptRepository.ts'
import type { AiExplanationPort } from '../../../src/domain/ports/AiExplanationPort.ts'
import type { PracticeSessionRepository } from '../../../src/domain/ports/PracticeSessionRepository.ts'
import type { SourceRepository } from '../../../src/domain/ports/SourceRepository.ts'

describe('[Slice / App] Feature: GetConceptHintUseCase', () => {
  const sampleQuestion = new Question({
    id: 'q-hint-1',
    version: 1,
    topicId: 'topic-bonds',
    chapterId: 'chap-duration',
    type: 'CALCULATION',
    difficulty: 'HARD',
    status: 'PUBLISHED',
    prompt: '채권의 듀레이션에 영향을 미치는 요인으로 옳은 것은?',
    options: [
      { id: 'opt-1', text: '만기가 길수록 듀레이션은 짧아진다.' },
      { id: 'opt-2', text: '표면이율이 높을수록 듀레이션은 길어진다.' },
      { id: 'opt-3', text: '수익률이 상승할수록 듀레이션은 짧아진다.' },
      { id: 'opt-4', text: '쿠폰 지급 주기가 짧아질수록 듀레이션은 길어진다.' },
    ],
    correctOptionId: 'opt-3',
    explanation: '수익률이 상승하면 후기 현금흐름의 할인율이 커져 가중평균 만기(듀레이션)가 감소합니다.',
    conceptId: 'concept-bond-duration',
    sourceId: 'src-kofia-bond',
  })

  const sampleConcept = new Concept({
    conceptId: 'concept-bond-duration',
    topicId: 'topic-bonds',
    chapterId: 'chap-duration',
    title: '채권 듀레이션의 특성',
    body: '만기, 표면이율, 수익률과 듀레이션의 관계: 만기와는 비례, 표면이율 및 수익률과는 반비례 관계를 가집니다.',
    status: 'PUBLISHED',
    version: 1,
    sourceId: 'src-kofia-bond',
    locator: '채권운용 및 투자전략 p.120',
  })

  describe('Scenario: Requesting hint for IMPROVEMENT session', () => {
    it('Given improvement session and valid concept, When use case executes, Then returns generated hint DTO', async () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-imp-hint',
        learnerId: 'learner-1',
        purpose: 'IMPROVEMENT',
        blueprintId: 'bp-2026',
        targetQuestionCount: 5,
      })

      const mockQuestionRepo: QuestionRepository = {
        findById: async () => sampleQuestion,
        findNextForSession: async () => null,
      }
      const mockConceptRepo: ConceptRepository = {
        findById: async () => sampleConcept,
        findByTopicId: async () => [sampleConcept],
      }
      const mockAiPort: AiExplanationPort = {
        generateHint: async () => '힌트: 표면이율과 수익률은 듀레이션과 역(-)의 관계를 가집니다.',
        generateExplanation: async () => '',
      }
      const mockSessionRepo: PracticeSessionRepository = {
        findById: async () => session,
        save: async () => {},
      }
      const mockSourceRepo: SourceRepository = {
        findById: async () => ({
          id: 'src-kofia-bond',
          title: '금융투자협회 채권교재',
          url: 'https://kofia.or.kr',
        }),
      }

      const useCase = new GetConceptHintUseCase(
        mockQuestionRepo,
        mockConceptRepo,
        mockAiPort,
        mockSessionRepo,
        mockSourceRepo
      )

      // When
      const result = await useCase.execute({
        sessionId: 'sess-imp-hint',
        questionId: 'q-hint-1',
      })

      // Then
      assert.equal(result.conceptTitle, '채권 듀레이션의 특성')
      assert.match(result.hintText, /표면이율과 수익률은/)
      assert.equal(result.sourceTitle, '금융투자협회 채권교재')
    })
  })

  describe('Scenario: Requesting hint in DIAGNOSTIC session', () => {
    it('Given diagnostic session, When getHint is called, Then throws permission error', async () => {
      // Given
      const session = new PracticeSession({
        sessionId: 'sess-diag-hint',
        learnerId: 'learner-1',
        purpose: 'DIAGNOSTIC',
        blueprintId: 'bp-2026',
        targetQuestionCount: 17,
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
      const mockAiPort: AiExplanationPort = {
        generateHint: async () => 'hint',
        generateExplanation: async () => '',
      }

      const useCase = new GetConceptHintUseCase(
        mockQuestionRepo,
        mockConceptRepo,
        mockAiPort,
        mockSessionRepo
      )

      // When & Then
      await assert.rejects(
        () => useCase.execute({ sessionId: 'sess-diag-hint', questionId: 'q-hint-1' }),
        /Hints are not permitted for DIAGNOSTIC sessions/
      )
    })
  })
})
