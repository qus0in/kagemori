import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { useStudySession } from '../../../src/ui/hooks/useStudySession.ts'
import type { HttpStudyRepositoryContract } from '../../../src/infra/api/HttpStudyRepository.ts'
import type {
  PublicQuestionDto,
  SubmitAnswerResponseDto,
  ConceptHintResponseDto,
} from '../../../src/app/dto/StudyDto.ts'
import type { SessionPurpose } from '../../../src/domain/models/PracticeSession.ts'

describe('[Slice / UI] Feature: useStudySession State Management & Transitions', () => {
  let mockRepo: HttpStudyRepositoryContract
  let nextQuestionsQueue: (PublicQuestionDto | null)[]

  beforeEach(() => {
    useStudySession.getState().resetSession()

    nextQuestionsQueue = [
      {
        id: 'q-101',
        topicId: 'topic-1',
        prompt: '1번 문제: 금융소비자보호법상 6대 판매원칙이 아닌 것은?',
        options: [
          { id: 'opt-1', text: '적합성 원칙' },
          { id: 'opt-2', text: '적정성 원칙' },
          { id: 'opt-3', text: '설명의무' },
          { id: 'opt-4', text: '수수료 담합의무' },
        ],
        currentQuestionIndex: 0,
        totalQuestions: 2,
      },
      {
        id: 'q-102',
        topicId: 'topic-2',
        prompt: '2번 문제: 자본시장법상 집합투자기구의 특징으로 옳은 것은?',
        options: [
          { id: 'opt-2-1', text: '투자자 1인으로 구성 가능' },
          { id: 'opt-2-2', text: '2인 이상에게서 모은 금전 운용' },
          { id: 'opt-2-3', text: '투자자의 직접 운용 지시 허용' },
          { id: 'opt-2-4', text: '원금 100% 보장' },
        ],
        currentQuestionIndex: 1,
        totalQuestions: 2,
      },
      null, // Finished
    ]

    mockRepo = {
      createSession: async (purpose: SessionPurpose, targetCount?: number) => ({
        sessionId: 'test-session-42',
        purpose,
        targetQuestionCount: targetCount ?? 2,
        currentQuestionIndex: 0,
      }),
      getNextQuestion: async () => {
        return nextQuestionsQueue.shift() ?? null
      },
      getHint: async (_sessionId: string, questionId: string): Promise<ConceptHintResponseDto> => ({
        questionId,
        hint: '불공정영업행위 금지 및 기본 원칙을 상기하세요.',
        conceptTitle: '6대 판매원칙',
        sourceTitle: '금융소비자보호법 해설',
      }),
      submitAnswer: async (
        _sessionId: string,
        request: { questionId: string; optionId: string; hintUsed: boolean; durationMs: number }
      ): Promise<SubmitAnswerResponseDto> => {
        const isFirst = request.questionId === 'q-101'
        const isCorrect = isFirst ? request.optionId === 'opt-4' : request.optionId === 'opt-2-2'
        return {
          isCorrect,
          correctOptionId: isFirst ? 'opt-4' : 'opt-2-2',
          explanation: isFirst ? '수수료 담합은 위법 행위입니다.' : '집합투자기구는 2인 이상 투자자 자금을 집합 운용합니다.',
          conceptTitle: isFirst ? '금융소비자보호' : '집합투자 정의',
          sourceTitle: '2026 표준교재',
          sourceUrl: 'https://example.com/source',
          isSessionCompleted: !isFirst,
          sessionProgress: {
            currentQuestionIndex: isFirst ? 1 : 2,
            totalQuestions: 2,
            isCompleted: !isFirst,
            correctCount: isCorrect ? (isFirst ? 1 : 2) : 0,
          },
        }
      },
    }

    useStudySession.getState().setRepository(mockRepo)
  })

  describe('Scenario: Initial state', () => {
    it('Given initialized store, When inspected, Then all study states are reset', () => {
      const state = useStudySession.getState()
      assert.equal(state.session, null)
      assert.equal(state.currentQuestion, null)
      assert.equal(state.selectedOptionId, null)
      assert.equal(state.hint, null)
      assert.equal(state.feedback, null)
      assert.equal(state.isCompleted, false)
      assert.deepEqual(state.score, { correctCount: 0, totalCount: 0 })
    })
  })

  describe('Scenario: Active study flow across multiple questions', () => {
    it('Given store and repository, When full session lifecycle runs, Then transitions smoothly from start to completion', async () => {
      // 1. Start session
      await useStudySession.getState().startSession('IMPROVEMENT', 2)
      let state = useStudySession.getState()

      assert.ok(state.session)
      assert.equal(state.session.sessionId, 'test-session-42')
      assert.equal(state.session.purpose, 'IMPROVEMENT')
      assert.ok(state.currentQuestion)
      assert.equal(state.currentQuestion.id, 'q-101')
      assert.equal(state.selectedOptionId, null)

      // 2. Request hint
      await useStudySession.getState().requestHint()
      state = useStudySession.getState()
      assert.ok(state.hint)
      assert.equal(state.hint.conceptTitle, '6대 판매원칙')

      // 3. Select option
      useStudySession.getState().selectOption('opt-4')
      state = useStudySession.getState()
      assert.equal(state.selectedOptionId, 'opt-4')

      // 4. Submit answer
      await useStudySession.getState().submitAnswer()
      state = useStudySession.getState()
      assert.ok(state.feedback)
      assert.equal(state.feedback.isCorrect, true)
      assert.equal(state.feedback.correctOptionId, 'opt-4')
      assert.equal(state.isCompleted, false) // 1st question done of 2
      assert.equal(state.score.correctCount, 1)

      // After feedback, selecting another option should be prohibited
      useStudySession.getState().selectOption('opt-1')
      assert.equal(useStudySession.getState().selectedOptionId, 'opt-4')

      // 5. Next question
      await useStudySession.getState().nextQuestion()
      state = useStudySession.getState()
      assert.ok(state.currentQuestion)
      assert.equal(state.currentQuestion.id, 'q-102')
      assert.equal(state.selectedOptionId, null)
      assert.equal(state.hint, null)
      assert.equal(state.feedback, null)

      // 6. Select and submit wrong answer for question 2
      useStudySession.getState().selectOption('opt-2-1')
      await useStudySession.getState().submitAnswer()
      state = useStudySession.getState()
      assert.ok(state.feedback)
      assert.equal(state.feedback.isCorrect, false)
      assert.equal(state.isCompleted, true) // Last question of session

      // 7. Reset session
      useStudySession.getState().resetSession()
      state = useStudySession.getState()
      assert.equal(state.session, null)
      assert.equal(state.currentQuestion, null)
      assert.equal(state.isCompleted, false)
    })
  })
})
