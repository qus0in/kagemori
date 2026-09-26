import type { BookCatalog, PartCatalog, ChapterCatalog } from '../../domain/models/Catalog.ts'
import { STATIC_BOOKS_CATALOG } from '../catalog/CatalogStaticData.ts'
import type { D1DatabaseLike, DbBookRow, DbPartRow, DbChapterRow } from './D1CatalogTypes.ts'

export async function fetchD1Books(db?: D1DatabaseLike): Promise<BookCatalog[]> {
  if (!db) return STATIC_BOOKS_CATALOG

  try {
    const booksQuery = await db.prepare('SELECT * FROM books ORDER BY volume_no ASC').all<DbBookRow>()
    const partsQuery = await db.prepare('SELECT * FROM parts ORDER BY book_id, ordinal ASC').all<DbPartRow>()
    const chaptersQuery = await db.prepare('SELECT * FROM chapters ORDER BY part_id, ordinal ASC').all<DbChapterRow>()

    if (!booksQuery.results || booksQuery.results.length === 0) {
      return STATIC_BOOKS_CATALOG
    }

    const chaptersByPart = new Map<string, ChapterCatalog[]>()
    for (const ch of chaptersQuery.results) {
      const list = chaptersByPart.get(ch.part_id) ?? []
      list.push({
        id: ch.id,
        partId: ch.part_id,
        ordinal: ch.ordinal,
        title: ch.title,
        sectionRangeHint: ch.section_range_hint ?? undefined,
      })
      chaptersByPart.set(ch.part_id, list)
    }

    const partsByBook = new Map<string, PartCatalog[]>()
    for (const p of partsQuery.results) {
      const list = partsByBook.get(p.book_id) ?? []
      list.push({
        id: p.id,
        bookId: p.book_id,
        ordinal: p.ordinal,
        title: p.title,
        chapters: chaptersByPart.get(p.id) ?? [],
      })
      partsByBook.set(p.book_id, list)
    }

    return booksQuery.results.map((b) => ({
      id: b.id,
      editionId: b.edition_id,
      volumeNo: b.volume_no,
      title: b.title,
      isbn13: b.isbn13,
      parts: partsByBook.get(b.id) ?? [],
    }))
  } catch (error) {
    console.warn('Failed to fetch books from D1, falling back to static:', error)
    return STATIC_BOOKS_CATALOG
  }
}
