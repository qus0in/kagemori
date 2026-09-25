import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CatalogRules, type ExamSubject } from '../../../src/domain/models/Catalog.ts'

describe('[Unit / Domain] Feature: CatalogRules and Passing Logic', () => {
  const dummySubjects: ExamSubject[] = [
    {
      id: 'subj-1',
      blueprintId: 'bp-2026',
      ordinal: 1,
      title: '제1과목 금융상품 및 세제',
      questionCount: 20,
      minimumCorrect: 8,
      topics: [],
    },
    {
      id: 'subj-2',
      blueprintId: 'bp-2026',
      ordinal: 2,
      title: '제2과목 투자운용 및 전략 Ⅱ · 투자분석',
      questionCount: 30,
      minimumCorrect: 12,
      topics: [],
    },
    {
      id: 'subj-3',
      blueprintId: 'bp-2026',
      ordinal: 3,
      title: '제3과목 직무윤리 및 법규 · 투자운용 및 전략 Ⅰ 등',
      questionCount: 50,
      minimumCorrect: 20,
      topics: [],
    },
  ]

  describe('Scenario: Total questions calculation', () => {
    it('Given 3 exam subjects, When calculateTotalQuestions is called, Then returns 100', () => {
      // When
      const total = CatalogRules.calculateTotalQuestions(dummySubjects)

      // Then
      assert.equal(total, 100)
    })
  })

  describe('Scenario: Subject pass criteria (과락 판정)', () => {
    it('Given 1st subject requiring 8 minimum correct, When score is 7, Then isSubjectPassed returns false', () => {
      assert.equal(CatalogRules.isSubjectPassed(dummySubjects[0], 7), false)
    })

    it('Given 1st subject requiring 8 minimum correct, When score is 8, Then isSubjectPassed returns true', () => {
      assert.equal(CatalogRules.isSubjectPassed(dummySubjects[0], 8), true)
    })
  })

  describe('Scenario: Exam pass criteria (총점 및 과락 종합 판정)', () => {
    it('Given subject scores 18, 25, 40 (sum 83), When isExamPassed is called, Then returns true', () => {
      const scores = [
        { subjectId: 'subj-1', correctCount: 18 },
        { subjectId: 'subj-2', correctCount: 25 },
        { subjectId: 'subj-3', correctCount: 40 },
      ]
      assert.equal(CatalogRules.isExamPassed(scores, dummySubjects), true)
    })

    it('Given total score is 75 but 1st subject has 7 (below 8 과락), When isExamPassed is called, Then returns false', () => {
      const scores = [
        { subjectId: 'subj-1', correctCount: 7 }, // 과락!
        { subjectId: 'subj-2', correctCount: 28 },
        { subjectId: 'subj-3', correctCount: 40 },
      ]
      assert.equal(CatalogRules.isExamPassed(scores, dummySubjects), false)
    })

    it('Given no subjects failed 과락 but total score is 69 (below 70), When isExamPassed is called, Then returns false', () => {
      const scores = [
        { subjectId: 'subj-1', correctCount: 10 },
        { subjectId: 'subj-2', correctCount: 19 },
        { subjectId: 'subj-3', correctCount: 40 }, // total 69
      ]
      assert.equal(CatalogRules.isExamPassed(scores, dummySubjects), false)
    })
  })
})
