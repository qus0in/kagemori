import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { useStudySession as store } from '../../../src/ui/hooks/useStudySession.ts'
import type { HttpStudyRepositoryContract } from '../../../src/infra/api/HttpStudyRepository.ts'
import type { PublicQuestionDto } from '../../../src/app/dto/StudyDto.ts'

const session = { sessionId: 's', purpose: 'DIAGNOSTIC' as const, targetQuestionCount: 6, currentQuestionIndex: 2 }
const question: PublicQuestionDto = { id: 'q', topicId: 't', prompt: '질문', options: [] }
const feedback = { isCorrect: true, correctOptionId: 'a', explanation: '해설' }
function repo(getNextQuestion: HttpStudyRepositoryContract['getNextQuestion']): HttpStudyRepositoryContract {
  return {
    createSession: async () => session, getNextQuestion,
    submitAnswer: async () => feedback, getHint: async () => ({ hint: '힌트' }),
  }
}

describe('[Slice / UI] Feature: Next-question recovery', () => {
  beforeEach(() => store.getState().resetSession())

  it('Given a timeout, When retried, Then preserves feedback until success and advances once', async () => {
    let calls = 0
    store.getState().setRepository(repo(async () => {
      if (++calls === 1) throw new Error('timeout')
      return { ...question, id: 'q-next', currentQuestionIndex: 3 }
    }))
    store.setState({ session, currentQuestion: question, feedback, selectedOptionId: 'a', hint: { hint: '힌트' } })
    await store.getState().nextQuestion()
    assert.equal(store.getState().feedback, feedback)
    assert.equal(store.getState().selectedOptionId, 'a')
    assert.equal(store.getState().hint?.hint, '힌트')
    await store.getState().nextQuestion()
    assert.equal(store.getState().currentQuestion?.id, 'q-next')
    assert.equal(store.getState().session?.currentQuestionIndex, 3)
    assert.equal(store.getState().feedback, null)
    assert.equal(store.getState().error, null)
  })

  it('Given first-question failure, When retried, Then reuses the created session', async () => {
    let calls = 0
    store.getState().setRepository(repo(async () => {
      if (++calls === 1) throw new Error('timeout')
      return question
    }))
    await store.getState().startSession('DIAGNOSTIC')
    assert.equal(store.getState().session?.sessionId, 's')
    await store.getState().nextQuestion()
    assert.equal(store.getState().currentQuestion?.id, 'q')
    assert.equal(store.getState().session?.currentQuestionIndex, 2)
  })

  it('Given pending retrieval, When clicked twice and then reset, Then ignores duplicate and stale response', async () => {
    let resolve!: (value: PublicQuestionDto) => void
    let calls = 0
    store.getState().setRepository(repo(() => { calls++; return new Promise((r) => { resolve = r }) }))
    store.setState({ session, currentQuestion: question, feedback })
    const pending = store.getState().nextQuestion()
    await store.getState().nextQuestion()
    assert.equal(calls, 1)
    store.getState().resetSession()
    resolve(question)
    await pending
    assert.equal(store.getState().session, null)
    assert.equal(store.getState().currentQuestion, null)
  })

  it('Given first retrieval pending, When reset, Then ignores its eventual response', async () => {
    let resolve!: (value: PublicQuestionDto) => void
    store.getState().setRepository(repo(() => new Promise((r) => { resolve = r })))
    const pending = store.getState().startSession('DIAGNOSTIC')
    await Promise.resolve()
    store.getState().resetSession()
    resolve(question)
    await pending
    assert.equal(store.getState().currentQuestion, null)
  })
})
