import { DICTIONARY } from '../../constants/dictionary.ts'
import type { SessionInfo } from '../../hooks/useStudySessionTypes.ts'

export interface StudyPageHeaderProps {
  session: SessionInfo | null
  isCompleted: boolean
  onReset: () => void
}

export function StudyPageHeader({ session, isCompleted, onReset }: StudyPageHeaderProps) {
  const dict = DICTIONARY.study

  const getModeTitle = () => {
    if (!session) return ''
    switch (session.purpose) {
      case 'DIAGNOSTIC':
        return dict.modes.diagnostic.title
      case 'IMPROVEMENT':
        return dict.modes.improvement.title
      case 'MOCK_EXAM':
        return dict.modes.mockExam.title
      default:
        return dict.modes.improvement.title
    }
  }

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary break-keep">
            {dict.title}
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1 break-keep leading-relaxed">
            {dict.subtitle}
          </p>
        </div>
        {session && !isCompleted && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="badge badge-primary badge-outline text-xs">
              {getModeTitle()}
            </span>
            <button
              type="button"
              onClick={onReset}
              className="btn btn-ghost btn-xs text-base-content/60 hover:text-error"
              title="세션 종료"
            >
              ✕ 중단
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
