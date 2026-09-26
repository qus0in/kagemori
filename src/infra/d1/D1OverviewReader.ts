import type { CatalogOverview } from '../../domain/ports/CatalogRepository.ts'
import type { D1DatabaseLike } from './D1CatalogTypes.ts'
import { getFallbackOverview } from './D1CatalogFallback.ts'
import { fetchD1Blueprint } from './D1BlueprintReader.ts'
import { OVERVIEW_BOOKS_SQL } from './d1Queries.ts'

interface OverviewBookDbRow {
  id: string
  volume_no: number
  title: string
  isbn13: string
  partCount: number
  chapterCount: number
}

export async function fetchD1Overview(db?: D1DatabaseLike): Promise<CatalogOverview> {
  if (!db) return getFallbackOverview()

  const res = await db.prepare(OVERVIEW_BOOKS_SQL).all<OverviewBookDbRow>()
  if (!res.success || !res.results?.length) throw new Error('D1 catalog is not initialized')

  const totalParts = res.results.reduce((acc, b) => acc + Number(b.partCount), 0)
  const totalChapters = res.results.reduce((acc, b) => acc + Number(b.chapterCount), 0)
  const bp = await fetchD1Blueprint(db)
  const totalQuestions = bp.subjects.reduce((sum, s) => sum + s.questionCount, 0)
  const topicsCount = bp.subjects.reduce((sum, s) => sum + s.topics.length, 0)

  return {
    books: res.results.map((r) => ({
      id: r.id,
      volumeNo: r.volume_no,
      title: r.title,
      isbn13: r.isbn13,
      partCount: Number(r.partCount),
      chapterCount: Number(r.chapterCount),
    })),
    totalParts,
    totalChapters,
    blueprintSummary: {
      examCode: bp.examCode,
      totalQuestions,
      subjectsCount: bp.subjects.length,
      topicsCount,
    },
  }
}
