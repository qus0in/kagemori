// src/ui/pages/CatalogPage.tsx
import { useState } from 'react'
import { useCatalogBooks, useExamBlueprint } from '../hooks/useCatalog.ts'
import { DICTIONARY } from '../constants/dictionary.ts'

export function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'books' | 'blueprint' | 'priority'>('books')
  const [selectedBookId, setSelectedBookId] = useState<string>('book-1')
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({})

  const { data: books, isLoading: isBooksLoading, error: booksError } = useCatalogBooks()
  const { data: blueprint, isLoading: isBpLoading, error: bpError } = useExamBlueprint()

  const selectedBook = books?.find((b) => b.id === selectedBookId) ?? books?.[0]
  const dict = DICTIONARY.catalog

  const togglePart = (partId: string) => {
    setExpandedParts((prev) => ({
      ...prev,
      [partId]: !prev[partId],
    }))
  }

  const isPartExpanded = (partId: string) => {
    return expandedParts[partId] !== false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

        {/* Navigation Tabs */}
        <div className="tabs tabs-boxed mt-6 bg-base-200 overflow-x-auto flex-nowrap max-w-full min-w-0">
          <button
            type="button"
            className={`tab shrink-0 ${activeTab === 'books' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            {dict.tabs.books}
          </button>
          <button
            type="button"
            className={`tab shrink-0 ${activeTab === 'blueprint' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('blueprint')}
          >
            {dict.tabs.blueprint}
          </button>
          <button
            type="button"
            className={`tab shrink-0 ${activeTab === 'priority' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('priority')}
          >
            {dict.tabs.priority}
          </button>
        </div>
      </div>

      {/* Tab 1: Books Catalog */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          {isBooksLoading && (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          )}

          {booksError && (
            <div className="alert alert-error">
              <span>{dict.errorBooks}</span>
            </div>
          )}

          {books && (
            <>
              {/* Volume Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-full min-w-0">
                {books.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBookId(b.id)}
                    className={`btn btn-sm sm:btn-md justify-start flex-col items-start h-auto py-2.5 px-3 border min-w-0 max-w-full overflow-hidden ${
                      selectedBook?.id === b.id
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

              {/* Selected Book Info Header */}
              {selectedBook && (
                <div className="card bg-base-100 shadow border border-base-300 p-5 overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-base-200 pb-4 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-base-content break-keep">
                        {selectedBook.title}
                      </h2>
                      <p className="text-xs text-base-content/60 mt-0.5 break-keep">
                        {dict.isbnPrefix}<span className="font-mono">{selectedBook.isbn13}</span>{dict.publisherNote}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0 self-start sm:self-auto">
                      <span className="badge badge-neutral text-xs">
                        {selectedBook.parts.length}{dict.partCountSuffix}
                      </span>
                      <span className="badge badge-neutral text-xs">
                        {selectedBook.parts.reduce((sum, p) => sum + p.chapters.length, 0)}{dict.chapterCountSuffix}
                      </span>
                    </div>
                  </div>

                  {/* Parts & Chapters List */}
                  <div className="space-y-4 mt-5">
                    {selectedBook.parts.map((part) => (
                      <div
                        key={part.id}
                        className="border border-base-200 rounded-lg overflow-hidden bg-base-200/40"
                      >
                        <button
                          type="button"
                          onClick={() => togglePart(part.id)}
                          className="w-full flex justify-between items-center p-3.5 bg-base-200/80 hover:bg-base-300/80 transition-colors text-left font-semibold text-sm"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="text-primary font-bold break-keep">{part.title}</span>
                            <span className="text-xs text-base-content/60 font-normal shrink-0">
                              ({part.chapters.length}{dict.chapterInPartSuffix})
                            </span>
                          </span>
                          <span className="text-xs text-base-content/60 shrink-0">
                            {isPartExpanded(part.id) ? dict.fold : dict.unfold}
                          </span>
                        </button>

                        {isPartExpanded(part.id) && (
                          <div className="p-3 bg-base-100 divide-y divide-base-200">
                            {part.chapters.map((ch) => (
                              <div
                                key={ch.id}
                                className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm hover:bg-base-200/50 rounded min-w-0"
                              >
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
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 2: Exam Blueprint & Passing Criteria */}
      {activeTab === 'blueprint' && (
        <div className="space-y-6">
          {isBpLoading && (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          )}

          {bpError && (
            <div className="alert alert-error">
              <span>{dict.errorBlueprint}</span>
            </div>
          )}

          {blueprint && (
            <>
              {/* Passing Rules Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card bg-base-100 shadow border border-base-300 p-4 min-w-0">
                  <div className="text-xs text-base-content/60 font-medium">{dict.passingCriteria.totalScore.label}</div>
                  <div className="text-2xl font-black text-primary mt-1">{dict.passingCriteria.totalScore.value}</div>
                  <div className="text-xs text-base-content/70 mt-1 break-keep">
                    {dict.passingCriteria.totalScore.desc}
                  </div>
                </div>
                <div className="card bg-base-100 shadow border border-base-300 p-4 min-w-0">
                  <div className="text-xs text-base-content/60 font-medium">{dict.passingCriteria.threshold.label}</div>
                  <div className="text-2xl font-black text-error mt-1">{dict.passingCriteria.threshold.value}</div>
                  <div className="text-xs text-base-content/70 mt-1 break-keep">
                    {dict.passingCriteria.threshold.desc}
                  </div>
                </div>
                <div className="card bg-base-100 shadow border border-base-300 p-4 min-w-0">
                  <div className="text-xs text-base-content/60 font-medium">{dict.passingCriteria.thresholdSummary.label}</div>
                  <div className="text-sm font-semibold text-base-content mt-2 space-y-0.5">
                    {dict.passingCriteria.thresholdSummary.items.map((it, idx) => (
                      <div key={idx} className="break-keep">
                        {it.subject}: 최소 <span className="text-error font-bold">{it.min}</span> / {it.total}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Cards */}
              <div className="space-y-5">
                {blueprint.subjects.map((sub) => {
                  const subjectPercentage = Math.round((sub.questionCount / 100) * 100)

                  return (
                    <div key={sub.id} className="card bg-base-100 shadow border border-base-300 p-5 min-w-0 overflow-hidden">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-base-200 pb-3 min-w-0">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-base-content break-keep">
                            {sub.title}
                          </h3>
                          <p className="text-xs text-base-content/60 mt-0.5 break-keep">
                            총 {sub.questionCount}문항 ({subjectPercentage}%) • 과락 최저 정답선: {sub.minimumCorrect}문항
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                          <span className="badge badge-primary font-bold text-xs">
                            {sub.questionCount}문항
                          </span>
                          <span className="badge badge-error badge-outline text-xs">
                            과락기준: {sub.minimumCorrect}개
                          </span>
                        </div>
                      </div>

                      {/* Topics Table */}
                      <div className="mt-4 overflow-x-auto max-w-full">
                        <table className="table table-sm w-full">
                          <thead>
                            <tr className="bg-base-200/60 text-xs">
                              <th className="w-12">{dict.tableHeaders.ordinal}</th>
                              <th>{dict.tableHeaders.topicTitle}</th>
                              <th className="text-right w-24">{dict.tableHeaders.questionCount}</th>
                              <th className="w-36">{dict.tableHeaders.ratio}</th>
                              <th className="text-right w-28">{dict.tableHeaders.mappedChapters}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sub.topics.map((top) => {
                              const topicRatio = Math.round((top.questionCount / sub.questionCount) * 100)

                              return (
                                <tr key={top.id} className="hover:bg-base-200/40">
                                  <td className="text-xs font-mono text-base-content/60">{top.ordinal}</td>
                                  <td className="font-medium text-sm text-base-content/90 break-keep">{top.title}</td>
                                  <td className="text-right font-bold text-sm text-primary">
                                    {top.questionCount}문항
                                  </td>
                                  <td>
                                    <div className="flex items-center gap-2">
                                      <progress
                                        className="progress progress-primary w-20"
                                        value={topicRatio}
                                        max="100"
                                      ></progress>
                                      <span className="text-xs text-base-content/60">{topicRatio}%</span>
                                    </div>
                                  </td>
                                  <td className="text-right text-xs">
                                    <span className="badge badge-ghost badge-sm font-mono">
                                      {top.mappedChapterIds?.length ?? 0}개 장
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: Provisional Study Priority Guide */}
      {activeTab === 'priority' && (
        <div className="space-y-6">
          <div className="alert alert-warning text-xs leading-relaxed break-keep">
            <div>
              <div className="font-bold text-sm mb-1">{dict.priorityGuide.warningTitle}</div>
              <div>{dict.priorityGuide.warningDesc}</div>
            </div>
          </div>

          {/* Group A: High-Priority Focus */}
          <div className="card bg-base-100 shadow border border-base-300 p-5 min-w-0">
            <div className="flex items-center gap-2 border-b border-base-200 pb-3">
              <span className="badge badge-primary font-bold">{dict.priorityGuide.groupA.badge}</span>
              <h3 className="font-bold text-base text-base-content">
                {dict.priorityGuide.groupA.title}
              </h3>
            </div>

            <div className="space-y-4 mt-4 text-sm">
              {dict.priorityGuide.groupA.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-base-200/50 rounded-lg border border-base-200 min-w-0">
                  <div className="flex justify-between items-center font-bold text-primary gap-2">
                    <span className="break-keep">{item.title}</span>
                    <span className="badge badge-primary badge-sm shrink-0">{item.scopeBadge}</span>
                  </div>
                  <p className="text-xs text-base-content/80 mt-1 break-keep leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Group B: Medium-Priority & Threshold Safety */}
          <div className="card bg-base-100 shadow border border-base-300 p-5 min-w-0">
            <div className="flex items-center gap-2 border-b border-base-200 pb-3">
              <span className="badge badge-secondary font-bold">{dict.priorityGuide.groupB.badge}</span>
              <h3 className="font-bold text-base text-base-content">
                {dict.priorityGuide.groupB.title}
              </h3>
            </div>

            <div className="space-y-4 mt-4 text-sm">
              {dict.priorityGuide.groupB.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-base-200/50 rounded-lg border border-base-200 min-w-0">
                  <div className="flex justify-between items-center font-bold text-secondary gap-2">
                    <span className="break-keep">{item.title}</span>
                    <span className="badge badge-secondary badge-sm shrink-0">{item.scopeBadge}</span>
                  </div>
                  <p className="text-xs text-base-content/80 mt-1 break-keep leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default CatalogPage
