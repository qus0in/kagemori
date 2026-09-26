import '../../helpers/registerTsx.ts'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { coverageBlueprint as blueprint } from '../../helpers/coverageFixture.ts'

const { StudyCoverageMap } = await import('../../../src/ui/components/study/StudyCoverageMap.tsx')
const { StudyPage } = await import('../../../src/ui/pages/StudyPage.tsx')

describe('[Slice / UI] Feature: Study coverage visualization', () => {
  it('Given mixed results, When rendered, Then shows filled areas, percent, remaining and accessible statuses', () => {
    const html = renderToStaticMarkup(createElement(StudyCoverageMap, {
      blueprint, results: [
        { questionId: 'q1', topicId: 't0', isCorrect: true, hintUsed: false },
        { questionId: 'q2', topicId: 't1', isCorrect: false, hintUsed: false },
      ],
    }))
    assert.ok(html.includes('aria-valuenow="33.3"'))
    assert.ok(html.includes('width:33.3%'))
    assert.ok(html.includes('앞으로 66.7%'))
    assert.ok(html.includes('세제: 정답 확인'))
    assert.ok(html.includes('금융상품: 복습 필요'))
    assert.ok(html.includes('부동산: 미풀이'))
  })
  it('Given a fresh study page, When rendered, Then places coverage directly after the three mode cards', () => {
    const client = new QueryClient()
    client.setQueryData(['catalog', 'blueprint'], blueprint)
    const html = renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(StudyPage)))
    assert.ok(html.indexOf('실전 점검') < html.indexOf('나의 학습 지도'))
    assert.ok(html.includes('aria-valuenow="0"'))
    assert.ok(html.includes('앞으로 100%'))
    client.clear()
  })
})
