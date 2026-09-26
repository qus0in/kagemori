import type { BookPart } from "../../../domain/models/Catalog.ts"

export const b3p1: BookPart[] = [
  {
    id: "p3-01", bookId: "book-3", ordinal: 1, title: "PART 01 직무윤리",
    chapters: [
      { id: "c3-01-01", partId: "p3-01", ordinal: 1, title: "Chapter 01 직무윤리 일반", sectionRangeHint: "SECTION 01–02" },
      { id: "c3-01-02", partId: "p3-01", ordinal: 2, title: "Chapter 02 금융투자업 직무윤리", sectionRangeHint: "SECTION 01–04" },
      { id: "c3-01-03", partId: "p3-01", ordinal: 3, title: "Chapter 03 직무윤리의 준수절차 및 위반 시의 제재", sectionRangeHint: "SECTION 01–02" },
    ],
  },
]
