import { DICTIONARY } from '../../constants/dictionary.ts'
import type { BookCatalog } from '../../../domain/models/Catalog.ts'
import { CatalogVolumeSelector } from './CatalogVolumeSelector.tsx'
import { CatalogBookHeader } from './CatalogBookHeader.tsx'
import { CatalogBookPartAccordion } from './CatalogBookPartAccordion.tsx'

export interface CatalogBooksTabProps {
  books: BookCatalog[] | undefined
  isLoading: boolean
  error: unknown
  selectedBookId: string
  expandedParts: Record<string, boolean>
  onSelectBook: (id: string) => void
  onTogglePart: (partId: string) => void
}

export function CatalogBooksTab({
  books,
  isLoading,
  error,
  selectedBookId,
  expandedParts,
  onSelectBook,
  onTogglePart,
}: CatalogBooksTabProps) {
  const dict = DICTIONARY.catalog
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }
  if (error) {
    return <div className="alert alert-error"><span>{dict.errorBooks}</span></div>
  }
  const selectedBook = books?.find((b) => b.id === selectedBookId) ?? books?.[0]
  if (!books || !selectedBook) return null

  return (
    <div className="space-y-6">
      <CatalogVolumeSelector
        books={books}
        selectedBookId={selectedBook.id}
        onSelectBook={onSelectBook}
      />

      <div className="card bg-base-100 shadow border border-base-300 p-5 overflow-hidden">
        <CatalogBookHeader book={selectedBook} />

        <div className="space-y-4 mt-5">
          {selectedBook.parts.map((part) => (
            <CatalogBookPartAccordion
              key={part.id}
              part={part}
              isExpanded={expandedParts[part.id] !== false}
              onToggle={() => onTogglePart(part.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
