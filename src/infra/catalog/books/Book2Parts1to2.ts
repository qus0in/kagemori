import type { BookPart } from "../../../domain/models/Catalog.ts"

export const b2p1to2: BookPart[] = [
  {
    id: "p2-01", bookId: "book-2", ordinal: 1, title: "PART 01 대안투자운용 및 투자전략",
    chapters: [
      { id: "c2-01-01", partId: "p2-01", ordinal: 1, title: "Chapter 01 대안투자상품", sectionRangeHint: "SECTION 01–02" },
      { id: "c2-01-02", partId: "p2-01", ordinal: 2, title: "Chapter 02 부동산 투자", sectionRangeHint: "SECTION 01–03" },
      { id: "c2-01-03", partId: "p2-01", ordinal: 3, title: "Chapter 03 PEF(Private Equity Fund)", sectionRangeHint: "SECTION 01–03" },
      { id: "c2-01-04", partId: "p2-01", ordinal: 4, title: "Chapter 04 헤지펀드", sectionRangeHint: "SECTION 01–07" },
      { id: "c2-01-05", partId: "p2-01", ordinal: 5, title: "Chapter 05 특별자산 펀드", sectionRangeHint: "SECTION 01–02" },
      { id: "c2-01-06", partId: "p2-01", ordinal: 6, title: "Chapter 06 Credit Structure", sectionRangeHint: "SECTION 01–03" },
    ],
  },
  {
    id: "p2-02", bookId: "book-2", ordinal: 2, title: "PART 02 해외 증권 투자운용 및 투자전략",
    chapters: [
      { id: "c2-02-01", partId: "p2-02", ordinal: 1, title: "Chapter 01 해외 투자에 대한 이론적 접근", sectionRangeHint: "SECTION 01–02" },
      { id: "c2-02-02", partId: "p2-02", ordinal: 2, title: "Chapter 02 국제 증권시장", sectionRangeHint: "SECTION 01–02" },
      { id: "c2-02-03", partId: "p2-02", ordinal: 3, title: "Chapter 03 해외 증권투자전략", sectionRangeHint: "SECTION 01–03" },
    ],
  },
]
