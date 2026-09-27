// test/unit/domain/MockExamPool.test.ts

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Question } from '../../../src/domain/models/Question.ts'
import {
  MOCK_EXAM_AI_MAX_RATIO,
  selectMockExamPool,
} from '../../../src/domain/models/MockExamPool.ts'

function makeQuestion(id: string, topicId: string): Question {
  return new Question({
    id,
    version: 1,
    topicId,
    chapterId: 'ch-1',
    type: 'CONCEPT',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    prompt: `문항 ${id}`,
    options: [
      { id: `${id}-o1`, text: '보기 1' },
      { id: `${id}-o2`, text: '보기 2' },
      { id: `${id}-o3`, text: '보기 3' },
      { id: `${id}-o4`, text: '보기 4' },
    ],
    correctOptionId: `${id}-o1`,
    explanation: '해설',
    conceptId: `c-${id}`,
    sourceId: '',
  })
}

const baseQuestions = (n: number): Question[] =>
  Array.from({ length: n }, (_, i) => makeQuestion(`q-${i + 1}`, `t-base-${i + 1}`))

const verifiedQuestions = (n: number): Question[] =>
  Array.from({ length: n }, (_, i) => makeQuestion(`gq-${i + 1}`, `t-ai-${i + 1}`))

const idsOf = (questions: readonly Question[]): string[] => questions.map((q) => q.id)

describe('[Unit / Domain] Feature: Mock exam verified question pool', () => {
  it('Given a REVIEWED generated question and a VERIFIED one, When selected, Then only VERIFIED enters', () => {
    // Given
    const base = makeQuestion('q-base', 't-base')
    const reviewed = makeQuestion('gq-reviewed', 't-reviewed')
    const verified = makeQuestion('gq-verified', 't-verified')
    const verifiedIds = new Set(['gq-verified'])

    // When
    const result = selectMockExamPool([base, reviewed, verified], verifiedIds, 10, 'seed-mix')

    // Then
    assert.deepEqual(idsOf(result), ['q-base', 'gq-verified'])
    assert.equal(idsOf(result).includes('gq-reviewed'), false)
  })

  it('Given 6 VERIFIED AI questions with count 10, When selected, Then exactly 4 AI are sampled', () => {
    // Given
    const base = baseQuestions(2)
    const ai = verifiedQuestions(6)
    const verifiedIds = new Set(idsOf(ai))

    // When
    const ids = idsOf(selectMockExamPool([...base, ...ai], verifiedIds, 10, 'seed-cap'))

    // Then
    assert.equal(MOCK_EXAM_AI_MAX_RATIO, 0.4)
    assert.deepEqual(ids.slice(0, 2), ['q-1', 'q-2'])
    assert.equal(ids.filter((id) => id.startsWith('gq-')).length, 4)
    assert.equal(ids.length, 6)
  })

  it('Given count 0 so no AI allowance, When selected, Then every non-generated question is kept', () => {
    // Given
    const base = baseQuestions(5)
    const ai = verifiedQuestions(3)
    const verifiedIds = new Set(idsOf(ai))

    // When
    const result = selectMockExamPool([...ai, ...base], verifiedIds, 0, 'seed-base')

    // Then
    assert.deepEqual(idsOf(result), ['q-1', 'q-2', 'q-3', 'q-4', 'q-5'])
  })

  it('Given the same shuffleSeed, When selected twice, Then the verified sample is identical', () => {
    // Given
    const base = baseQuestions(2)
    const ai = verifiedQuestions(6)
    const verifiedIds = new Set(idsOf(ai))
    const pool = [...base, ...ai]

    // When
    const first = selectMockExamPool(pool, verifiedIds, 10, 'seed-repeat')
    const second = selectMockExamPool(pool, verifiedIds, 10, 'seed-repeat')

    // Then
    assert.deepEqual(idsOf(first), idsOf(second))
  })
})
