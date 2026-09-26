import type { BookPart } from '../../../domain/models/Catalog.ts'
import { b3p2Chapters1to8 } from './Book3Part2Chapters1to8.ts'
import { b3p2Chapters9to17 } from './Book3Part2Chapters9to17.ts'

export const b3p2: BookPart[] = [
  {
    id: 'p3-02',
    bookId: 'book-3',
    ordinal: 2,
    title: 'PART 02 자본시장과 금융투자업에 관한 법률/금융위원회규정',
    chapters: [...b3p2Chapters1to8, ...b3p2Chapters9to17],
  },
]
