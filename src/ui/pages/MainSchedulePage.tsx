import { Link } from 'react-router-dom'
import { useScheduleDDay } from '../hooks/useScheduleDDay.ts'
import { Header } from '../components/Header.tsx'
import { CounterCard } from '../components/CounterCard.tsx'
import { NoticeSection } from '../components/NoticeSection.tsx'
import { DICTIONARY } from '../constants/dictionary.ts'

export function MainSchedulePage() {
  const { data, isLoading, error } = useScheduleDDay()

  return (
    <div className="space-y-8">
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
          <span>{DICTIONARY.schedule.fallbackAlertPrefix} ({error})</span>
        </div>
      )}

      {/* Counter Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.items.map((item) => (
            <CounterCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Quick Study Navigation */}
      <div className="card bg-base-100 border border-base-300 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="font-bold text-base text-base-content">시험 문제 풀기</h3>
          <p className="text-xs text-base-content/70 mt-0.5">2026 표준교재 기반 핵심 객관식 문제를 연습할 수 있습니다.</p>
        </div>
        <Link to="/study" className="btn btn-primary btn-sm px-4 shrink-0">
          문제 풀러 가기 →
        </Link>
      </div>

      {/* Notice Section */}
      <NoticeSection />
    </div>
  )
}
