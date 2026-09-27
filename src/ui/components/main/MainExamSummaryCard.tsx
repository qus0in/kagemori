import { Link } from 'react-router-dom'
import { DICTIONARY } from '../../constants/dictionary.ts'

export function MainExamSummaryCard() {
  const { examSummary } = DICTIONARY.main

  return (
    <div className="card bg-base-100 border border-base-300 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200 pb-3">
        <div>
          <h3 className="font-bold text-base text-base-content flex items-center gap-2">
            <span className="badge badge-primary badge-sm">출제기준</span>
            {examSummary.title}
          </h3>
          <p className="text-xs text-base-content/70 mt-0.5">{examSummary.subtitle}</p>
        </div>
        <span className="badge badge-outline text-[11px] font-semibold text-primary">
          {examSummary.passRuleBadge}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {examSummary.subjects.map((sub) => (
          <div key={sub.id} className="bg-base-200/50 rounded-lg p-3 border border-base-300/60 space-y-1">
            <div className="font-bold text-xs text-base-content">{sub.title}</div>
            <div className="text-[11px] font-semibold text-primary">{sub.questions}</div>
            <div className="text-[11px] text-base-content/70 leading-snug">{sub.desc}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-base-200">
        <Link to="/about" className="btn btn-ghost btn-xs text-xs text-base-content/70">
          {examSummary.aboutLink}
        </Link>
        <Link to="/catalog" className="btn btn-outline btn-xs text-xs">
          {examSummary.catalogLink}
        </Link>
      </div>
    </div>
  )
}
