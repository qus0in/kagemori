import { DICTIONARY } from '../../constants/dictionary.ts'
import type { BookChapter } from '../../../domain/models/Catalog.ts'

export function CatalogChapterRow({ ch }: { ch: BookChapter }) {
  const dict = DICTIONARY.catalog
  return (
    <div className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm hover:bg-base-200/50 rounded min-w-0">
      <span className="font-medium text-base-content/90 min-w-0 flex-1 break-keep">
        {ch.title}
      </span>
      {ch.sectionRangeHint ? (
        <span className="badge badge-sm badge-ghost text-xs font-mono shrink-0 self-start sm:self-auto">
          {ch.sectionRangeHint}
        </span>
      ) : (
        <span className="text-xs text-base-content/40 shrink-0 self-start sm:self-auto">
          {dict.noSectionHint}
        </span>
      )}
    </div>
  )
}
