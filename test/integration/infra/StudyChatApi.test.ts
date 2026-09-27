import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import app from '../../../worker/index.ts'
import { sqliteD1 } from '../../helpers/storageHarness.ts'

describe('[Integration / Infra] Feature: Study Chat API with current question reference', () => {
  it('Given currentQuestion in request, When chat is asked, Then injects current question context into prompt and returns 200', async () => {
    const { db, sqlite } = sqliteD1()
    let capturedPrompt = ''
    const env = {
      DB: db,
      STORAGE_MODE: 'local' as const,
      CHAT_ANSWER: {
        execute: async (req: { model: string; prompt: string; tokens: number }) => {
          capturedPrompt = req.prompt
          return '현재 문항은 PER 계산에 관한 문제입니다. 주가를 주당순이익으로 나누어 계산할 수 있습니다.'
        },
      },
    }

    const res = await app.request('/api/study/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '이 문제 푸는 공식이 뭐야?',
        currentQuestion: {
          id: 'q-cma-001',
          prompt: '주가 20,000원, EPS 2,000원일 때 PER은?',
          topicId: 'topic-2-3',
          options: ['10배', '20배', '5배', '0.1배'],
        },
      }),
    }, env)

    assert.equal(res.status, 200)
    const json = await res.json() as { answer: string; currentQuestion?: { id: string; topicId: string } }
    assert.ok(json.answer.includes('PER'))
    assert.equal(json.currentQuestion?.id, 'q-cma-001')
    assert.equal(json.currentQuestion?.topicId, 'topic-3-2')
    assert.ok(capturedPrompt.includes('현재 학습자가 풀고 있는 문항'))
    assert.ok(capturedPrompt.includes('q-cma-001'))
    assert.ok(capturedPrompt.includes('정답 선지 번호(예: 3번)를 직접 노출하지 마세요'))
    sqlite.close()
  })

  it('Given empty message, When posted, Then returns 400 INVALID_INPUT', async () => {
    const { db, sqlite } = sqliteD1()
    const env = { DB: db }
    const res = await app.request('/api/study/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' }),
    }, env)
    assert.equal(res.status, 400)
    sqlite.close()
  })
})
