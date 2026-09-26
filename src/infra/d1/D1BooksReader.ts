import type { BookCatalog, PartCatalog, ChapterCatalog } from '../../domain/models/Catalog.ts'
import { STATIC_BOOKS_CATALOG } from '../catalog/CatalogStaticData.ts'
import type { D1DatabaseLike, DbBookRow, DbPartRow, DbChapterRow } from './D1CatalogTypes.ts'

export async function fetchD1Books(db?: D1DatabaseLike): Promise<BookCatalog[]> {
  if (!db) return STATIC_BOOKS_CATALOG

  const [booksQuery, partsQuery, chaptersQuery] = await db.batch([
    db.prepare('SELECT * FROM books ORDER BY volume_no ASC'),
    db.prepare('SELECT * FROM parts ORDER BY book_id, ordinal ASC'),
    db.prepare('SELECT * FROM chapters ORDER BY part_id, ordinal ASC'),
  ])
  if ([booksQuery, partsQuery, chaptersQuery].some((query) => !query.success)) throw new Error('D1 batch failed')

  if (!booksQuery.results || booksQuery.results.length === 0) {
    throw new Error('D1 catalog is not initialized')
  }

  const chaptersByPart = new Map<string, ChapterCatalog[]>()
  for (const ch of chaptersQuery.results as unknown as DbChapterRow[]) {
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
  for (const p of partsQuery.results as unknown as DbPartRow[]) {
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

  return (booksQuery.results as unknown as DbBookRow[]).map((b) => ({
    id: b.id,
    editionId: b.edition_id,
    volumeNo: b.volume_no,
    title: b.title,
    isbn13: b.isbn13,
    parts: partsByBook.get(b.id) ?? [],
  }))
}
