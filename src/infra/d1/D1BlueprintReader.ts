import type { ExamBlueprint } from '../../domain/models/Catalog.ts'
import { STATIC_EXAM_BLUEPRINT } from '../catalog/CatalogStaticData.ts'
import type { D1DatabaseLike, DbSubjectRow, DbTopicRow, DbTopicChapterRow } from './D1CatalogTypes.ts'
import { assembleD1Blueprint } from './D1BlueprintMapper.ts'

export async function fetchD1Blueprint(db?: D1DatabaseLike): Promise<ExamBlueprint> {
  if (!db) return STATIC_EXAM_BLUEPRINT

  try {
    const bpRow = await db.prepare('SELECT * FROM exam_blueprints LIMIT 1').first<{
      id: string
      exam_code: string
      effective_from: string
      verification_status: 'PROVISIONAL' | 'VERIFIED'
    }>()

    if (!bpRow) return STATIC_EXAM_BLUEPRINT

    const subjects = await db.prepare('SELECT * FROM exam_subjects WHERE blueprint_id = ? ORDER BY ordinal ASC')
      .bind(bpRow.id)
      .all<DbSubjectRow>()

    const topics = await db.prepare('SELECT * FROM exam_topics ORDER BY subject_id, ordinal ASC').all<DbTopicRow>()
    const mappings = await db.prepare('SELECT * FROM topic_chapters').all<DbTopicChapterRow>()

    return assembleD1Blueprint({
      bpRow,
      subjects: subjects.results,
      topics: topics.results,
      mappings: mappings.results,
    })
  } catch (error) {
    console.warn('Failed to fetch exam blueprint from D1, falling back to static:', error)
    return STATIC_EXAM_BLUEPRINT
  }
}
