import { DICTIONARY } from '../../constants/dictionary.ts'

export interface StudyProgressIndicatorProps {
  currentIndex: number
  totalQuestions: number
}

export function StudyProgressIndicator({ currentIndex, totalQuestions }: StudyProgressIndicatorProps) {
  const dict = DICTIONARY.study.session
  const displayIndex = currentIndex + 1

  return (
    <div className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-2xs space-y-2">
      <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-base-content">
        <span>{dict.progressTitle}</span>
        <span className="text-primary">
          {dict.progress(displayIndex, totalQuestions)}
        </span>
      </div>
      <progress
        className="progress progress-primary w-full h-2"
        value={displayIndex}
        max={totalQuestions}
      ></progress>
    </div>
  )
}
