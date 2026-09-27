import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CreateStudySessionUseCase } from '../../../src/app/usecases/CreateStudySessionUseCase.ts'
import { ReplenishQuestionBankUseCase } from '../../../src/app/usecases/ReplenishQuestionBankUseCase.ts'
import { SemanticQuestionService } from '../../../src/app/usecases/SemanticQuestionService.ts'
import { PrepareSessionQuestionsUseCase } from '../../../src/app/usecases/PrepareSessionQuestionsUseCase.ts'
import type { SessionPurpose } from '../../../src/domain/models/PracticeSession.ts'
import { InMemoryStudyRepository } from '../../../src/infra/study/InMemoryStudyRepository.ts'
import { InMemoryQuestionIndex } from '../../../src/infra/vector/InMemoryQuestionIndex.ts'
import type { QuestionDraft } from '../../../src/domain/models/GeneratedQuestion.ts'
import type { BlindReviewPort, DraftScreenPort, QuestionAuthoringPort, TopicContext } from '../../../src/domain/ports/QuestionBankPorts.ts'
import type { EmbeddingPort } from '../../../src/domain/ports/SemanticPorts.ts'
import type { QuestionHistoryEntry } from '../../../src/domain/models/QuestionPlanning.ts'
import { SEED_QUESTIONS } from '../../../src/infra/study/SeedStudyData.ts'

const topic: TopicContext = { id: 'topic-2-3', title: '투자분석기법', subjectTitle: '제2과목', weight: 12, chapters: [{ id: 'c5-01-01', title: '기본적 분석' }], conceptNotes: [] }
const draft = (n: number, tag = `u${n}`): QuestionDraft => ({
  topicId: 'topic-2-3', chapterId: 'c5-01-01', type: 'CONCEPT', difficulty: 'MEDIUM', prompt: `문항 ${n} #${tag}`,
  options: [`정답${n}`, `오답A${n}`, `오답B${n}`, `오답C${n}`], correctIndex: 0, explanation: '해설', basis: '근거',
})

/** Texts tagged `#x` share a direction; everything else gets its own axis. */
function fakeEmbedder(): EmbeddingPort & { calls: number } {
  const axes = new Map<string, number>()
  const embedder = {
    model: 'fake-embedding', calls: 0,
    async embed(texts: readonly string[]) {
      embedder.calls++
      return texts.map((text) => {
        const key = text.match(/#(\w+)/)?.[1] ?? text
        if (!axes.has(key)) axes.set(key, axes.size)
        return Array.from({ length: 256 }, (_, i) => (i === axes.get(key)! + 8 ? 1 : 0))
      })
    },
  }
  return embedder
}

const approveAll = (model: string): BlindReviewPort => ({ model, review: async (items) => items.map((d, index) => ({ index, solvedIndex: d.correctIndex, approved: true, issues: '' })) })
const answeredSeeds: QuestionHistoryEntry[] = SEED_QUESTIONS.map((q) => ({ questionId: q.id, topicId: q.topicId, isCorrect: true, hintUsed: false, answeredAt: '2026-09-01T00:00:00Z' }))
const keepAll: DraftScreenPort = { model: 'gemma-4-26b-a4b-it', screen: async (items) => items.map((_, index) => ({ index, keep: true, issue: 'PER' })) }
const tierOf = async ({ repo }: ReturnType<typeof setup>) => (await repo.questions.listGenerated())[0]?.tier

function setup(drafts: QuestionDraft[], opts: { screener?: DraftScreenPort; reviewers?: BlindReviewPort[]; history?: QuestionHistoryEntry[] } = {}) {
  const repo = new InMemoryStudyRepository()
  const index = new InMemoryQuestionIndex()
  const warnings: string[] = []
  const warn = (message: string) => { warnings.push(message) }
  const semantic = new SemanticQuestionService(fakeEmbedder(), index, warn)
  const author: QuestionAuthoringPort = { generatorModel: 'gemini-3.8-flash', draft: async () => drafts }
  let n = 0
  const replenish = new ReplenishQuestionBankUseCase({
    bank: repo.questions, topics: { listTopics: async () => [topic] }, author, semantic, warn,
    reviewers: opts.reviewers ?? [approveAll('gemini-3.8-flash')], screener: opts.screener, newId: () => `n${++n}`,
  })
  const history = { latestResults: async () => opts.history ?? answeredSeeds }
  const creator = new CreateStudySessionUseCase({ repo, bank: repo.questions, canGenerate: true, semantic, shuffleSeed: () => 'seed', warn, history })
  const prepare = new PrepareSessionQuestionsUseCase({ sessions: repo.sessions, bank: repo.questions, replenish, history, warn })
  // Creates the session, then runs the background generation the client would trigger.
  const useCase = { execute: async (purpose: SessionPurpose, count: number) => {
    const session = await creator.execute(purpose, count)
    await prepare.execute(session.sessionId)
    return (await repo.sessions.findById(session.sessionId))!
  } }
  const generated = async () => (await repo.questions.listQuestions()).filter((q) => q.id.startsWith('gq-'))
  return { repo, index, useCase, warnings, generated }
}

describe('[Slice / App] Feature: Embedding, Gemma and cross-review pipeline', () => {
  it('Given the Gemma screener rejects one draft, When replenishing, Then drops it and stores the issue tag', async () => {
    const screener: DraftScreenPort = { model: 'gemma-4-26b-a4b-it', screen: async () => [{ index: 0, keep: false, issue: '' }, { index: 1, keep: true, issue: 'PER 정의' }] }
    const { useCase, generated, repo } = setup([draft(1), draft(2)], { screener })
    await useCase.execute('DIAGNOSTIC', 4)
    const [saved] = await generated()
    assert.equal(saved.prompt, '문항 2 #u2')
    assert.equal((await repo.concepts.findById(saved.conceptId))?.body, '근거')
  })

  it('Given a draft semantically equal to another in the batch, When replenishing, Then keeps only the first and indexes it', async () => {
    const { useCase, generated, index } = setup([draft(1, 'same'), draft(2, 'same'), draft(3)])
    await useCase.execute('DIAGNOSTIC', 5)
    const prompts = (await generated()).map((q) => q.prompt)
    assert.deepEqual(prompts, ['문항 1 #same', '문항 3 #u3'])
    assert.deepEqual(await index.missing([...SEED_QUESTIONS.map((q) => q.id), ...(await generated()).map((q) => q.id)]), [])
  })

  it('Given Gemma solves differently, When cross-reviewing, Then rejects the draft; when Gemma is down, Then primary review decides', async () => {
    const disagree: BlindReviewPort = { model: 'gemma-4-31b-it', review: async (items) => items.map((_, index) => ({ index, solvedIndex: 2, approved: true, issues: '다른 답' })) }
    const rejected = setup([draft(1)], { reviewers: [approveAll('gemini-3.8-flash'), disagree] })
    await rejected.useCase.execute('DIAGNOSTIC', 3)
    assert.equal((await rejected.generated()).length, 0)

    const down: BlindReviewPort = { model: 'gemma-4-31b-it', review: async () => { throw new Error('timeout') } }
    const degraded = setup([draft(1)], { reviewers: [approveAll('gemini-3.8-flash'), down] })
    await degraded.useCase.execute('DIAGNOSTIC', 3)
    assert.equal((await degraded.generated()).length, 1)
    assert.ok(degraded.warnings.includes('Secondary question reviewer unavailable'))
  })

  it('Given a recent wrong answer, When an improvement session starts, Then similar fresh questions come first', async () => {
    const wrongId = SEED_QUESTIONS[0].id
    const history = [{ questionId: wrongId, topicId: SEED_QUESTIONS[0].topicId, isCorrect: false, hintUsed: false, answeredAt: '2026-09-20T00:00:00Z' }]
    const { useCase, index } = setup([], { history })
    const target = SEED_QUESTIONS[5]
    await index.upsert([{ id: wrongId, topicId: 't', values: [1, 0, 0] }, { id: target.id, topicId: 't', values: [0.95, 0.05, 0] }])
    const session = await useCase.execute('IMPROVEMENT', 6)
    assert.equal(session.questionIds?.[0], target.id)
  })

  it('Given review, screening and dedupe all pass, When replenishing, Then the question is VERIFIED', async () => {
    const result = setup([draft(1)], { reviewers: [approveAll('gemini-3.8-flash'), approveAll('gemma-4-31b-it')], screener: keepAll })
    await result.useCase.execute('DIAGNOSTIC', 3)
    assert.equal(await tierOf(result), 'VERIFIED')
  })

  it('Given only the primary reviewer responds, When replenishing, Then the question is REVIEWED', async () => {
    const result = setup([draft(1)], { screener: keepAll })
    await result.useCase.execute('DIAGNOSTIC', 3)
    assert.equal(await tierOf(result), 'REVIEWED')
  })

  it('Given screening is skipped, When replenishing, Then the question is REVIEWED', async () => {
    const result = setup([draft(1)], { reviewers: [approveAll('gemini-3.8-flash'), approveAll('gemma-4-31b-it')] })
    await result.useCase.execute('DIAGNOSTIC', 3)
    assert.equal(await tierOf(result), 'REVIEWED')
  })
})
