import type { BookPart } from "../../../domain/models/Catalog.ts"

export const b4p4: BookPart[] = [
  {
    id: "p4-04", bookId: "book-4", ordinal: 4, title: "PART 04 투자운용 결과분석",
    chapters: [
      { id: "c4-04-01", partId: "p4-04", ordinal: 1, title: "Chapter 01 서론", sectionRangeHint: "SECTION 01–04" },
      { id: "c4-04-02", partId: "p4-04", ordinal: 2, title: "Chapter 02 성과평가 기초사항", sectionRangeHint: "SECTION 01–03" },
      { id: "c4-04-03", partId: "p4-04", ordinal: 3, title: "Chapter 03 기준 지표", sectionRangeHint: "SECTION 01–06" },
      { id: "c4-04-04", partId: "p4-04", ordinal: 4, title: "Chapter 04 위험조정 성과지표", sectionRangeHint: "SECTION 01–07" },
      { id: "c4-04-05", partId: "p4-04", ordinal: 5, title: "Chapter 05 성과 특성 분석", sectionRangeHint: "SECTION 01–07" },
      { id: "c4-04-06", partId: "p4-04", ordinal: 6, title: "Chapter 06 성과 발표 방법", sectionRangeHint: "SECTION 01–03" },
    ],
  },
]
