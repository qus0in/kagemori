import { DICTIONARY } from '../../constants/dictionary.ts'

export interface QuestionFeedbackSourceProps {
  sourceTitle?: string
  sourceUrl?: string
}

export function QuestionFeedbackSource({ sourceTitle, sourceUrl }: QuestionFeedbackSourceProps) {
  const dict = DICTIONARY.study.card
  if (!sourceTitle && !sourceUrl) return null

  return (
    <div className="pt-2 border-t border-base-300/40 flex items-center justify-between text-xs text-base-content/70">
      <span className="flex items-center gap-1 font-medium">
        📖 {sourceTitle || '출처 문서'}
      </span>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="link link-primary inline-flex items-center gap-1 hover:underline"
        >
          <span>{dict.sourceLabel}</span>
          <span>↗</span>
        </a>
      )}
    </div>
  )
}
