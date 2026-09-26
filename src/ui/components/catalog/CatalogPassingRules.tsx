import { DICTIONARY } from '../../constants/dictionary.ts'

export function CatalogPassingRules() {
  const dict = DICTIONARY.catalog

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="card bg-base-100 shadow border border-base-300 p-4 min-w-0">
        <div className="text-xs text-base-content/60 font-medium">{dict.passingCriteria.totalScore.label}</div>
        <div className="text-2xl font-black text-primary mt-1">{dict.passingCriteria.totalScore.value}</div>
        <div className="text-xs text-base-content/70 mt-1 break-keep">
          {dict.passingCriteria.totalScore.desc}
        </div>
      </div>
      <div className="card bg-base-100 shadow border border-base-300 p-4 min-w-0">
        <div className="text-xs text-base-content/60 font-medium">{dict.passingCriteria.threshold.label}</div>
        <div className="text-2xl font-black text-error mt-1">{dict.passingCriteria.threshold.value}</div>
        <div className="text-xs text-base-content/70 mt-1 break-keep">
          {dict.passingCriteria.threshold.desc}
        </div>
      </div>
      <div className="card bg-base-100 shadow border border-base-300 p-4 min-w-0">
        <div className="text-xs text-base-content/60 font-medium">{dict.passingCriteria.thresholdSummary.label}</div>
        <div className="text-sm font-semibold text-base-content mt-2 space-y-0.5">
          {dict.passingCriteria.thresholdSummary.items.map((it, idx) => (
            <div key={idx} className="break-keep">
              {it.subject}: 최소 <span className="text-error font-bold">{it.min}</span> / {it.total}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
