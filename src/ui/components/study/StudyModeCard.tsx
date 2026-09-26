import type { SessionPurpose } from '../../../domain/models/PracticeSession.ts'
import { DICTIONARY } from '../../constants/dictionary.ts'

export interface StudyModeCardProps {
  mode: {
    badge: string
    defaultCount: number
    title: string
    subtitle: string
    description: string
  }
  purpose: SessionPurpose
  cardCls: string
  badgeCls: string
  btnCls: string
  isRecommended: boolean
  onStartSession: (purpose: SessionPurpose, targetCount?: number) => void
}

export function StudyModeCard({
  mode,
  purpose,
  cardCls,
  badgeCls,
  btnCls,
  isRecommended,
  onStartSession,
}: StudyModeCardProps) {
  const dict = DICTIONARY.study
  return (
    <div className={cardCls}>
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">
          추천
        </div>
      )}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={badgeCls}>{mode.badge}</span>
          <span className="text-xs text-base-content/50">{mode.defaultCount}문항</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-base-content">{mode.title}</h3>
          <div className="text-xs text-primary font-medium mt-0.5">{mode.subtitle}</div>
        </div>
        <p className="text-xs text-base-content/70 leading-relaxed">{mode.description}</p>
      </div>
      <div className="pt-5">
        <button
          type="button"
          onClick={() => onStartSession(purpose, mode.defaultCount)}
          className={btnCls}
        >
          {dict.session.startSession}
        </button>
      </div>
    </div>
  )
}
