import type { BookPart } from "../../../domain/models/Catalog.ts"

export const b1p1to3: BookPart[] = [
  {
    id: "p1-01", bookId: "book-1", ordinal: 1, title: "PART 01 금융투자세제",
    chapters: [
      { id: "c1-01-01", partId: "p1-01", ordinal: 1, title: "Chapter 01 국세기본법", sectionRangeHint: "SECTION 01–06" },
      { id: "c1-01-02", partId: "p1-01", ordinal: 2, title: "Chapter 02 소득세법", sectionRangeHint: "SECTION 01–07" },
      { id: "c1-01-03", partId: "p1-01", ordinal: 3, title: "Chapter 03 이자소득, 배당소득 및 양도소득", sectionRangeHint: "SECTION 01–04" },
      { id: "c1-01-04", partId: "p1-01", ordinal: 4, title: "Chapter 04 증권거래세법", sectionRangeHint: "SECTION 01–02" },
      { id: "c1-01-05", partId: "p1-01", ordinal: 5, title: "Chapter 05 기타 금융세제", sectionRangeHint: "SECTION 01–01" },
    ],
  },
  {
    id: "p1-02", bookId: "book-1", ordinal: 2, title: "PART 02 절세전략",
    chapters: [
      { id: "c1-02-01", partId: "p1-02", ordinal: 1, title: "Chapter 01 세무전략 : 금융자산 TAX-PLANNING", sectionRangeHint: "SECTION 01–07" },
    ],
  },
  {
    id: "p1-03", bookId: "book-1", ordinal: 3, title: "PART 03 금융상품개론",
    chapters: [
      { id: "c1-03-01", partId: "p1-03", ordinal: 1, title: "Chapter 01 금융회사의 종류", sectionRangeHint: "SECTION 01–02" },
      { id: "c1-03-02", partId: "p1-03", ordinal: 2, title: "Chapter 02 금융상품의 개요", sectionRangeHint: "SECTION 01–02" },
    ],
  },
]
