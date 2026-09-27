import '../../helpers/registerTsx.ts'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const { NoticeSection } = await import('../../../src/ui/components/NoticeSection.tsx')
const { MainExamSummaryCard } = await import('../../../src/ui/components/main/MainExamSummaryCard.tsx')
const { MainStudyFeaturesCard } = await import('../../../src/ui/components/main/MainStudyFeaturesCard.tsx')
const { AboutPage } = await import('../../../src/ui/pages/AboutPage.tsx')

const renderWithRouter = (element: React.ReactElement) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, element))

describe('[Slice / UI] Feature: Main Landing & Notice Components', () => {
  describe('Scenario: NoticeSection rendering recent exam and platform updates', () => {
    it('Given NoticeSection, When rendered, Then contains 2026 standard textbook and exam schedule notices', () => {
      const html = renderWithRouter(createElement(NoticeSection))
      assert.ok(html.includes('수험 및 서비스 안내'))
      assert.ok(html.includes('2026.10.12'))
      assert.ok(html.includes('2026.11.08'))
      assert.ok(html.includes('매 과목 40% 이상'))
      assert.ok(html.includes('2026 표준교재 반영'))
      assert.ok(html.includes('Cloudflare D1'))
    })
  })

  describe('Scenario: MainExamSummaryCard rendering 2026 blueprint summary', () => {
    it('Given MainExamSummaryCard, When rendered, Then displays 3 subjects, passing rules, and links to catalog and about', () => {
      const html = renderWithRouter(createElement(MainExamSummaryCard))
      assert.ok(html.includes('2026 출제기준 및 과목 구성'))
      assert.ok(html.includes('제1과목: 금융투자분석 및 투자전략'))
      assert.ok(html.includes('35문항'))
      assert.ok(html.includes('제2과목: 투자분석 및 리스크관리'))
      assert.ok(html.includes('25문항'))
      assert.ok(html.includes('제3과목: 직무윤리·법규 및 자산관리'))
      assert.ok(html.includes('40문항'))
      assert.ok(html.includes('href="/catalog"'))
      assert.ok(html.includes('href="/about"'))
    })
  })

  describe('Scenario: MainStudyFeaturesCard rendering 3 study modes and highlights', () => {
    it('Given MainStudyFeaturesCard, When rendered, Then displays modes and link to /study', () => {
      const html = renderWithRouter(createElement(MainStudyFeaturesCard))
      assert.ok(html.includes('실전 대비 시험 문제 풀기'))
      assert.ok(html.includes('취약 영역 집중'))
      assert.ok(html.includes('출제기준 모의고사'))
      assert.ok(html.includes('시험 통과 점검'))
      assert.ok(html.includes('VERIFIED'))
      assert.ok(html.includes('href="/study"'))
    })
  })

  describe('Scenario: AboutPage navigation links and 2026 exam info', () => {
    it('Given AboutPage, When rendered, Then includes subject breakdown and navigation buttons', () => {
      const html = renderWithRouter(createElement(AboutPage))
      assert.ok(html.includes('자격시험 안내'))
      assert.ok(html.includes('2026 표준교재 3권 체계'))
      assert.ok(html.includes('href="/catalog"'))
      assert.ok(html.includes('href="/study"'))
      assert.ok(html.includes('href="/"'))
    })
  })
})
