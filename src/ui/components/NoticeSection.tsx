export function NoticeSection() {
  return (
    <section className="card bg-base-100/60 border border-base-300 p-5 text-xs text-base-content/70 space-y-2">
      <h2 className="font-semibold text-base-content text-sm">안내 사항</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>모든 D-day 계산은 한국 표준시(Asia/Seoul) 달력 기준으로 매일 자정에 자동 갱신됩니다.</li>
        <li>원서접수는 시작일 기준이며, 접수 마감 시간이나 시험 시작 시간은 포함되지 않습니다.</li>
        <li>정확한 시험 접수 및 세부 규정은 금융투자협회 자격시험센터 공지사항을 확인하세요.</li>
      </ul>
    </section>
  )
}
