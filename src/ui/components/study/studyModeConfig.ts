import type { SessionPurpose } from '../../../domain/models/PracticeSession.ts'
import { DICTIONARY } from '../../constants/dictionary.ts'

export function getStudyModes() {
  const dict = DICTIONARY.study
  return [
    {
      mode: dict.modes.diagnostic,
      purpose: 'DIAGNOSTIC' as SessionPurpose,
      cardCls: 'card bg-base-100 border border-base-300 hover:border-primary/50 shadow-sm transition-all flex flex-col justify-between p-5',
      badgeCls: 'badge badge-secondary badge-sm font-semibold',
      btnCls: 'btn btn-outline btn-primary btn-sm w-full',
      isRecommended: false,
    },
    {
      mode: dict.modes.improvement,
      purpose: 'IMPROVEMENT' as SessionPurpose,
      cardCls: 'card bg-base-100 border-2 border-primary shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5 relative overflow-hidden',
      badgeCls: 'badge badge-primary badge-sm font-semibold text-white',
      btnCls: 'btn btn-primary btn-sm w-full text-white',
      isRecommended: true,
    },
    {
      mode: dict.modes.mockExam,
      purpose: 'MOCK_EXAM' as SessionPurpose,
      cardCls: 'card bg-base-100 border border-base-300 hover:border-primary/50 shadow-sm transition-all flex flex-col justify-between p-5',
      badgeCls: 'badge badge-accent badge-sm font-semibold',
      btnCls: 'btn btn-outline btn-accent btn-sm w-full',
      isRecommended: false,
    },
  ]
}
