import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { useStudySession } from '../../../src/ui/hooks/useStudySession.ts'
import { useStudyCoverage } from '../../../src/ui/store/useStudyCoverage.ts'
import type { HttpStudyRepositoryContract } from '../../../src/infra/api/HttpStudyRepository.ts'

describe('[Slice / UI] Feature: Coverage from graded answers', () => {
  beforeEach(() => {
    useStudySession.getState().resetSession()
    useStudyCoverage.getState().clear()
    useStudySession.setState({
      session: { sessionId: 'session', purpose: 'IMPROVEMENT', targetQuestionCount: 5, currentQuestionIndex: 0 },
      currentQuestion: { id: 'q1', topicId: 't0', prompt: '질문', options: [{ id: 'a', text: '보기' }] },
      selectedOptionId: 'a',
    })
  })
  function repository(submitAnswer: HttpStudyRepositoryContract['submitAnswer']): HttpStudyRepositoryContract {
    return {
      createSession: async () => { throw new Error('unused') },
      getNextQuestion: async () => null,
      getHint: async () => ({ hint: '힌트' }),
      submitAnswer,
    }
  }
  it('Given successful grading, When resubmitting and resetting the session, Then retains exactly one result', async () => {
    let calls = 0
    useStudySession.getState().setRepository(repository(async () => {
      calls++
      return { isCorrect: true, correctOptionId: 'a', explanation: '해설' }
    }))
    await useStudySession.getState().submitAnswer()
    await useStudySession.getState().submitAnswer()
    useStudySession.getState().resetSession()
    assert.equal(calls, 1)
    assert.deepEqual(useStudyCoverage.getState().results, [
      { questionId: 'q1', topicId: 't0', isCorrect: true, hintUsed: false },
    ])
  })
  it('Given a grading failure, When submitted, Then does not record progress', async () => {
    useStudySession.getState().setRepository(repository(async () => { throw new Error('offline') }))
    await useStudySession.getState().submitAnswer()
    assert.equal(useStudyCoverage.getState().results.length, 0)
    assert.equal(useStudySession.getState().error, 'offline')
  })
  it('Given a hinted correct answer, When graded, Then records the hint separately', async () => {
    useStudySession.setState({ hint: { hint: '힌트' } })
    useStudySession.getState().setRepository(repository(async () => ({ isCorrect: true, correctOptionId: 'a', explanation: '해설' })))
    await useStudySession.getState().submitAnswer()
    assert.equal(useStudyCoverage.getState().results[0].hintUsed, true)
  })
})
