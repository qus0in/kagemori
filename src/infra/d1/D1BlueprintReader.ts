import type { ExamBlueprint } from '../../domain/models/Catalog.ts'
import { STATIC_EXAM_BLUEPRINT } from '../catalog/CatalogStaticData.ts'
import type { D1DatabaseLike, DbSubjectRow, DbTopicRow, DbTopicChapterRow } from './D1CatalogTypes.ts'
import { assembleD1Blueprint } from './D1BlueprintMapper.ts'

export async function fetchD1Blueprint(db?: D1DatabaseLike): Promise<ExamBlueprint> {
  if (!db) return STATIC_EXAM_BLUEPRINT

  const bpRow = await db.prepare("SELECT * FROM exam_blueprints WHERE id = 'bp-2026' LIMIT 1").first<{
    id: string
    exam_code: string
    effective_from: string
    verification_status: 'PROVISIONAL' | 'VERIFIED'
  }>()

  if (!bpRow) throw new Error('D1 blueprint is not initialized')

  const [subjects, topics, mappings] = await db.batch([
    db.prepare('SELECT * FROM exam_subjects WHERE blueprint_id = ? ORDER BY ordinal ASC').bind(bpRow.id),
    db.prepare(`SELECT t.* FROM exam_topics t JOIN exam_subjects s ON s.id = t.subject_id
      WHERE s.blueprint_id = ? ORDER BY t.subject_id, t.ordinal`).bind(bpRow.id),
    db.prepare(`SELECT m.* FROM topic_chapters m JOIN exam_topics t ON t.id = m.topic_id
      JOIN exam_subjects s ON s.id = t.subject_id WHERE s.blueprint_id = ?`).bind(bpRow.id),
  ])
  if ([subjects, topics, mappings].some((query) => !query.success) || !subjects.results.length || !topics.results.length) {
    throw new Error('D1 blueprint data unavailable')
  }

  return assembleD1Blueprint({
    bpRow,
    subjects: subjects.results as unknown as DbSubjectRow[],
    topics: topics.results as unknown as DbTopicRow[],
    mappings: mappings.results as unknown as DbTopicChapterRow[],
  })
}
