import { Link } from 'react-router-dom'
import { DICTIONARY } from '../../constants/dictionary.ts'

export function MainStudyFeaturesCard() {
  const { studyFeatures } = DICTIONARY.main

  return (
    <div className="card bg-base-100 border border-base-300 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-200 pb-3">
        <div>
          <h3 className="font-bold text-base text-base-content flex items-center gap-2">
            <span className="badge badge-secondary badge-sm">학습 모드</span>
            {studyFeatures.title}
          </h3>
          <p className="text-xs text-base-content/70 mt-0.5">{studyFeatures.subtitle}</p>
        </div>
        <Link to="/study" className="btn btn-primary btn-sm px-4 shrink-0 shadow-xs">
          {studyFeatures.actionButton}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {studyFeatures.modes.map((mode, idx) => (
          <div key={idx} className="bg-base-200/40 rounded-lg p-3 border border-base-300/50 space-y-1">
            <span className="font-bold text-xs text-base-content block">{mode.name}</span>
            <span className="text-[11px] text-base-content/70 leading-snug block">{mode.desc}</span>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-primary text-[11px]">핵심 기능:</span>
        {studyFeatures.highlights.map((item, idx) => (
          <span key={idx} className="text-base-content/80 text-[11px] flex items-center gap-1">
            <span className="text-primary font-bold">✓</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
