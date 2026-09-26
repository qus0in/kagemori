import type { BookCatalog } from "../../../domain/models/Catalog.ts"
import { b4p1 } from "./Book4Part1.ts"
import { b4p2to3 } from "./Book4Parts2to3.ts"
import { b4p4 } from "./Book4Part4.ts"

export const BOOK_4_CATALOG: BookCatalog = {
  id: "book-4",
  editionId: "edition-2026",
  volumeNo: 4,
  title: "제4권 투자운용 및 전략 Ⅰ",
  isbn13: "9788960507876",
  parts: [...b4p1, ...b4p2to3, ...b4p4],
}
