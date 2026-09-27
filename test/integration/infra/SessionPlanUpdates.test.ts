import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { StudySessionDO } from '../../../worker/do/StudySessionDO.ts'
import { InMemoryStudyRepository } from '../../../src/infra/study/InMemoryStudyRepository.ts'
import { DurableObjectSessionRepository } from '../../../src/infra/study/DurableObjectSessionRepository.ts'
import { SubmitAnswerUseCase } from '../../../src/app/usecases/SubmitAnswerUseCase.ts'
import { updateSessionWithRetry } from '../../../src/app/usecases/SessionPlanUpdates.ts'
import { memoryDOState } from '../../helpers/storageHarness.ts'

const plan = { status: 'running', from: 2, until: 4, deadline: '2026-09-27T00:01:00Z', lockedIndex: -1 }
const base = { sessionId: 's', learnerId: 'l', purpose: 'DIAGNOSTIC', blueprintId: 'b', targetQuestionCount: 4,
  currentQuestionIndex: 0, isCompleted: false, attempts: [], questionIds: ['q-cma-001', 'q-cma-002', 'q-cma-003', 'q-cma-004'], generation: plan }

function durableObject() {
  const object = new StudySessionDO(memoryDOState().state)
  let revision = 0
  const save = async (session: unknown) => {
    const res = await object.fetch(new Request('https://session.internal/session', { method: 'POST', body: JSON.stringify({ session, expectedRevision: revision || null }) }))
    if (res.ok) revision++
    return res.status
  }
  return { object, save }
}

describe('[Integration / Infra] Feature: Durable plan updates during background generation', () => {
  it('Given a generation plan, When updating without answers, Then allows locks and swaps of free slots only', async () => {
    const { save } = durableObject()
    assert.equal(await save(base), 200)
    assert.equal(await save({ ...base, generation: { ...plan, lockedIndex: 2 } }), 200)
    assert.equal(await save({ ...base, generation: { ...plan, lockedIndex: 1 } }), 400)
    const swapLocked = { ...base, questionIds: ['q-cma-001', 'q-cma-002', 'gq-x', 'q-cma-004'], generation: { ...plan, lockedIndex: 2, status: 'done' } }
    assert.equal(await save(swapLocked), 400)
    const swapFree = { ...base, questionIds: ['q-cma-001', 'q-cma-002', 'q-cma-003', 'gq-x'], generation: { ...plan, lockedIndex: 2, status: 'done' } }
    assert.equal(await save(swapFree), 200)
    assert.equal(await save({ ...swapFree, questionIds: ['gq-y', 'q-cma-002', 'q-cma-003', 'gq-x'] }), 400)
  })

  it('Given an answer, When the same update also changes the plan, Then rejects it', async () => {
    const { save } = durableObject()
    await save(base)
    const attempt = { attemptId: 'a1', sessionId: 's', questionId: 'q-cma-001', firstAnswerOptionId: 'o', finalAnswerOptionId: 'o',
      isFirstCorrect: true, isFinalCorrect: true, hintUsed: false, durationMs: 1, answeredAt: '2026-09-27T00:00:00Z' }
    assert.equal(await save({ ...base, currentQuestionIndex: 1, attempts: [attempt], generation: { ...plan, lockedIndex: 3 } }), 400)
    assert.equal(await save({ ...base, currentQuestionIndex: 1, attempts: [attempt] }), 200)
  })

  it('Given a background plan update between loading and saving, When submitting, Then the answer is retried and recorded once', async () => {
    const { state } = memoryDOState()
    const object = new StudySessionDO(state)
    const namespace = { idFromName: (id: string) => id, get: () => object }
    const repo = new InMemoryStudyRepository(new DurableObjectSessionRepository(namespace))
    const session = await repo.createSession('DIAGNOSTIC', 4, base.questionIds, { ...plan, status: 'running' } as never)
    const question = (await repo.questions.findById(base.questionIds[0]))!
    const stale = repo.sessions.findById.bind(repo.sessions)
    let raced = false
    repo.sessions.findById = async (id) => {
      const loaded = await stale(id)
      if (!raced) {
        raced = true
        const other = new InMemoryStudyRepository(new DurableObjectSessionRepository(namespace))
        await updateSessionWithRetry(other.sessions, id, (s) => { s.lockGenerationSlot(2); return true })
      }
      return loaded
    }
    const useCase = new SubmitAnswerUseCase(repo.sessions, repo.questions, repo.concepts)
    const result = await useCase.execute({ sessionId: session.sessionId, questionId: question.id, optionId: question.options[0].id, hintUsed: false, durationMs: 5 })
    assert.equal(result.sessionProgress?.currentQuestionIndex, 1)
    const saved = (await stale(session.sessionId))!
    assert.equal(saved.attempts.length, 1)
    assert.equal(saved.generation?.lockedIndex, 2)
  })
})
