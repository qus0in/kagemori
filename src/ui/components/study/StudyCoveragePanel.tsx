import { useState } from 'react'
import { useExamBlueprint } from '../../hooks/useCatalog.ts'
import { useStudyCoverage } from '../../store/useStudyCoverage.ts'
import { StudyCoverageMap } from './StudyCoverageMap.tsx'
import { summarizeCoverage } from '../../../domain/models/StudyCoverage.ts'

export function StudyCoveragePanel({ compact = false }: { compact?: boolean }) {
  const { data: blueprint, isPending, isError, refetch } = useExamBlueprint()
  const { results, storageAvailable, clear } = useStudyCoverage()
  const [confirmClear, setConfirmClear] = useState(false)
  const progress = blueprint ? summarizeCoverage(blueprint, results) : null

  return (
    <section aria-labelledby="study-coverage-title" className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6 shadow-sm space-y-5">
      <header>
        <p className="text-[11px] font-semibold tracking-widest text-primary mb-1">나의 학습 지도</p>
        <h2 id="study-coverage-title" className="text-lg font-bold">한 문제씩, 학습 영역 채우기</h2>
        <p className="text-xs sm:text-sm text-base-content/65 mt-2 leading-relaxed">
          세부과목마다 힌트 없이 한 문제를 맞히면 한 영역이 채워져요. 모든 영역을 채워 100%에 도전하세요.
        </p>
      </header>

      {isPending && <p role="status" className="text-sm text-base-content/60">학습 영역을 불러오는 중이에요…</p>}
      {isError && (
        <div role="alert" className="text-sm flex flex-wrap items-center gap-3">
          <span>학습 영역을 불러오지 못했어요. 풀이 기록은 유지됩니다.</span>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => void refetch()}>다시 불러오기</button>
        </div>
      )}
      {blueprint && blueprint.subjects.some((subject) => subject.topics.length > 0) && (
        <details open={!compact}>
          <summary className="cursor-pointer text-sm font-semibold mb-4">
            누적 진도와 영역별 결과 보기
            {compact && progress && <span className="ml-2 text-primary">{progress.percent}% 채움 · {progress.remainingPercent}% 남음</span>}
          </summary>
          <StudyCoverageMap blueprint={blueprint} results={results} />
        </details>
      )}
      {blueprint && !blueprint.subjects.some((subject) => subject.topics.length > 0) && (
        <p className="text-sm">학습 영역을 준비 중이에요.</p>
      )}

      <footer className="border-t border-base-200 pt-4 space-y-2 text-xs text-base-content/60 leading-relaxed">
        <p>이 브라우저에서 지금부터 푼 결과가 저장돼요.</p>
        <details>
          <summary className="cursor-pointer">진도 계산 및 저장 기준</summary>
          <div className="space-y-1 mt-2">
            <p>각 문항의 최근 결과로 계산해요. 오답과 힌트 후 정답은 복습 필요로 표시되며, 재풀이 결과에 따라 진도가 바뀔 수 있어요.</p>
            <p>학습 범위를 확인하는 진도이며 숙달률이나 합격 확률은 아니에요. 제공되는 문제의 범위에 따라 아직 채울 수 없는 영역이 있을 수 있어요.</p>
            <p>이전 풀이와 다른 기기의 기록은 포함되지 않아요. 브라우저 데이터를 삭제하면 진도도 초기화돼요.</p>
          </div>
        </details>
        {!storageAvailable && <p role="status" className="text-warning">기록을 저장하거나 불러올 수 없어 현재 화면에서만 진도를 유지해요.</p>}
        {results.length > 0 && !confirmClear && (
          <button type="button" className="btn btn-ghost btn-xs" onClick={() => setConfirmClear(true)}>이 브라우저의 진도 초기화</button>
        )}
        {confirmClear && (
          <div className="flex flex-wrap items-center gap-2">
            <span>이 브라우저의 진도 기록을 지울까요?</span>
            <button type="button" className="btn btn-error btn-xs" onClick={() => { clear(); setConfirmClear(false) }}>기록 지우기</button>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setConfirmClear(false)}>취소</button>
          </div>
        )}
      </footer>
    </section>
  )
}
