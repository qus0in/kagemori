import type { BookPart } from "../../../domain/models/Catalog.ts"

export const b1p4to6: BookPart[] = [
  {
    id: "p1-04", bookId: "book-1", ordinal: 4, title: "PART 04 예금 및 신탁상품",
    chapters: [
      { id: "c1-04-01", partId: "p1-04", ordinal: 1, title: "Chapter 01 예금의 구분", sectionRangeHint: "SECTION 01–02" },
      { id: "c1-04-02", partId: "p1-04", ordinal: 2, title: "Chapter 02 예금의 종류", sectionRangeHint: "SECTION 01–03" },
      { id: "c1-04-03", partId: "p1-04", ordinal: 3, title: "Chapter 03 신탁상품의 개념과 특징", sectionRangeHint: "SECTION 01–02" },
      { id: "c1-04-04", partId: "p1-04", ordinal: 4, title: "Chapter 04 신탁상품의 종류", sectionRangeHint: "SECTION 01–02" },
    ],
  },
  {
    id: "p1-05", bookId: "book-1", ordinal: 5, title: "PART 05 보장성 금융상품",
    chapters: [
      { id: "c1-05-01", partId: "p1-05", ordinal: 1, title: "Chapter 01 생명보험상품", sectionRangeHint: "SECTION 01–02" },
      { id: "c1-05-02", partId: "p1-05", ordinal: 2, title: "Chapter 02 손해보험상품", sectionRangeHint: "SECTION 01–02" },
    ],
  },
  {
    id: "p1-06", bookId: "book-1", ordinal: 6, title: "PART 06 투자성 금융상품",
    chapters: [
      { id: "c1-06-01", partId: "p1-06", ordinal: 1, title: "Chapter 01 금융투자상품의 개념 및 종류", sectionRangeHint: "SECTION 01–02" },
      { id: "c1-06-02", partId: "p1-06", ordinal: 2, title: "Chapter 02 펀드상품", sectionRangeHint: "SECTION 01–05" },
      { id: "c1-06-03", partId: "p1-06", ordinal: 3, title: "Chapter 03 기타 금융투자상품", sectionRangeHint: "SECTION 01–04" },
    ],
  },
]
