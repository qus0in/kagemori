import type { BookCatalog } from "../../../domain/models/Catalog.ts"
import { b2p1to2 } from "./Book2Parts1to2.ts"
import { b2p3to4 } from "./Book2Parts3to4.ts"
import { b2p5to6 } from "./Book2Parts5to6.ts"

export const BOOK_2_CATALOG: BookCatalog = {
  id: "book-2",
  editionId: "edition-2026",
  volumeNo: 2,
  title: "제2권 투자운용 및 전략 Ⅱ 및 투자분석기법",
  isbn13: "9788960507852",
  parts: [...b2p1to2, ...b2p3to4, ...b2p5to6],
}
