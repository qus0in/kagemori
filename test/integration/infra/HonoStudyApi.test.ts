// test/integration/infra/HonoStudyApi.test.ts
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import app, { resetDefaultStudyRepo } from '../../../worker/index.ts'
import type {
  CreateSessionResponseDto,
  PublicQuestionDto,
  ConceptHintResponseDto,
  SubmitAnswerResponseDto,
} from '../../../src/app/dto/StudyDto.ts'

describe('[Integration / Infra] Feature: Hono Study Endpoints', () => {
  beforeEach(() => {
    resetDefaultStudyRepo()
  })

  describe('Scenario: End-to-end adaptive study session flow', () => {
    it('Given Hono worker, When session is created, questions fetched without answers, hint requested, and answer submitted, Then completes full study cycle correctly', async () => {
      // 1. Create a study session with targetCount = 2 and purpose = IMPROVEMENT
      const createRes = await app.request('/api/study/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: 'IMPROVEMENT',
          targetCount: 2,
        }),
      })

      assert.equal(createRes.status, 201)
      const sessionData = (await createRes.json()) as CreateSessionResponseDto
      assert.ok(sessionData.sessionId.startsWith('sess-'))
      assert.equal(sessionData.purpose, 'IMPROVEMENT')
      assert.equal(sessionData.targetQuestionCount, 2)
      assert.equal(sessionData.currentQuestionIndex, 0)

      const sessionId = sessionData.sessionId

      // 2. Fetch the first question: verify answers and internal explanations are NOT leaked
      const nextRes1 = await app.request(`/api/study/session/${sessionId}/next`)
      assert.equal(nextRes1.status, 200)

      const question1 = (await nextRes1.json()) as PublicQuestionDto & {
        correctOptionId?: unknown
        explanation?: unknown
      }

      assert.ok(question1.id)
      assert.equal(question1.options.length, 4)
      assert.equal(question1.currentQuestionIndex, 0)
      assert.equal(question1.totalQuestions, 2)

      // Strict security check: neither correctOptionId nor explanation may exist in public response
      assert.equal(question1.correctOptionId, undefined)
      assert.equal(question1.explanation, undefined)

      // 3. Request hint for question 1
      const hintRes = await app.request(`/api/study/session/${sessionId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question1.id,
        }),
      })

      assert.equal(hintRes.status, 200)
      const hintData = (await hintRes.json()) as ConceptHintResponseDto
      assert.equal(hintData.questionId, question1.id)
      assert.ok(hintData.hint || hintData.hintText)
      assert.ok(hintData.conceptTitle)

      // 4. Submit an answer for question 1
      const submitRes1 = await app.request(`/api/study/session/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question1.id,
          optionId: question1.options[0].id,
          hintUsed: true,
          durationMs: 3200,
        }),
      })

      assert.equal(submitRes1.status, 200)
      const submitData1 = (await submitRes1.json()) as SubmitAnswerResponseDto
      assert.equal(typeof submitData1.isCorrect, 'boolean')
      assert.ok(submitData1.correctOptionId)
      assert.ok(submitData1.explanation)
      assert.ok(submitData1.sessionProgress)
      assert.equal(submitData1.sessionProgress?.currentQuestionIndex, 1)
      assert.equal(submitData1.sessionProgress?.totalQuestions, 2)
      assert.equal(submitData1.sessionProgress?.isCompleted, false)

      // 5. Fetch next (second) question
      const nextRes2 = await app.request(`/api/study/session/${sessionId}/next`)
      assert.equal(nextRes2.status, 200)
      const question2 = (await nextRes2.json()) as PublicQuestionDto
      assert.notEqual(question2.id, question1.id)
      assert.equal(question2.currentQuestionIndex, 1)

      // 6. Submit answer for question 2 (using correct option)
      const submitRes2 = await app.request(`/api/study/session/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question2.id,
          optionId: question2.options[0].id,
          hintUsed: false,
          durationMs: 1500,
        }),
      })

      assert.equal(submitRes2.status, 200)
      const submitData2 = (await submitRes2.json()) as SubmitAnswerResponseDto
      assert.equal(submitData2.sessionProgress?.currentQuestionIndex, 2)
      assert.equal(submitData2.sessionProgress?.isCompleted, true)

      // 7. Verify session completion when calling next again
      const completedRes = await app.request(`/api/study/session/${sessionId}/next`)
      assert.equal(completedRes.status, 200)
      const completedData = (await completedRes.json()) as { completed: boolean }
      assert.equal(completedData.completed, true)
    })
  })

  describe('Scenario: Session validation and error handling', () => {
    it('Given non-existent session ID, When requested, Then returns 404', async () => {
      const res = await app.request('/api/study/session/sess-invalid-999/next')
      assert.equal(res.status, 404)
    })

    it('Given DIAGNOSTIC session, When hint is requested, Then returns 400 error because hints are disabled for diagnostics', async () => {
      // Create diagnostic session
      const createRes = await app.request('/api/study/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'DIAGNOSTIC' }),
      })
      const { sessionId } = (await createRes.json()) as CreateSessionResponseDto

      // Fetch first question
      const nextRes = await app.request(`/api/study/session/${sessionId}/next`)
      const question = (await nextRes.json()) as PublicQuestionDto

      // Request hint
      const hintRes = await app.request(`/api/study/session/${sessionId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id }),
      })

      assert.equal(hintRes.status, 400)
      const err = (await hintRes.json()) as { error: string }
      assert.ok(err.error.includes('Hints are not permitted'))
    })
  })
})
