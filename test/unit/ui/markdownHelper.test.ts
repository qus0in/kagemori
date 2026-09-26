// test/unit/ui/markdownHelper.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeMarkdown } from '../../../src/ui/components/common/markdownHelper.ts'

describe('[Unit / UI] Feature: markdownHelper sanitization', () => {
  describe('Scenario: Sanitizing raw markdown text', () => {
    it('Given markdown with Windows carriage returns, When sanitized, Then normalizes to Unix newlines and trims', () => {
      const raw = '\r\n### [정답 여부 확인]\r\n* **응시자 선택지:** 정답\r\n   '
      const sanitized = sanitizeMarkdown(raw)

      assert.equal(sanitized, '### [정답 여부 확인]\n* **응시자 선택지:** 정답')
      assert.ok(!sanitized.includes('\r'))
    })

    it('Given empty or null content, When sanitized, Then returns empty string', () => {
      assert.equal(sanitizeMarkdown(''), '')
      assert.equal(sanitizeMarkdown('   '), '')
    })
  })
})
