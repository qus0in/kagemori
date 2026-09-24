import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">자격시험 안내</h1>
        <p className="text-sm text-base-content/70">
          제47회 투자자산운용사 (Certified Investment Manager) 개요
        </p>
      </div>

      <div className="card bg-base-100 shadow-md border border-base-300 p-6 space-y-4">
        <h2 className="text-lg font-bold text-primary">투자자산운용사란?</h2>
        <p className="text-sm leading-relaxed text-base-content/80">
          집합투자재산, 신탁재산 또는 투자일임재산을 운용하는 업무를 수행하는 인력으로, 금융투자협회에서 주관하는 전문 금융 자격시험입니다.
        </p>

        <div className="divider my-2"></div>

        <h3 className="font-semibold text-sm">주요 시험 정보</h3>
        <ul className="list-disc list-inside text-xs space-y-1.5 text-base-content/70">
          <li><strong>문항 수</strong>: 100문항 (객관식 4지선다형)</li>
          <li><strong>시험 시간</strong>: 120분</li>
          <li><strong>합격 기준</strong>: 응시과목별 40점 이상, 전 과목 평균 70점 이상</li>
          <li><strong>주관 기관</strong>: 사단법인 한국금융투자협회 (KOFIA)</li>
        </ul>

        <div className="divider my-2"></div>

        <div className="flex justify-between items-center pt-2">
          <Link to="/" className="btn btn-outline btn-sm">
            ← D-day 카운터로 돌아가기
          </Link>
          <a
            href="https://license.kofia.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm text-white"
          >
            금융투자협회 공식 홈페이지 ↗
          </a>
        </div>
      </div>
    </div>
  )
}
