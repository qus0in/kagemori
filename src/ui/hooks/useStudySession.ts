import { create } from 'zustand'
import {
  HttpStudyRepository,
  type HttpStudyRepositoryContract,
} from '../../infra/api/HttpStudyRepository.ts'
import {
  initialStudyState,
  type StudySessionState,
  type SessionInfo,
  type StudyScore,
} from './useStudySessionTypes.ts'
import {
  executeStartSession,
  executeRequestHint,
} from './useStudyStartHintActions.ts'
import { executeSubmitAnswer } from './useStudySubmitAction.ts'
import { executeNextQuestion } from './useStudyNextAction.ts'
import { executeRegenerateExplanation, executeRequestDiagram } from './useStudyPostAnswerActions.ts'

export type { SessionInfo, StudyScore, StudySessionState }

let defaultRepo: HttpStudyRepositoryContract = new HttpStudyRepository()

export const useStudySession = create<StudySessionState>((set, get) => ({
  ...initialStudyState,

  setRepository: (repo: HttpStudyRepositoryContract) => {
    defaultRepo = repo
  },

  startSession: (purpose, targetCount) => {
    set({ ...initialStudyState })
    return executeStartSession(defaultRepo, set, get, purpose, targetCount)
  },

  selectOption: (optionId: string) => {
    if (get().feedback !== null) return
    set({ selectedOptionId: optionId })
  },

  requestHint: () => executeRequestHint(defaultRepo, set, get),

  submitAnswer: () => executeSubmitAnswer(defaultRepo, set, get),

  nextQuestion: () => executeNextQuestion(defaultRepo, set, get),

  regenerateExplanation: () => executeRegenerateExplanation(defaultRepo, set, get),

  requestDiagram: (mode) => executeRequestDiagram(defaultRepo, set, get, mode),

  useExistingQuestion: () => { if (get().preparingNext) set({ useExistingRequested: true }) },

  resetSession: () => set({ ...initialStudyState }),
}))
