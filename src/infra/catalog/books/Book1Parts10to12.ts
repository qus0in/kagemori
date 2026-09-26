import type { BookPart } from "../../../domain/models/Catalog.ts"

export const b1p10to12: BookPart[] = [
  {
    id: "p1-10", bookId: "book-1", ordinal: 10, title: "PART 10 부동산 개론",
    chapters: [
      { id: "c1-10-01", partId: "p1-10", ordinal: 1, title: "Chapter 01 부동산 투자의 기초", sectionRangeHint: "SECTION 01–03" },
      { id: "c1-10-02", partId: "p1-10", ordinal: 2, title: "Chapter 02 부동산 투자의 이해", sectionRangeHint: "SECTION 01–02" },
      { id: "c1-10-03", partId: "p1-10", ordinal: 3, title: "Chapter 03 부동산의 이용 및 개발", sectionRangeHint: "SECTION 01–02" },
    ],
  },
  {
    id: "p1-11", bookId: "book-1", ordinal: 11, title: "PART 11 부동산 투자 상품의 이해",
    chapters: [
      { id: "c1-11-01", partId: "p1-11", ordinal: 1, title: "Chapter 01 부동산 투자 구분", sectionRangeHint: "SECTION 01–02" },
      { id: "c1-11-02", partId: "p1-11", ordinal: 2, title: "Chapter 02 부동산 펀드의 이해", sectionRangeHint: "SECTION 01–06" },
      { id: "c1-11-03", partId: "p1-11", ordinal: 3, title: "Chapter 03 부동산 포트폴리오", sectionRangeHint: "SECTION 01–02" },
      { id: "c1-11-04", partId: "p1-11", ordinal: 4, title: "Chapter 04 부동산 가치평가", sectionRangeHint: "SECTION 01–03" },
      { id: "c1-11-05", partId: "p1-11", ordinal: 5, title: "Chapter 05 부동산의 투자가치 분석", sectionRangeHint: "SECTION 01–03" },
      { id: "c1-11-06", partId: "p1-11", ordinal: 6, title: "Chapter 06 부동산 개발사업 사업타당성 평가", sectionRangeHint: "SECTION 01–02" },
    ],
  },
  {
    id: "p1-12", bookId: "book-1", ordinal: 12, title: "PART 12 리츠업무",
    chapters: [
      { id: "c1-12-01", partId: "p1-12", ordinal: 1, title: "Chapter 01 부동산 간접투자제도의 이해", sectionRangeHint: "SECTION 01–02" },
      { id: "c1-12-02", partId: "p1-12", ordinal: 2, title: "Chapter 02 부동산 투자회사법의 이해", sectionRangeHint: "SECTION 01–02" },
    ],
  },
]
