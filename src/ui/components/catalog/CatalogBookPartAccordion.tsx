import { DICTIONARY } from '../../constants/dictionary.ts'
import type { BookPart } from '../../../domain/models/Catalog.ts'
import { CatalogChapterRow } from './CatalogChapterRow.tsx'

export interface CatalogBookPartAccordionProps {
  part: BookPart
  isExpanded: boolean
  onToggle: () => void
}

export function CatalogBookPartAccordion({ part, isExpanded, onToggle }: CatalogBookPartAccordionProps) {
  const dict = DICTIONARY.catalog

  return (
    <div className="border border-base-200 rounded-lg overflow-hidden bg-base-200/40">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center p-3.5 bg-base-200/80 hover:bg-base-300/80 transition-colors text-left font-semibold text-sm"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-primary font-bold break-keep">{part.title}</span>
          <span className="text-xs text-base-content/60 font-normal shrink-0">
            ({part.chapters.length}{dict.chapterInPartSuffix})
          </span>
        </span>
        <span className="text-xs text-base-content/60 shrink-0">
          {isExpanded ? dict.fold : dict.unfold}
        </span>
      </button>

      {isExpanded && (
        <div className="p-3 bg-base-100 divide-y divide-base-200">
          {part.chapters.map((ch) => (
            <CatalogChapterRow key={ch.id} ch={ch} />
          ))}
        </div>
      )}
    </div>
  )
}
