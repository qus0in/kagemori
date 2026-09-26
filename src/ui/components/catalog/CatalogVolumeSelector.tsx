import type { BookCatalog } from '../../../domain/models/Catalog.ts'

export interface CatalogVolumeSelectorProps {
  books: BookCatalog[]
  selectedBookId: string
  onSelectBook: (id: string) => void
}

export function CatalogVolumeSelector({ books, selectedBookId, onSelectBook }: CatalogVolumeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-full min-w-0">
      {books.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onSelectBook(b.id)}
          className={`btn btn-sm sm:btn-md justify-start flex-col items-start h-auto py-2.5 px-3 border min-w-0 max-w-full overflow-hidden ${
            selectedBookId === b.id
              ? 'btn-primary border-primary shadow'
              : 'btn-ghost bg-base-100 border-base-300 hover:bg-base-200'
          }`}
        >
          <span className="text-xs font-bold opacity-80 shrink-0">제{b.volumeNo}권</span>
          <span className="text-xs font-medium truncate block w-full text-left">
            {b.title.replace(/^제\d권\s*/, '')}
          </span>
        </button>
      ))}
    </div>
  )
}
