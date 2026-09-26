import { DICTIONARY } from '../../constants/dictionary.ts'

export interface StudyScoreCardProps {
  correctCount: number
  total: number
  accuracy: number
}

export function StudyScoreCard({ correctCount, total, accuracy }: StudyScoreCardProps) {
  const dict = DICTIONARY.study.session
  return (
    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full">
      <div className="bg-base-200/60 rounded-xl p-4 border border-base-300">
        <div className="text-xs text-base-content/60 font-medium">{dict.scoreLabel}</div>
        <div className="text-2xl font-bold text-primary mt-1">
          {correctCount} / {total}
        </div>
      </div>
      <div className="bg-base-200/60 rounded-xl p-4 border border-base-300">
        <div className="text-xs text-base-content/60 font-medium">{dict.accuracyLabel}</div>
        <div className="text-2xl font-bold text-base-content mt-1">{accuracy}%</div>
      </div>
    </div>
  )
}
