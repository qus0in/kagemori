import { DICTIONARY } from '../../constants/dictionary.ts'
import type { StudyScore } from '../../hooks/useStudySessionTypes.ts'
import { StudyScoreCard } from './StudyScoreCard.tsx'

export interface StudyCompleteViewProps {
  score: StudyScore
  targetCount: number
  onReset: () => void
}

export function StudyCompleteView({ score, targetCount, onReset }: StudyCompleteViewProps) {
  const dict = DICTIONARY.study.session
  const total = score.totalCount || targetCount || 0
  const accuracy = total > 0 ? Math.round((score.correctCount / total) * 100) : 0
  const isPassed = accuracy >= 70

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 text-center space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary text-2xl mb-2">
          🎉
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-base-content">{dict.completeTitle}</h2>
        <p className="text-xs sm:text-sm text-base-content/70">{dict.completeSubtitle}</p>
      </div>

      <StudyScoreCard
        correctCount={score.correctCount}
        total={total}
        accuracy={accuracy}
      />

      <div className="text-xs sm:text-sm text-base-content/80 max-w-md mx-auto leading-relaxed">
        {isPassed ? (
          <span className="text-success font-semibold">
            ✓ 합격 기준선(70%)을 달성했습니다. 꾸준한 반복 학습으로 실전 감각을 유지하세요!
          </span>
        ) : (
          <span className="text-warning font-semibold">
            보완이 필요한 영역이 있습니다. 취약 개념 힌트와 표준교재 근거를 다시 확인해 보세요.
          </span>
        )}
      </div>

      <div className="pt-2">
        <button type="button" onClick={onReset} className="btn btn-primary px-8 text-white">
          {dict.restartButton}
        </button>
      </div>
    </div>
  )
}
