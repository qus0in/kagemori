import type { BookCatalog } from "../../../domain/models/Catalog.ts"
import { b3p1 } from "./Book3Part1.ts"
import { b3p2 } from "./Book3Part2.ts"
import { b3p3to4 } from "./Book3Parts3to4.ts"

export const BOOK_3_CATALOG: BookCatalog = {
  id: "book-3",
  editionId: "edition-2026",
  volumeNo: 3,
  title: "제3권 직무윤리 및 법규",
  isbn13: "9788960507869",
  parts: [...b3p1, ...b3p2, ...b3p3to4],
}
