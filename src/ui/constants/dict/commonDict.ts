export const commonDict = {
  common: {
    brandName: 'Kagemori D-day',
    footerCopyright: '제47회 투자자산운용사 D-Day • Powered by Hono & Cloudflare Workers',
    themeLight: '☀️ 라이트',
    themeDark: '🌙 다크',
    themeToggleTitle: '테마 변경',
  },
  nav: {
    counter: '카운터',
    about: '시험안내',
    catalog: '교재·출제기준',
    study: '문제 풀기',
  },
  schedule: {
    defaultTitle: '제47회 투자자산운용사',
    badge: 'KOFIA 자격시험',
    subtitle: '주요 시험 일정 D-day 카운터',
    syncing: '최신 일정을 동기화하는 중입니다...',
    fallbackAlertPrefix: '서버 연동 알림: 기본 일정을 표시 중입니다.',
    targetDateLabel: '대상 일자',
    targetDateFormattedLabel: '상세 일시',
    noticesHeading: '안내 사항',
    notices: [
      '모든 D-day 계산은 한국 표준시(Asia/Seoul) 달력 기준으로 매일 자정에 자동 갱신됩니다.',
      '원서접수는 시작일 기준이며, 접수 마감 시간이나 시험 시작 시간은 포함되지 않습니다.',
      '정확한 시험 접수 및 세부 규정은 금융투자협회 자격시험센터 공지사항을 확인하세요.',
    ],
  },
  about: {
    title: '자격시험 안내',
    subtitle: '제47회 투자자산운용사 (Certified Investment Manager) 개요',
    definitionTitle: '투자자산운용사란?',
    definitionText:
      '집합투자재산, 신탁재산 또는 투자일임재산을 운용하는 업무를 수행하는 인력으로, 금융투자협회에서 주관하는 전문 금융 자격시험입니다.',
    infoTitle: '주요 시험 정보',
    infoList: [
      { label: '문항 수', value: '100문항 (객관식 4지선다형)' },
      { label: '시험 시간', value: '120분' },
      { label: '합격 기준', value: '응시과목별 40점 이상, 전 과목 평균 70점 이상' },
      { label: '주관 기관', value: '사단법인 한국금융투자협회 (KOFIA)' },
    ],
    backButton: '← D-day 카운터로 돌아가기',
    officialSite: '금융투자협회 공식 홈페이지 ↗',
    officialUrl: 'https://license.kofia.or.kr',
  },
} as const
