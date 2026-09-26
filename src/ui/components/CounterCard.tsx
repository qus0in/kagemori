import { ScheduleItemDDayDto } from '../../app/dto/ScheduleDDayDto.ts'
import { CounterCardFooter } from './CounterCardFooter.tsx'

interface CounterCardProps {
  item: ScheduleItemDDayDto
}

export function CounterCard({ item }: CounterCardProps) {
  const { isToday, isPast, ddayText, statusMessage } = item

  const cardBorder = isToday
    ? 'border-primary shadow-primary/20 ring-2 ring-primary'
    : 'border-base-300 hover:border-primary/40 hover:shadow-xl'

  const countColor = isToday
    ? 'text-primary animate-pulse'
    : isPast
    ? 'text-base-content/40'
    : 'text-primary'

  return (
    <div className={`card bg-base-100 shadow-lg border transition-all duration-200 ${cardBorder}`}>
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
          <div className={`text-5xl sm:text-6xl font-black tracking-tight ${countColor}`}>
            {ddayText}
          </div>
          <div className="mt-2 text-sm font-semibold text-base-content/80">
            {statusMessage}
          </div>
        </div>

        <CounterCardFooter
          targetDateStr={item.targetDateStr}
          targetDateFormatted={item.targetDateFormatted}
        />
      </div>
    </div>
  )
}
