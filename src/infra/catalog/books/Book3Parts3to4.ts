import type { BookPart } from "../../../domain/models/Catalog.ts"

export const b3p3to4: BookPart[] = [
  {
    id: "p3-03", bookId: "book-3", ordinal: 3, title: "PART 03 한국금융투자협회 규정",
    chapters: [
      { id: "c3-03-01", partId: "p3-03", ordinal: 1, title: "Chapter 01 금융투자회사의 영업 및 업무에 관한 규정", sectionRangeHint: "SECTION 01–14" },
      { id: "c3-03-02", partId: "p3-03", ordinal: 2, title: "Chapter 02 금융투자전문인력과 자격시험에 관한 규정", sectionRangeHint: "SECTION 01–04" },
      { id: "c3-03-03", partId: "p3-03", ordinal: 3, title: "Chapter 03 증권 인수업무 등에 관한 규정", sectionRangeHint: "SECTION 01–03" },
      { id: "c3-03-04", partId: "p3-03", ordinal: 4, title: "Chapter 04 금융투자회사의 약관운용에 관한 규정", sectionRangeHint: "SECTION 표기 없음" },
    ],
  },
  {
    id: "p3-04", bookId: "book-3", ordinal: 4, title: "PART 04 금융소비자 보호법",
    chapters: [
      { id: "c3-04-01", partId: "p3-04", ordinal: 1, title: "Chapter 01 금융소비자보호법 제정 배경", sectionRangeHint: "SECTION 01–02" },
      { id: "c3-04-02", partId: "p3-04", ordinal: 2, title: "Chapter 02 금융소비자보호법 개관", sectionRangeHint: "SECTION 01–07" },
      { id: "c3-04-03", partId: "p3-04", ordinal: 3, title: "Chapter 03 금융소비자보호법 주요내용", sectionRangeHint: "SECTION 01–06" },
    ],
  },
]
