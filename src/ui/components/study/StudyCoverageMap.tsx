import { useState } from 'react'
import type { ExamBlueprint } from '../../../domain/models/CatalogTypes.ts'
import { summarizeCoverage, type CoverageResult, type TopicCoverage } from '../../../domain/models/StudyCoverage.ts'

const statusLabels = { empty: '미풀이', review: '복습 필요', filled: '정답 확인' }
const tileStyles = {
  empty: 'bg-base-100 border-base-300 text-base-content/65',
  review: 'bg-warning/15 border-warning/50 text-base-content',
  filled: 'bg-primary border-primary text-primary-content',
}

export function StudyCoverageMap({ blueprint, results }: {
  blueprint: ExamBlueprint
  results: readonly CoverageResult[]
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const coverage = summarizeCoverage(blueprint, results)
  const selected = coverage.subjects.flatMap((subject) => subject.topics).find((topic) => topic.id === selectedId)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3" aria-live="polite">
        <div>
          <p className="text-xs text-base-content/60">전체 영역 채움 진도</p>
          <p className="text-4xl font-bold tracking-tight text-primary tabular-nums mt-1">
            {coverage.percent}<span className="text-xl ml-0.5">%</span>
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{coverage.filled} / {coverage.total}개 영역 채움</p>
          <p className="text-base-content/60 mt-1">앞으로 {coverage.remainingPercent}% · {coverage.total - coverage.filled}개 영역</p>
        </div>
      </div>
      <div role="progressbar" aria-label="전체 영역 채움 진도" aria-valuenow={coverage.percent}
        aria-valuemin={0} aria-valuemax={100}
        className="h-3 overflow-hidden rounded-full bg-base-200">
        <div className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-500"
          style={{ width: `${coverage.percent}%` }} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/70">
        <span>● 정답 확인 {coverage.filled}</span>
        <span>◐ 복습 필요 {coverage.review}</span>
        <span>○ 미풀이 {coverage.total - coverage.filled - coverage.review}</span>
      </div>
      <div className="space-y-4">
        {coverage.subjects.map((subject, index) => (
          <div key={subject.id} className="rounded-xl bg-base-200/50 p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-semibold mb-3 flex justify-between gap-3">
              <span>{index + 1}과목 · {subject.title}</span>
              <span className="shrink-0 tabular-nums text-base-content/60">
                {subject.topics.filter((topic) => topic.status === 'filled').length}/{subject.topics.length}
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {subject.topics.map((topic) => (
                <button key={topic.id} type="button" onClick={() => setSelectedId(topic.id)}
                  aria-pressed={selectedId === topic.id} aria-label={`${topic.title}: ${statusLabels[topic.status]}`}
                  className={`min-h-20 rounded-lg border p-3 text-left text-xs flex flex-col justify-between gap-3
                    motion-safe:transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-primary ${tileStyles[topic.status]}`}>
                  <span className="font-semibold leading-relaxed">{topic.title}</span>
                  <span className="text-[11px] opacity-80">
                    {topic.status === 'filled' ? '✓ ' : topic.status === 'review' ? '↻ ' : '○ '}{statusLabels[topic.status]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-base-300 p-3 text-xs leading-relaxed" aria-live="polite">
        {selected ? <TopicDetail topic={selected} /> : '영역을 누르면 풀이 결과와 다음 목표를 확인할 수 있어요.'}
      </div>
    </div>
  )
}

function TopicDetail({ topic }: { topic: TopicCoverage }) {
  return (
    <>
      <p className="font-semibold mb-1">{topic.title} · {statusLabels[topic.status]}</p>
      <p>서로 다른 {topic.answered}문항 풀이 · 힌트 없는 정답 {topic.independentCorrect}문항</p>
      <p className="text-base-content/65 mt-1">
        {topic.status === 'filled' ? '영역을 채웠어요. 다른 문제로 이해도를 계속 확인해 보세요.'
          : '이 영역에서 힌트 없이 1문항을 맞히면 영역이 채워져요.'}
      </p>
    </>
  )
}
