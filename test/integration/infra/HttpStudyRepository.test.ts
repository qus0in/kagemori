import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import ky from 'ky'
import { HttpStudyRepository } from '../../../src/infra/api/HttpStudyRepository.ts'

describe('[Integration / Infra] Feature: HttpStudyRepository using ky', () => {
  describe('Scenario: Session creation, question retrieval, hint, and submission', () => {
    it('Given mocked ky responses, When repository methods are called, Then returns expected typed responses', async () => {
      // Mock ky
      const mockKy = {
        post: (url: string, options?: { json?: unknown }) => {
          if (url.endsWith('/session')) {
            return {
              json: async () => ({
                sessionId: 'sess-test-123',
                purpose: 'IMPROVEMENT',
                targetQuestionCount: 5,
                currentQuestionIndex: 0,
              }),
            }
          }
          if (url.includes('/submit')) {
            return {
              json: async () => ({
                isCorrect: true,
                correctOptionId: 'opt-1',
                explanation: 'Detailed concept explanation',
                conceptTitle: '자본시장법 총칙',
                sourceTitle: '표준교재 3권',
                sessionProgress: {
                  currentQuestionIndex: 1,
                  totalQuestions: 5,
                  isCompleted: false,
                  correctCount: 1,
                },
              }),
            }
          }
          if (url.includes('/hint')) {
            return {
              json: async () => ({
                questionId: 'q-1',
                hint: 'Look closely at investor protections',
                conceptTitle: '금융소비자보호',
              }),
            }
          }
          throw new Error(`Unhandled POST url: ${url}`)
        },
        get: (url: string) => {
          if (url.includes('/next')) {
            return {
              json: async () => ({
                id: 'q-1',
                topicId: 'topic-1',
                prompt: '다음 중 투자권유대행인의 업무 범위로 옳은 것은?',
                options: [
                  { id: 'opt-1', text: '단순 투자권유' },
                  { id: 'opt-2', text: '계약체결 대리' },
                  { id: 'opt-3', text: '투자금 직접 수령' },
                  { id: 'opt-4', text: '일임계약 체결' },
                ],
                currentQuestionIndex: 0,
                totalQuestions: 5,
              }),
            }
          }
          throw new Error(`Unhandled GET url: ${url}`)
        },
      } as unknown as typeof ky

      const repo = new HttpStudyRepository('/api/study', mockKy)

      // 1. Create session
      const session = await repo.createSession('IMPROVEMENT', 5)
      assert.equal(session.sessionId, 'sess-test-123')
      assert.equal(session.purpose, 'IMPROVEMENT')
      assert.equal(session.targetQuestionCount, 5)

      // 2. Get next question
      const question = await repo.getNextQuestion(session.sessionId)
      assert.ok(question)
      assert.equal(question.id, 'q-1')
      assert.equal(question.options.length, 4)

      // 3. Get hint
      const hint = await repo.getHint(session.sessionId, question.id)
      assert.equal(hint.questionId, 'q-1')
      assert.equal(hint.hint, 'Look closely at investor protections')

      // 4. Submit answer
      const feedback = await repo.submitAnswer(session.sessionId, {
        questionId: question.id,
        optionId: 'opt-1',
        hintUsed: true,
        durationMs: 4000,
      })
      assert.equal(feedback.isCorrect, true)
      assert.equal(feedback.correctOptionId, 'opt-1')
      assert.equal(feedback.sessionProgress?.correctCount, 1)
    })

    it('Given completion response from server, When getNextQuestion is called, Then returns null', async () => {
      const mockKy = {
        get: () => ({
          json: async () => ({
            completed: true,
            message: 'All questions completed',
          }),
        }),
      } as unknown as typeof ky

      const repo = new HttpStudyRepository('/api/study', mockKy)
      const question = await repo.getNextQuestion('sess-done')
      assert.equal(question, null)
    })
  })
})
