import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import ky, { TimeoutError } from 'ky'
import { HttpStudyRepository } from '../../../src/infra/api/HttpStudyRepository.ts'

describe('[Integration / Infra] Feature: Read-only question retries', () => {
  it('Given a transient timeout, When fetching a question, Then retries once successfully', async () => {
    let calls = 0
    const http = ky.create({ fetch: async () => {
      if (++calls === 1) throw new TimeoutError(new Request('https://example.com/next'))
      return Response.json({ id: 'q', topicId: 't', prompt: '질문', options: [] })
    } })
    const repo = new HttpStudyRepository('https://example.com', http)
    assert.equal((await repo.getNextQuestion('s'))?.id, 'q')
    assert.equal(calls, 2)
  })
  it('Given repeated timeouts, When retries are exhausted, Then shows a recoverable Korean error', async () => {
    let calls = 0
    const http = ky.create({ fetch: async () => {
      calls++
      throw new TimeoutError(new Request('https://example.com/next'))
    } })
    await assert.rejects(new HttpStudyRepository('https://example.com', http).getNextQuestion('s'), /다시 불러오기/)
    assert.equal(calls, 2)
  })
  it('Given a missing session, When queried, Then does not retry a 404', async () => {
    let calls = 0
    const http = ky.create({ fetch: async () => { calls++; return new Response('missing', { status: 404 }) } })
    await assert.rejects(new HttpStudyRepository('https://example.com', http).getNextQuestion('s'))
    assert.equal(calls, 1)
  })
})
