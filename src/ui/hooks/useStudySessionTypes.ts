import type { SessionPurpose } from '../../domain/models/PracticeSession.ts'
import type {
  PublicQuestionDto,
  SubmitAnswerResponseDto,
  ConceptHintResponseDto,
  DiagramResponseDto,
  DiagramMode,
} from '../../app/dto/StudyDto.ts'
import type { HttpStudyRepositoryContract } from '../../infra/api/HttpStudyRepository.ts'

export interface SessionInfo {
  sessionId: string
  purpose: SessionPurpose
  targetQuestionCount: number
  currentQuestionIndex: number
}

export interface StudyScore {
  correctCount: number
  totalCount: number
}

export interface StudySessionValues {
  session: SessionInfo | null
  currentQuestion: PublicQuestionDto | null
  selectedOptionId: string | null
  hint: ConceptHintResponseDto | null
  feedback: SubmitAnswerResponseDto | null
  isHintLoading: boolean
  isSubmitting: boolean
  isLoadingQuestion: boolean
  isCompleted: boolean
  score: StudyScore
  error: string | null
  questionStartTime: number
  isExplanationLoading: boolean
  diagram: DiagramResponseDto | null
  isDiagramLoading: boolean
  /** Explanation/diagram failures; never triggers the question reload button. */
  postAnswerError: string | null
}

export const initialStudyState: StudySessionValues = {
  session: null,
  currentQuestion: null,
  selectedOptionId: null,
  hint: null,
  feedback: null,
  isHintLoading: false,
  isSubmitting: false,
  isLoadingQuestion: false,
  isCompleted: false,
  score: { correctCount: 0, totalCount: 0 },
  error: null,
  questionStartTime: 0,
  isExplanationLoading: false,
  diagram: null,
  isDiagramLoading: false,
  postAnswerError: null,
}

export interface StudySessionActions {
  setRepository: (repo: HttpStudyRepositoryContract) => void
  startSession: (purpose: SessionPurpose, targetCount?: number) => Promise<void>
  selectOption: (optionId: string) => void
  requestHint: () => Promise<void>
  submitAnswer: () => Promise<void>
  nextQuestion: () => Promise<void>
  regenerateExplanation: () => Promise<void>
  requestDiagram: (mode?: DiagramMode) => Promise<void>
  resetSession: () => void
}

export type StudySessionState = StudySessionValues & StudySessionActions
