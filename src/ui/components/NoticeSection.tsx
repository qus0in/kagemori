import { DICTIONARY } from '../constants/dictionary.ts'

export function NoticeSection() {
  const notices = DICTIONARY.main.notices

  return (
    <section className="card bg-base-100 border border-base-300 p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-base-200 pb-2">
        <h2 className="font-bold text-sm text-base-content flex items-center gap-1.5">
          <span className="badge badge-neutral badge-xs">안내</span>
          수험 및 서비스 안내
        </h2>
        <span className="text-[11px] text-base-content/50">2026 표준교재 기준</span>
      </div>
      <ul className="space-y-2 text-xs text-base-content/80">
        {notices.map((notice, index) => (
          <li key={index} className="flex items-start gap-2 leading-relaxed">
            <span className="badge badge-ghost badge-xs shrink-0 mt-0.5">{index + 1}</span>
            <span>{notice}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
