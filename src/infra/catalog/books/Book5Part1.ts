import type { BookPart } from "../../../domain/models/Catalog.ts"

export const b5p1: BookPart[] = [
  {
    id: "p5-01", bookId: "book-5", ordinal: 1, title: "PART 01 거시경제분석",
    chapters: [
      { id: "c5-01-01", partId: "p5-01", ordinal: 1, title: "Chapter 01 경제모형과 경제정책의 분석: IS-LM 모형", sectionRangeHint: "SECTION 01–07" },
      { id: "c5-01-02", partId: "p5-01", ordinal: 2, title: "Chapter 02 이자율의 결정과 기간구조", sectionRangeHint: "SECTION 01–04" },
      { id: "c5-01-03", partId: "p5-01", ordinal: 3, title: "Chapter 03 이자율의 변동요인 분석", sectionRangeHint: "SECTION 01–03" },
      { id: "c5-01-04", partId: "p5-01", ordinal: 4, title: "Chapter 04 경기변동과 경기예측", sectionRangeHint: "SECTION 01–04" },
    ],
  },
]
