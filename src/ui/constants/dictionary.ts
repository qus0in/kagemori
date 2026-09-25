// src/ui/constants/dictionary.ts

export const DICTIONARY = {
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
  catalog: {
    headerTitle: '2026 표준교재 목차 & 출제기준',
    headerSubtitle:
      '금융투자교육원 2026 투자자산운용사 1~5권 목차 계층(28 PART, 125 Chapter)과 시험 과목별 문항 배분',
    editionBadge: '2026 개정판',
    examFormatBadge: '100문항 / 120분',
    tabs: {
      books: '📚 교재 목차 (1~5권)',
      blueprint: '🎯 시험 출제기준 & 과락선',
      priority: '⚡ 잠정 학습 우선순위',
    },
    errorBooks: '교재 목차 데이터를 불러오는 데 실패했습니다.',
    errorBlueprint: '출제기준 데이터를 불러오는 데 실패했습니다.',
    partCountSuffix: '개 PART',
    chapterCountSuffix: '개 Chapter',
    chapterInPartSuffix: '개 장',
    fold: '▲ 접기',
    unfold: '▼ 펼치기',
    noSectionHint: 'SECTION 표기 없음',
    isbnPrefix: 'ISBN-13: ',
    publisherNote: ' • 금융투자교육원 표준교재',
    passingCriteria: {
      totalScore: {
        label: '총 합격 기준',
        value: '70점 이상',
        desc: '총 100문항 중 70문항 이상 정답 (120분 시험)',
      },
      threshold: {
        label: '과락 기준 (전 과목 필수)',
        value: '과목별 40% 이상',
        desc: '한 과목이라도 40% 미만 획득 시 총점 무관 불합격',
      },
      thresholdSummary: {
        label: '과목별 과락 최저선',
        items: [
          { subject: '1과목', min: '8문항', total: '20문항' },
          { subject: '2과목', min: '12문항', total: '30문항' },
          { subject: '3과목', min: '20문항', total: '50문항' },
        ],
      },
    },
    tableHeaders: {
      ordinal: '순번',
      topicTitle: '세부과목명',
      questionCount: '문항 배분',
      ratio: '비중',
      mappedChapters: '매핑 장(Chapter) 수',
    },
    priorityGuide: {
      warningTitle: '⚠️ 잠정 학습 우선순위 안내',
      warningDesc:
        '본 우선순위는 시험 공식 세부과목별 문항 배분과 주요 교육기관의 수험 전략 조언을 바탕으로 정리한 추론형 가이드입니다. 과거 기출문제 실측 빈도 자료가 아니므로 특정 절을 임의로 생략하지 마시고, 특히 1·2과목의 과락선(8/20, 12/30)에 각별히 유의하십시오.',
      groupA: {
        badge: '우선순위 A',
        title: '선행 반복 & 고배점 집중 영역',
        items: [
          {
            title: '1. 투자분석기법 (12문항)',
            scopeBadge: '제2권 PART 03~05',
            desc: '단일 세부과목 중 문항 배분(12문항)이 가장 큽니다. 유가증권 가치평가 및 재무제표 분석을 선점하고 기술적·산업분석을 빠뜨리지 않는 전략이 유효합니다.',
          },
          {
            title: '2. 주식 · 채권 · 파생상품 운용 (총 18문항)',
            scopeBadge: '제4권 PART 01~03 (각 6문항)',
            desc: '주식운용(6), 채권운용(6), 파생상품운용(6) 총 18문항의 대형 배분군입니다. 주식은 운용전략 위주, 채권은 가격결정·듀레이션 계산, 파생은 선물/옵션 패리티 및 가격 모형을 연습합니다.',
          },
          {
            title: '3. 법규 (총 11문항)',
            scopeBadge: '제3권 PART 02 (자본시장법 7 + 금융위 4)',
            desc: '광범위한 규제 조항 중 금융투자업자 영업행위 규제와 집합투자기구(펀드) 설립·운용 규칙을 반복 학습하는 것이 유리합니다.',
          },
          {
            title: '4. 금융상품 & 부동산 관련 (총 13문항)',
            scopeBadge: '제1권 PART 03~12 (상품 8 + 부동산 5)',
            desc: '1과목 과락 방지(최소 8문항)의 주춧돌입니다. 펀드상품, 신탁, ABS/MBS 기본구조와 부동산 기초 및 리츠 구조를 확인합니다.',
          },
          {
            title: '5. 리스크관리 (8문항)',
            scopeBadge: '제2권 PART 06',
            desc: 'VaR(Value at Risk)의 개념, 측정 기법, 한계점 및 신용위험 모형을 확실히 정리하여 안정적인 득점을 확보합니다.',
          },
        ],
      },
      groupB: {
        badge: '우선순위 B',
        title: '과락 방지 & 순차 점검 영역',
        items: [
          {
            title: '1. 세제관련 법규 · 세무전략 (7문항)',
            scopeBadge: '제1권 PART 01~02',
            desc: '1과목 과락선(8개) 방지를 위해 소득세(이자·배당·양도) 및 절세전략의 기본 구조를 반드시 점검해야 합니다.',
          },
          {
            title: '2. 대안투자 & 해외증권 (각 5문항)',
            scopeBadge: '제2권 PART 01~02',
            desc: 'PEF, 헤지펀드 특성과 국제 증권시장 및 해외 투자전략의 핵심 개념을 파악합니다.',
          },
          {
            title: '3. 직무윤리 (5문항)',
            scopeBadge: '제3권 PART 01',
            desc: '이해상충 방지, 신의성실 원칙 등 비교적 명확한 기준이 출제되므로 확실한 득점원으로 삼습니다.',
          },
          {
            title: '4. 분산투자(5문항) & 거시경제(4문항)',
            scopeBadge: '제5권 PART 01~02',
            desc: 'CAPM, 포트폴리오 위험 분산 계산 공식과 IS-LM 모형, 경기변동 지표를 실전 모의고사와 연계해 정리합니다.',
          },
          {
            title: '5. 운용결과분석 (4문항)',
            scopeBadge: '제4권 PART 04',
            desc: '샤프지수, 트레이너지수, 젠센의 알파 등 위험조정 성과지표의 수식과 해석법을 확인합니다.',
          },
        ],
      },
    },
  },
} as const
