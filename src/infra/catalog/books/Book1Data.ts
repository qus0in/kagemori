import type { BookCatalog } from "../../../domain/models/Catalog.ts"
import { b1p1to3 } from "./Book1Parts1to3.ts"
import { b1p4to6 } from "./Book1Parts4to6.ts"
import { b1p7to9 } from "./Book1Parts7to9.ts"
import { b1p10to12 } from "./Book1Parts10to12.ts"

export const BOOK_1_CATALOG: BookCatalog = {
  id: "book-1",
  editionId: "edition-2026",
  volumeNo: 1,
  title: "제1권 금융상품 및 세제",
  isbn13: "9788960507845",
  parts: [...b1p1to3, ...b1p4to6, ...b1p7to9, ...b1p10to12],
}
