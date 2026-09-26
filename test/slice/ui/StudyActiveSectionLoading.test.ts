import '../../helpers/registerTsx.ts'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { initialStudyState, type StudySessionState } from '../../../src/ui/hooks/useStudySessionTypes.ts'

const { StudyActiveSection } = await import('../../../src/ui/components/study/StudyActiveSection.tsx')
const noop = async () => {}

function render(isLoadingQuestion: boolean): string {
  const store: StudySessionState = {
    ...initialStudyState,
    session: { sessionId: 's1', purpose: 'IMPROVEMENT', targetQuestionCount: 5, currentQuestionIndex: 0 },
    currentQuestion: { id: 'q1', topicId: 't1', prompt: '체계적 위험은?', options: [{ id: 'a', text: '베타' }] },
    selectedOptionId: 'a',
    feedback: { isCorrect: true, correctOptionId: 'a', explanation: '시장위험' },
    isLoadingQuestion,
    setRepository: () => {}, startSession: noop, selectOption: () => {}, requestHint: noop,
    submitAnswer: noop, nextQuestion: noop, resetSession: () => {},
  }
  return renderToStaticMarkup(createElement(StudyActiveSection, { store }))
}

describe('[Slice / UI] Feature: StudyActiveSection next-question loading', () => {
  describe('Scenario: Moving to the next question', () => {
    it('Given the next question is loading, When rendered, Then dims and freezes the card behind a spinner', () => {
      const html = render(true)
      assert.ok(html.includes('aria-busy="true"'))
      assert.ok(html.includes('inert=""'))
      assert.ok(html.includes('opacity-40'))
      assert.ok(html.includes('loading-spinner'))
      assert.ok(html.includes('다음 문제를 불러오는 중이에요'))
      assert.ok(html.includes('체계적 위험은?'))
    })

    it('Given loading has finished, When rendered, Then the card is interactive without the overlay', () => {
      const html = render(false)
      assert.ok(!html.includes('inert'))
      assert.ok(!html.includes('opacity-40'))
      assert.ok(!html.includes('다음 문제를 불러오는 중이에요'))
    })
  })
})
