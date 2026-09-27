import '../../helpers/registerTsx.ts'
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useStudySession } from '../../../src/ui/hooks/useStudySession.ts'
import type { HttpStudyRepositoryContract } from '../../../src/infra/api/HttpStudyRepository.ts'
import type { PublicQuestionDto } from '../../../src/app/dto/StudyDto.ts'

const { QuestionPostAnswerTools } = await import('../../../src/ui/components/question/QuestionPostAnswerTools.tsx')
const render = (props: object) => renderToStaticMarkup(createElement(QuestionPostAnswerTools, props))
const question = (id: string): PublicQuestionDto => ({ id, topicId: 't', prompt: id, options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }, { id: 'd', text: 'D' }] })

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => { resolve = r })
  return { promise, resolve }
}

describe('[Slice / UI] Feature: Explanation retry and concept diagram', () => {
  beforeEach(() => useStudySession.getState().resetSession())

  it('Given loading and result states, When rendered, Then shows spinners, the image and an AI caption', () => {
    const idle = render({ onRegenerateExplanation: () => {}, onRequestDiagram: () => {} })
    assert.ok(idle.includes('해설 다시 받기') && idle.includes('개념 도식 보기'))
    const busy = render({ onRegenerateExplanation: () => {}, isExplanationLoading: true, onRequestDiagram: () => {}, isDiagramLoading: true })
    assert.equal(busy.match(/loading-spinner/g)?.length, 2)
    const done = render({ onRequestDiagram: () => {}, diagram: { kind: 'image', imageUrl: '/api/diagram/1', model: 'm', cached: true }, postAnswerError: '실패' })
    assert.ok(done.includes('src="/api/diagram/1"') && done.includes('AI 생성 이미지') && done.includes('role="alert"'))
    assert.ok(!done.includes('개념 도식 보기'))
  })

  it('Given a retry, When the response arrives, Then replaces the explanation with the previous one sent to the server', async () => {
    let sent = ''
    const repo = {
      regenerateExplanation: async (_s: string, _q: string, previous: string) => { sent = previous; return { explanation: '새 해설' } },
    } as unknown as HttpStudyRepositoryContract
    useStudySession.getState().setRepository(repo)
    useStudySession.setState({
      session: { sessionId: 's', purpose: 'DIAGNOSTIC', targetQuestionCount: 2, currentQuestionIndex: 0 },
      currentQuestion: question('q1'), feedback: { isCorrect: false, correctOptionId: 'a', explanation: '옛 해설' },
    })
    await useStudySession.getState().regenerateExplanation()
    assert.equal(sent, '옛 해설')
    assert.equal(useStudySession.getState().feedback?.explanation, '새 해설')
    assert.equal(useStudySession.getState().isExplanationLoading, false)
  })

  it('Given the learner moved on, When a late diagram arrives, Then it is ignored', async () => {
    const pending = deferred<DiagramResponseDto>()
    const repo = { getDiagram: () => pending.promise } as unknown as HttpStudyRepositoryContract
    useStudySession.getState().setRepository(repo)
    useStudySession.setState({
      session: { sessionId: 's', purpose: 'DIAGNOSTIC', targetQuestionCount: 2, currentQuestionIndex: 0 },
      currentQuestion: question('q1'), feedback: { isCorrect: true, correctOptionId: 'a', explanation: 'x' },
    })
    const request = useStudySession.getState().requestDiagram()
    useStudySession.setState({ currentQuestion: question('q2'), feedback: null, diagram: null, isDiagramLoading: false })
    pending.resolve({ kind: 'image', imageUrl: '/api/diagram/late', model: 'm', cached: false })
    await request
    assert.equal(useStudySession.getState().diagram, null)
  })
})
