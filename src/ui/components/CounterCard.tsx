import { ScheduleItemDDayDto } from '../../app/dto/ScheduleDDayDto.ts'
import { DICTIONARY } from '../constants/dictionary.ts'

interface CounterCardProps {
  item: ScheduleItemDDayDto
}

export function CounterCard({ item }: CounterCardProps) {
  const { isToday, isPast, ddayText, statusMessage } = item

  return (
    <div
      className={`card bg-base-100 shadow-lg border transition-all duration-200 ${
        isToday
          ? 'border-primary shadow-primary/20 ring-2 ring-primary'
          : 'border-base-300 hover:border-primary/40 hover:shadow-xl'
      }`}
    >
      <div className="card-body p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="badge bg-neutral text-neutral-content font-medium px-3 py-1">
            {item.title}
          </span>
          <span className="text-xs text-base-content/70 font-semibold px-2 py-0.5 rounded bg-base-200">
            {item.targetName}
          </span>
        </div>

        <div className="text-center py-4">
          <div
            className={`text-5xl sm:text-6xl font-black tracking-tight ${
              isToday
                ? 'text-primary animate-pulse'
                : isPast
                ? 'text-base-content/40'
                : 'text-primary'
            }`}
          >
            {ddayText}
          </div>
          <div className="mt-2 text-sm font-semibold text-base-content/80">
            {statusMessage}
          </div>
        </div>

        <div className="border-t border-base-200 pt-4 text-xs text-base-content/70 flex flex-col gap-1.5 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span className="text-base-content/50 shrink-0">{DICTIONARY.schedule.targetDateLabel}</span>
            <span className="font-semibold text-base-content text-right break-keep">
              {item.targetDateStr}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-base-content/50 shrink-0">{DICTIONARY.schedule.targetDateFormattedLabel}</span>
            <span className="text-base-content/80 text-right break-keep">
              {item.targetDateFormatted}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
