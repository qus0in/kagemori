import type { BookPart } from "../../../domain/models/Catalog.ts"

export const b2p5to6: BookPart[] = [
  {
    id: "p2-05", bookId: "book-2", ordinal: 5, title: "PART 05 투자분석기법 - 산업분석",
    chapters: [
      { id: "c2-05-01", partId: "p2-05", ordinal: 1, title: "Chapter 01 산업분석 개요", sectionRangeHint: "SECTION 01–03" },
      { id: "c2-05-02", partId: "p2-05", ordinal: 2, title: "Chapter 02 산업구조 변화 분석", sectionRangeHint: "SECTION 01–02" },
      { id: "c2-05-03", partId: "p2-05", ordinal: 3, title: "Chapter 03 산업연관분석(Input-Output Analysis)", sectionRangeHint: "SECTION 01–03" },
      { id: "c2-05-04", partId: "p2-05", ordinal: 4, title: "Chapter 04 라이프사이클 분석(Life Cycle Analysis)", sectionRangeHint: "SECTION 01–03" },
      { id: "c2-05-05", partId: "p2-05", ordinal: 5, title: "Chapter 05 경기순환 분석(Business Cycle Analysis)", sectionRangeHint: "SECTION 01–02" },
      { id: "c2-05-06", partId: "p2-05", ordinal: 6, title: "Chapter 06 산업경쟁력 분석", sectionRangeHint: "SECTION 01–02" },
      { id: "c2-05-07", partId: "p2-05", ordinal: 7, title: "Chapter 07 산업정책 분석", sectionRangeHint: "SECTION 01–02" },
    ],
  },
  {
    id: "p2-06", bookId: "book-2", ordinal: 6, title: "PART 06 리스크 관리",
    chapters: [
      { id: "c2-06-01", partId: "p2-06", ordinal: 1, title: "Chapter 01 리스크와 리스크 관리의 필요성", sectionRangeHint: "SECTION 01–02" },
      { id: "c2-06-02", partId: "p2-06", ordinal: 2, title: "Chapter 02 시장 리스크(Market Risk)의 측정", sectionRangeHint: "SECTION 01–04" },
      { id: "c2-06-03", partId: "p2-06", ordinal: 3, title: "Chapter 03 신용 리스크(Credit Risk)의 측정", sectionRangeHint: "SECTION 01–04" },
    ],
  },
]
