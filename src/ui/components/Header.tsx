import { DICTIONARY } from '../constants/dictionary.ts'

interface HeaderProps {
  title: string
  todayFormatted: string
  todayStr: string
}

export function Header({ title, todayFormatted, todayStr }: HeaderProps) {
  return (
    <header className="text-center space-y-3">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
        <span>{DICTIONARY.schedule.badge}</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
        {title}
      </h1>
      <p className="text-base text-base-content/70">
        {DICTIONARY.schedule.subtitle}
      </p>
      <div className="inline-block text-xs font-semibold px-3 py-1 rounded-md bg-base-300 text-base-content">
        기준일: {todayFormatted} ({todayStr} KST)
      </div>
    </header>
  )
}
