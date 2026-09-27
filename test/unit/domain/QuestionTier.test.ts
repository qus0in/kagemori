// test/unit/domain/QuestionTier.test.ts

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { tierOfReview } from '../../../src/domain/models/GeneratedQuestion.ts'

describe('[Unit / Domain] Feature: Generated question verification tier', () => {
  it('Given every gate passed, When tier is decided, Then returns VERIFIED', () => {
    // Given / When
    const tier = tierOfReview(true, true, true, true)

    // Then
    assert.equal(tier, 'VERIFIED')
  })

  it('Given the answer gate failed, When tier is decided, Then returns REVIEWED', () => {
    // Given / When / Then
    assert.equal(tierOfReview(false, true, true, true), 'REVIEWED')
  })

  it('Given cross review was skipped, When tier is decided, Then returns REVIEWED', () => {
    // Given / When / Then
    assert.equal(tierOfReview(true, false, true, true), 'REVIEWED')
  })

  it('Given screening did not run, When tier is decided, Then returns REVIEWED', () => {
    // Given / When / Then
    assert.equal(tierOfReview(true, true, false, true), 'REVIEWED')
  })

  it('Given dedupe was not checked, When tier is decided, Then returns REVIEWED', () => {
    // Given / When / Then
    assert.equal(tierOfReview(true, true, true, false), 'REVIEWED')
  })
})
