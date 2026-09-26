import { DICTIONARY } from '../../constants/dictionary.ts'

export type CatalogTab = 'books' | 'blueprint' | 'priority'

export interface CatalogHeaderProps {
  activeTab: CatalogTab
  onSelectTab: (tab: CatalogTab) => void
}

export function CatalogHeader({ activeTab, onSelectTab }: CatalogHeaderProps) {
  const dict = DICTIONARY.catalog
  const tabs: Array<{ id: CatalogTab; label: string }> = [
    { id: 'books', label: dict.tabs.books },
    { id: 'blueprint', label: dict.tabs.blueprint },
    { id: 'priority', label: dict.tabs.priority },
  ]

  return (
    <div className="card bg-base-100 shadow border border-base-300 p-5 sm:p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary break-keep">
            {dict.headerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1 break-keep leading-relaxed">
            {dict.headerSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 self-start md:self-auto">
          <span className="badge badge-outline badge-primary text-xs">{dict.editionBadge}</span>
          <span className="badge badge-outline text-xs">{dict.examFormatBadge}</span>
        </div>
      </div>

      <div className="tabs tabs-boxed mt-6 bg-base-200 overflow-x-auto flex-nowrap max-w-full min-w-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab shrink-0 ${activeTab === t.id ? 'tab-active font-bold' : ''}`}
            onClick={() => onSelectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
