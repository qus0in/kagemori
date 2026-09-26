// src/infra/catalog/CatalogStaticData.ts
import type { BookCatalog } from '../../domain/models/Catalog.ts'
import { BOOK_1_CATALOG } from './books/Book1Data.ts'
import { BOOK_2_CATALOG } from './books/Book2Data.ts'
import { BOOK_3_CATALOG } from './books/Book3Data.ts'
import { BOOK_4_CATALOG } from './books/Book4Data.ts'
import { BOOK_5_CATALOG } from './books/Book5Data.ts'
import { STATIC_EXAM_BLUEPRINT } from './blueprint/BlueprintData.ts'

export const STATIC_BOOKS_CATALOG: BookCatalog[] = [
  BOOK_1_CATALOG,
  BOOK_2_CATALOG,
  BOOK_3_CATALOG,
  BOOK_4_CATALOG,
  BOOK_5_CATALOG,
]

export { STATIC_EXAM_BLUEPRINT }
