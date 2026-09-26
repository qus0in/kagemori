// test/integration/infra/GeminiAiAdapter.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GeminiAiAdapter } from '../../../src/infra/ai/GeminiAiAdapter.ts'

describe('[Integration / Infra] Feature: GeminiAiAdapter', () => {
  describe('Scenario: Deterministic offline fallback without GEMINI_API_KEY', () => {
    it('Given no apiKey, When generateHint is called, Then returns rule-based hint without network call', async () => {
      // Given
      const adapter = new GeminiAiAdapter()
      const conceptBody =
        '자본시장법 제3조에 따른 금융투자상품이란 이익을 얻거나 손실을 회피할 목적으로 취득하는 권리로서 원본손실위험이 있는 것을 의미한다.'
      const questionPrompt = '금융투자상품의 정의로 옳지 않은 것은?'

      // When
      const hint = await adapter.generateHint(conceptBody, questionPrompt)

      // Then
      assert.ok(hint.includes('[학습 힌트]'))
      assert.ok(hint.includes('자본시장법 제3조'))
    })

    it('Given no apiKey, When generateExplanation is called, Then returns rule-based explanation with correctness feedback', async () => {
      // Given
      const adapter = new GeminiAiAdapter()
      const conceptBody =
        '자본시장법 제4조에서 정한 증권의 6대 종류는 채무증권, 지분증권, 수익증권, 투자계약증권, 파생결합증권, 증권예탁증권이다.'
      const questionPrompt = '증권의 종류에 해당하지 않는 것은?'

      // When
      const explanation = await adapter.generateExplanation(
        conceptBody,
        questionPrompt,
        '장외파생증권',
        true
      )

      // Then
      assert.ok(explanation.includes('[정답 해설]'))
      assert.ok(explanation.includes('장외파생증권'))
    })
  })

  describe('Scenario: Calling Gemini REST API with provided apiKey and custom fetch', () => {
    it('Given apiKey and mocked fetch, When generateHint is called, Then invokes endpoint and parses candidate text', async () => {
      let capturedUrl = ''
      let capturedBody = ''

      const mockFetch: typeof fetch = async (input, init) => {
        capturedUrl = input.toString()
        capturedBody = init?.body?.toString() || ''
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Gemini generated hint: check article 3 definition.' }],
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const adapter = new GeminiAiAdapter({
        apiKey: 'test-api-key-12345',
        hintModel: 'gemini-3.5-flash-lite',
        fetchFn: mockFetch,
      })

      const hint = await adapter.generateHint('Concept text', 'Question prompt')

      assert.equal(hint, 'Gemini generated hint: check article 3 definition.')
      assert.ok(capturedUrl.includes('test-api-key-12345'))
      assert.ok(capturedUrl.includes('gemini-3.5-flash-lite'))
      assert.ok(capturedBody.includes('투자자산운용사'))
    })

    it('Given network error or HTTP 500 response, When generateHint is called, Then falls back gracefully without throwing', async () => {
      const errorFetch: typeof fetch = async () => {
        return new Response('Internal Server Error', { status: 500 })
      }

      const adapter = new GeminiAiAdapter({
        apiKey: 'test-api-key-err',
        fetchFn: errorFetch,
      })

      const hint = await adapter.generateHint('개념 본문입니다.', '문제 질문입니다.')
      assert.ok(hint.includes('[학습 힌트]'))
      assert.ok(hint.includes('개념 본문입니다.'))
    })
  })
})
