import type { BookCatalog } from "../../../domain/models/Catalog.ts"
import { b5p1 } from "./Book5Part1.ts"
import { b5p2 } from "./Book5Part2.ts"

export const BOOK_5_CATALOG: BookCatalog = {
  id: "book-5",
  editionId: "edition-2026",
  volumeNo: 5,
  title: "제5권 거시경제 및 분산투자기법",
  isbn13: "9788960507883",
  parts: [...b5p1, ...b5p2],
}
