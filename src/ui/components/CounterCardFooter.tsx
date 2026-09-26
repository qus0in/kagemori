import { DICTIONARY } from '../constants/dictionary.ts'

interface CounterCardFooterProps {
  targetDateStr: string
  targetDateFormatted: string
}

export function CounterCardFooter({ targetDateStr, targetDateFormatted }: CounterCardFooterProps) {
  return (
    <div className="border-t border-base-200 pt-4 text-xs text-base-content/70 flex flex-col gap-1.5 min-w-0">
      <div className="flex justify-between items-center gap-2">
        <span className="text-base-content/50 shrink-0">{DICTIONARY.schedule.targetDateLabel}</span>
        <span className="font-semibold text-base-content text-right break-keep">{targetDateStr}</span>
      </div>
      <div className="flex justify-between items-center gap-2">
        <span className="text-base-content/50 shrink-0">{DICTIONARY.schedule.targetDateFormattedLabel}</span>
        <span className="text-base-content/80 text-right break-keep">{targetDateFormatted}</span>
      </div>
    </div>
  )
}
