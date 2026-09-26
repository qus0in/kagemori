import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { InMemoryStudyRepository } from '../../../src/infra/study/InMemoryStudyRepository.ts'
import { DurableObjectSessionRepository } from '../../../src/infra/study/DurableObjectSessionRepository.ts'
import { SubmitAnswerUseCase } from '../../../src/app/usecases/SubmitAnswerUseCase.ts'
import { StudySessionDO } from '../../../worker/do/StudySessionDO.ts'
import { SessionConflictError } from '../../../src/domain/models/StorageErrors.ts'
import { memoryDOState } from '../../helpers/storageHarness.ts'

describe('[Integration / App] Feature: Idempotent durable answers', () => {
  it('Given simultaneous and repeated submissions, When committed, Then advances once including completed-session retries', async () => {
    const { state } = memoryDOState()
    const object = new StudySessionDO(state)
    const namespace = { idFromName: (id: string) => id, get: () => object }
    const repo = new InMemoryStudyRepository(new DurableObjectSessionRepository(namespace))
    const second = new InMemoryStudyRepository(new DurableObjectSessionRepository(namespace))
    const session = await repo.createSession('DIAGNOSTIC', 1)
    const question = (await repo.questions.findNextForSession(session))!
    const firstUseCase = new SubmitAnswerUseCase(repo.sessions, repo.questions, repo.concepts)
    const secondUseCase = new SubmitAnswerUseCase(second.sessions, second.questions, second.concepts)
    const request = { sessionId: session.sessionId, questionId: question.id, optionId: question.options[0].id, hintUsed: false, durationMs: 100 }
    const results = await Promise.all([firstUseCase.execute(request), secondUseCase.execute(request)])
    assert.ok(results.every((result) => result.sessionProgress?.currentQuestionIndex === 1))
    await firstUseCase.execute(request)
    assert.equal((await repo.sessions.findById(session.sessionId))?.attempts.length, 1)
    await assert.rejects(firstUseCase.execute({ ...request, optionId: question.options[1].id }), SessionConflictError)
    assert.equal((await repo.sessions.findById(session.sessionId))?.attempts.length, 1)
  })
})
