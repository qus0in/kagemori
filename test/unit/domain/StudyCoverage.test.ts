import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { summarizeCoverage, type CoverageResult } from '../../../src/domain/models/StudyCoverage.ts'
import { coverageBlueprint as blueprint } from '../../helpers/coverageFixture.ts'
const answer = (questionId: string, topicId: string, isCorrect = true, hintUsed = false): CoverageResult =>
  ({ questionId, topicId, isCorrect, hintUsed })

describe('[Unit / Domain] Feature: Study coverage', () => {
  it('Given no answers, When summarized, Then shows zero and all remaining', () => {
    const result = summarizeCoverage(blueprint, [])
    assert.equal(result.percent, 0)
    assert.equal(result.remainingPercent, 100)
    assert.ok(result.subjects[0].topics.every((topic) => topic.status === 'empty'))
  })
  it('Given correct, wrong and assisted answers, When summarized, Then only independent correct fills', () => {
    const result = summarizeCoverage(blueprint, [answer('q1', 't0'), answer('q2', 't1', false), answer('q3', 't2', true, true)])
    assert.equal(result.percent, 33.3)
    assert.equal(result.remainingPercent, 66.7)
    assert.equal(result.review, 2)
  })
  it('Given repeated or unknown questions, When summarized, Then uses latest and known topics only', () => {
    const result = summarizeCoverage(blueprint, [answer('q1', 't0'), answer('q1', 't0', false), answer('x', 'unknown')])
    assert.equal(result.filled, 0)
    assert.equal(result.review, 1)
    assert.equal(result.subjects[0].topics[0].answered, 1)
  })
  it('Given every topic answered correctly, When summarized, Then reaches 100 without exceeding it', () => {
    const result = summarizeCoverage(blueprint, [answer('q1', 't0'), answer('q2', 't1'), answer('q3', 't2'), answer('q4', 't2')])
    assert.equal(result.percent, 100)
    assert.equal(result.remainingPercent, 0)
    assert.equal(result.filled, 3)
  })
  it('Given an empty blueprint, When summarized, Then never produces NaN', () => {
    assert.equal(summarizeCoverage({ ...blueprint, subjects: [] }, []).percent, 0)
  })
})
