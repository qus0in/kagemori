// src/ui/pages/CatalogPage.tsx
import { useState } from 'react'
import { useCatalogBooks, useExamBlueprint } from '../hooks/useCatalog.ts'
import { CatalogHeader, type CatalogTab } from '../components/catalog/CatalogHeader.tsx'
import { CatalogBooksTab } from '../components/catalog/CatalogBooksTab.tsx'
import { CatalogBlueprintTab } from '../components/catalog/CatalogBlueprintTab.tsx'
import { CatalogPriorityTab } from '../components/catalog/CatalogPriorityTab.tsx'

export function CatalogPage() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('books')
  const [selectedBookId, setSelectedBookId] = useState<string>('book-1')
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({})

  const { data: books, isLoading: isBooksLoading, error: booksError } = useCatalogBooks()
  const { data: blueprint, isLoading: isBpLoading, error: bpError } = useExamBlueprint()

  const togglePart = (partId: string) => {
    setExpandedParts((prev) => ({ ...prev, [partId]: !prev[partId] }))
  }

  return (
    <div className="space-y-6">
      <CatalogHeader activeTab={activeTab} onSelectTab={setActiveTab} />

      {activeTab === 'books' && (
        <CatalogBooksTab
          books={books}
          isLoading={isBooksLoading}
          error={booksError}
          selectedBookId={selectedBookId}
          expandedParts={expandedParts}
          onSelectBook={setSelectedBookId}
          onTogglePart={togglePart}
        />
      )}

      {activeTab === 'blueprint' && (
        <CatalogBlueprintTab
          blueprint={blueprint}
          isLoading={isBpLoading}
          error={bpError}
        />
      )}

      {activeTab === 'priority' && <CatalogPriorityTab />}
    </div>
  )
}

export default CatalogPage
