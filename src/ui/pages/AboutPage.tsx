import { Link } from 'react-router-dom'
import { DICTIONARY } from '../constants/dictionary.ts'

export function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">{DICTIONARY.about.title}</h1>
        <p className="text-sm text-base-content/70">{DICTIONARY.about.subtitle}</p>
      </div>

      <div className="card bg-base-100 shadow-md border border-base-300 p-6 space-y-4">
        <h2 className="text-lg font-bold text-primary">{DICTIONARY.about.definitionTitle}</h2>
        <p className="text-sm leading-relaxed text-base-content/80">
          {DICTIONARY.about.definitionText}
        </p>

        <div className="divider my-2"></div>

        <h3 className="font-semibold text-sm">{DICTIONARY.about.infoTitle}</h3>
        <ul className="list-disc list-inside text-xs space-y-1.5 text-base-content/70">
          {DICTIONARY.about.infoList.map((info, idx) => (
            <li key={idx}>
              <strong>{info.label}</strong>: {info.value}
            </li>
          ))}
        </ul>

        <div className="divider my-2"></div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Link to="/" className="btn btn-outline btn-sm">
              {DICTIONARY.about.backButton}
            </Link>
            <Link to="/catalog" className="btn btn-ghost btn-sm text-xs">
              출제기준 보기 →
            </Link>
            <Link to="/study" className="btn btn-primary btn-sm">
              문제 풀러 가기 →
            </Link>
          </div>
          <a
            href={DICTIONARY.about.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            {DICTIONARY.about.officialSite}
          </a>
        </div>
      </div>
    </div>
  )
}
