import { priorityDict } from './priorityDict.ts'

export const catalogDict = {
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
  priorityGuide: priorityDict,
} as const
