import { DICTIONARY } from '../constants/dictionary.ts'

export function NoticeSection() {
  return (
    <section className="card bg-base-100/60 border border-base-300 p-5 text-xs text-base-content/70 space-y-2">
      <h2 className="font-semibold text-base-content text-sm">{DICTIONARY.schedule.noticesHeading}</h2>
      <ul className="list-disc list-inside space-y-1">
        {DICTIONARY.schedule.notices.map((notice, index) => (
          <li key={index}>{notice}</li>
        ))}
      </ul>
    </section>
  )
}
