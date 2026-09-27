import '../../helpers/registerTsx.ts'
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useStudySession } from '../../../src/ui/hooks/useStudySession.ts'
import { initialStudyState, type StudySessionState } from '../../../src/ui/hooks/useStudySessionTypes.ts'
import type { HttpStudyRepositoryContract } from '../../../src/infra/api/HttpStudyRepository.ts'
import type { PublicQuestionDto } from '../../../src/app/dto/StudyDto.ts'

const { StudyActiveSection } = await import('../../../src/ui/components/study/StudyActiveSection.tsx')
const question = (id: string): PublicQuestionDto => ({ id, topicId: 't', prompt: id, options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }, { id: 'd', text: 'D' }] })
const preparing = { preparing: true as const, remainingMs: 40_000, retryAfterMs: 20 }
const session = { sessionId: 's', purpose: 'DIAGNOSTIC' as const, targetQuestionCount: 3, currentQuestionIndex: 2 }

function answeredState() {
  useStudySession.setState({ session, currentQuestion: question('q2'), feedback: { isCorrect: true, correctOptionId: 'a', explanation: 'x' } })
}

describe('[Slice / UI] Feature: Waiting for background generation', () => {
  beforeEach(() => useStudySession.getState().resetSession())

  it('Given the slot is preparing, When polling, Then shows the wait state and moves on once the AI question arrives', async () => {
    const responses: unknown[] = [preparing, preparing, question('gq-1')]
    const calls: boolean[] = []
    useStudySession.getState().setRepository({
      getNextQuestion: async (_id: string, useExisting?: boolean) => { calls.push(!!useExisting); return responses.shift() },
    } as unknown as HttpStudyRepositoryContract)
    answeredState()
    const done = useStudySession.getState().nextQuestion()
    await new Promise((r) => setTimeout(r, 5))
    assert.deepEqual(useStudySession.getState().preparingNext, { remainingMs: 40_000 })
    await done
    assert.equal(useStudySession.getState().currentQuestion?.id, 'gq-1')
    assert.equal(useStudySession.getState().preparingNext, null)
    assert.deepEqual(calls, [false, false, false])
  })

  it('Given the learner opts out, When still preparing, Then requests the existing fallback question', async () => {
    const calls: boolean[] = []
    useStudySession.getState().setRepository({
      getNextQuestion: async (_id: string, useExisting?: boolean) => { calls.push(!!useExisting); return useExisting ? question('q-fallback') : { ...preparing, retryAfterMs: 10_000 } },
    } as unknown as HttpStudyRepositoryContract)
    answeredState()
    const done = useStudySession.getState().nextQuestion()
    await new Promise((r) => setTimeout(r, 5))
    useStudySession.getState().useExistingQuestion()
    await done
    assert.equal(useStudySession.getState().currentQuestion?.id, 'q-fallback')
    assert.deepEqual(calls, [false, true])
  })

  it('Given a preparing state, When rendered, Then explains the wait and offers the existing question', () => {
    const noop = async () => {}
    const store: StudySessionState = {
      ...initialStudyState, session, currentQuestion: question('q2'), isLoadingQuestion: true, preparingNext: { remainingMs: 12_300 },
      setRepository: () => {}, startSession: noop, selectOption: () => {}, requestHint: noop, submitAnswer: noop, nextQuestion: noop,
      resetSession: () => {}, regenerateExplanation: noop, requestDiagram: noop, useExistingQuestion: () => {},
    }
    const html = renderToStaticMarkup(createElement(StudyActiveSection, { store }))
    assert.ok(html.includes('AI가 새 문제를 만들고 검수하는 중이에요 · 최대 약 13초'))
    assert.ok(html.includes('기존 문제로 바로 풀기'))
  })
})
