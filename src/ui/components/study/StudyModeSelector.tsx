import type { SessionPurpose } from '../../../domain/models/PracticeSession.ts'
import { StudyModeCard } from './StudyModeCard.tsx'
import { getStudyModes } from './studyModeConfig.ts'

export interface StudyModeSelectorProps {
  onStartSession: (purpose: SessionPurpose, targetCount?: number) => void
}

export function StudyModeSelector({ onStartSession }: StudyModeSelectorProps) {
  const modes = getStudyModes()

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-lg font-bold text-base-content">학습 모드 선택</h2>
        <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
          원하는 학습 방식과 목표에 맞는 모드를 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((m) => (
          <StudyModeCard
            key={m.purpose}
            mode={m.mode}
            purpose={m.purpose}
            cardCls={m.cardCls}
            badgeCls={m.badgeCls}
            btnCls={m.btnCls}
            isRecommended={m.isRecommended}
            onStartSession={onStartSession}
          />
        ))}
      </div>
    </div>
  )
}
