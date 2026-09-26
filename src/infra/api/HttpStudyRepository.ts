// src/infra/api/HttpStudyRepository.ts
import ky from 'ky'
import type { SessionPurpose } from '../../domain/models/PracticeSession.ts'
import type { PublicQuestionDto, SubmitAnswerResponseDto, ConceptHintResponseDto } from '../../app/dto/StudyDto.ts'
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

  private async post<T>(p: string, json: unknown, op: string): Promise<T> {
    try {
      return await this.http.post(`${this.url}${p}`, { json, timeout: 10000 }).json<T>()
    } catch (err) {
      this.log.error({ err, op }, `Failed to ${op}`)
      throw err
    }
  }

  public createSession(purpose: SessionPurpose, targetCount?: number): Promise<SessionCreationResult> {
    return this.post('/session', { purpose, targetCount }, 'create session')
  }

  public async getNextQuestion(sessionId: string): Promise<PublicQuestionDto | null> {
    try {
      const res = await this.http.get(`${this.url}/session/${sessionId}/next`, { timeout: 10000 }).json<any>()
      return res?.completed ? null : res
    } catch (err) {
      this.log.error({ err, sessionId }, 'Failed to fetch next question')
      throw err
    }
  }

  public submitAnswer(sessionId: string, req: SubmitAnswerParams): Promise<SubmitAnswerResponseDto> {
    return this.post(`/session/${sessionId}/submit`, req, 'submit answer')
  }

  public getHint(sessionId: string, questionId: string): Promise<ConceptHintResponseDto> {
    return this.post(`/session/${sessionId}/hint`, { questionId }, 'fetch hint')
  }
}

export type { HttpStudyRepositoryContract }
