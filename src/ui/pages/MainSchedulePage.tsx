import { useScheduleDDay } from '../hooks/useScheduleDDay.ts'
import { Header } from '../components/Header.tsx'
import { CounterCard } from '../components/CounterCard.tsx'
import { NoticeSection } from '../components/NoticeSection.tsx'
import { MainStudyFeaturesCard } from '../components/main/MainStudyFeaturesCard.tsx'
import { MainExamSummaryCard } from '../components/main/MainExamSummaryCard.tsx'
import { DICTIONARY } from '../constants/dictionary.ts'

export function MainSchedulePage() {
  const { data, isLoading, error } = useScheduleDDay()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title={data ? data.title : DICTIONARY.schedule.defaultTitle}
        todayFormatted={data ? data.todayFormatted : ''}
        todayStr={data ? data.todayStr : ''}
      />

      {/* Status Indicators */}
      {isLoading && !data && (
        <div className="flex justify-center items-center py-2 text-xs text-base-content/60">
          <span className="loading loading-spinner loading-xs mr-2"></span>
          {DICTIONARY.schedule.syncing}
        </div>
      )}
      {error && (
        <div className="alert alert-warning text-sm shadow-sm">
          <span>
            {DICTIONARY.schedule.fallbackAlertPrefix} ({error})
          </span>
        </div>
      )}

      {/* Counter Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {data.items.map((item) => (
            <CounterCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* 2026 Study Features Card */}
      <MainStudyFeaturesCard />

      {/* 2026 Exam Blueprint Summary Card */}
      <MainExamSummaryCard />

      {/* Notice Section */}
      <NoticeSection />
    </div>
  )
}
