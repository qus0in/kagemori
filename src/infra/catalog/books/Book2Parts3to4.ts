import type { BookPart } from "../../../domain/models/Catalog.ts"

export const b2p3to4: BookPart[] = [
  {
    id: "p2-03", bookId: "book-2", ordinal: 3, title: "PART 03 투자분석기법 - 기본적 분석",
    chapters: [
      { id: "c2-03-01", partId: "p2-03", ordinal: 1, title: "Chapter 01 증권분석의 개념 및 기본체계", sectionRangeHint: "SECTION 01–04" },
      { id: "c2-03-02", partId: "p2-03", ordinal: 2, title: "Chapter 02 유가증권의 가치평가", sectionRangeHint: "SECTION 01–06" },
      { id: "c2-03-03", partId: "p2-03", ordinal: 3, title: "Chapter 03 기업분석(재무제표분석)", sectionRangeHint: "SECTION 01–10" },
      { id: "c2-03-04", partId: "p2-03", ordinal: 4, title: "Chapter 04 주식투자", sectionRangeHint: "SECTION 01–04" },
    ],
  },
  {
    id: "p2-04", bookId: "book-2", ordinal: 4, title: "PART 04 투자분석기법 - 기술적 분석",
    chapters: [
      { id: "c2-04-01", partId: "p2-04", ordinal: 1, title: "Chapter 01 기술적 분석", sectionRangeHint: "SECTION 01–02" },
      { id: "c2-04-02", partId: "p2-04", ordinal: 2, title: "Chapter 02 추세분석", sectionRangeHint: "SECTION 01–08" },
      { id: "c2-04-03", partId: "p2-04", ordinal: 3, title: "Chapter 03 패턴 분석", sectionRangeHint: "SECTION 01–03" },
      { id: "c2-04-04", partId: "p2-04", ordinal: 4, title: "Chapter 04 캔들 차트 분석", sectionRangeHint: "SECTION 01–02" },
      { id: "c2-04-05", partId: "p2-04", ordinal: 5, title: "Chapter 05 지표 분석", sectionRangeHint: "SECTION 01–03" },
      { id: "c2-04-06", partId: "p2-04", ordinal: 6, title: "Chapter 06 엘리어트 파동이론", sectionRangeHint: "SECTION 01–04" },
    ],
  },
]
