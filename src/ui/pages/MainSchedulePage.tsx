import { useScheduleDDay } from '../hooks/useScheduleDDay.ts'
import { Header } from '../components/Header.tsx'
import { CounterCard } from '../components/CounterCard.tsx'
import { NoticeSection } from '../components/NoticeSection.tsx'

export function MainSchedulePage() {
  const { data, isLoading, error } = useScheduleDDay()

  return (
    <div className="space-y-8">
      {/* Header */}
      <Header
        title={data ? data.title : '제47회 투자자산운용사'}
        todayFormatted={data ? data.todayFormatted : ''}
        todayStr={data ? data.todayStr : ''}
      />

      {/* Status Indicators */}
      {isLoading && !data && (
        <div className="flex justify-center items-center py-2 text-xs text-base-content/60">
          <span className="loading loading-spinner loading-xs mr-2"></span>
          최신 일정을 동기화하는 중입니다...
        </div>
      )}
      {error && (
        <div className="alert alert-warning text-sm shadow-sm">
          <span>서버 연동 알림: 기본 일정을 표시 중입니다. ({error})</span>
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

      {/* Notice Section */}
      <NoticeSection />
    </div>
  )
}
