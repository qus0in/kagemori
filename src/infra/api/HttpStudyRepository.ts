// src/infra/api/HttpStudyRepository.ts
import ky, { TimeoutError } from 'ky'
import type { SessionPurpose } from '../../domain/models/PracticeSession.ts'
import type { PublicQuestionDto, SubmitAnswerResponseDto, ConceptHintResponseDto, DiagramResponseDto, DiagramMode, PreparingQuestionDto } from '../../app/dto/StudyDto.ts'
import { createComponentLogger } from '../logger/logger.ts'
import type {
  HttpStudyRepositoryContract,
  SubmitAnswerParams,
  SessionCreationResult,
} from './HttpStudyRepositoryContract.ts'

export class HttpStudyRepository implements HttpStudyRepositoryContract {
  private readonly url: string
  private readonly http: typeof ky
  private readonly log = createComponentLogger('HttpStudyRepository')

  constructor(url = '/api/study', http = ky) {
    this.url = url
    this.http = http
  }

  private async post<T>(p: string, json: unknown, op: string, timeout = 10000): Promise<T> {
    try {
      return await this.http.post(`${this.url}${p}`, { json, timeout }).json<T>()
    } catch (err) {
      this.log.error({ err, op }, `Failed to ${op}`)
      throw err
    }
  }

  public createSession(purpose: SessionPurpose, targetCount?: number): Promise<SessionCreationResult> {
    // AI drafting + review may run when the question bank is short.
    return this.post('/session', { purpose, targetCount }, 'create session', 200000)
  }

  public async getNextQuestion(sessionId: string, useExisting = false): Promise<PublicQuestionDto | PreparingQuestionDto | null> {
    try {
      const res = await this.http.get(`${this.url}/session/${sessionId}/next`, {
        searchParams: useExisting ? { existing: '1' } : undefined,
        timeout: 10000,
        totalTimeout: 22000,
        retry: { limit: 1, methods: ['get'], retryOnTimeout: true },
      }).json<PublicQuestionDto | PreparingQuestionDto | { completed: true }>()
      return 'completed' in res ? null : res
    } catch (err) {
      this.log.error({ err, sessionId }, 'Failed to fetch next question')
      if (err instanceof TimeoutError) {
        throw new Error('문제 조회가 지연되고 있어요. 풀이 기록은 유지됩니다. 다시 불러오기를 눌러 주세요.')
      }
      throw err
    }
  }

  public submitAnswer(sessionId: string, req: SubmitAnswerParams): Promise<SubmitAnswerResponseDto> {
    return this.post(`/session/${sessionId}/submit`, req, 'submit answer', 60000)
  }

  public getHint(sessionId: string, questionId: string): Promise<ConceptHintResponseDto> {
    return this.post(`/session/${sessionId}/hint`, { questionId }, 'fetch hint', 60000)
  }

  public prepareSession(sessionId: string): Promise<{ status: string; added: number }> {
    // Background AI drafting and review can take about a minute.
    return this.post(`/session/${sessionId}/prepare`, {}, 'prepare questions', 180000)
  }

  public regenerateExplanation(sessionId: string, questionId: string, previousExplanation: string): Promise<{ explanation: string }> {
    return this.post(`/session/${sessionId}/explanation`, { questionId, previousExplanation }, 'regenerate explanation', 60000)
  }

  public getDiagram(sessionId: string, questionId: string, mode: DiagramMode = 'auto'): Promise<DiagramResponseDto> {
    return this.post(`/session/${sessionId}/diagram`, { questionId, mode }, 'fetch diagram', 120000)
  }
}

export type { HttpStudyRepositoryContract }
