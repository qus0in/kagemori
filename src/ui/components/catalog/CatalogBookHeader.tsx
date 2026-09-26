import { DICTIONARY } from '../../constants/dictionary.ts'
import type { BookCatalog } from '../../../domain/models/Catalog.ts'

export function CatalogBookHeader({ book }: { book: BookCatalog }) {
  const dict = DICTIONARY.catalog
  const totalChapters = book.parts.reduce((sum, p) => sum + p.chapters.length, 0)
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-base-200 pb-4 min-w-0">
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold text-base-content break-keep">{book.title}</h2>
        <p className="text-xs text-base-content/60 mt-0.5 break-keep">
          {dict.isbnPrefix}<span className="font-mono">{book.isbn13}</span>{dict.publisherNote}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0 self-start sm:self-auto">
        <span className="badge badge-neutral text-xs">
          {book.parts.length}{dict.partCountSuffix}
        </span>
        <span className="badge badge-neutral text-xs">
          {totalChapters}{dict.chapterCountSuffix}
        </span>
      </div>
    </div>
  )
}
