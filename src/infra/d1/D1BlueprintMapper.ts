import type { ExamBlueprint } from '../../domain/models/Catalog.ts'
import type { DbSubjectRow, DbTopicRow, DbTopicChapterRow } from './D1CatalogTypes.ts'

export interface D1BlueprintRawData {
  bpRow: {
    id: string
    exam_code: string
    effective_from: string
    verification_status: 'PROVISIONAL' | 'VERIFIED'
  }
  subjects: DbSubjectRow[]
  topics: DbTopicRow[]
  mappings: DbTopicChapterRow[]
}

export function assembleD1Blueprint(raw: D1BlueprintRawData): ExamBlueprint {
  const mappingsByTopic = new Map<string, string[]>()
  for (const m of raw.mappings) {
    const list = mappingsByTopic.get(m.topic_id) ?? []
    list.push(m.chapter_id)
    mappingsByTopic.set(m.topic_id, list)
  }

  const topicsBySubject = new Map<string, DbTopicRow[]>()
  for (const t of raw.topics) {
    const list = topicsBySubject.get(t.subject_id) ?? []
    list.push(t)
    topicsBySubject.set(t.subject_id, list)
  }

  return {
    id: raw.bpRow.id,
    examCode: raw.bpRow.exam_code,
    effectiveFrom: raw.bpRow.effective_from,
    verificationStatus: raw.bpRow.verification_status,
    subjects: raw.subjects.map((s) => ({
      id: s.id,
      blueprintId: s.blueprint_id,
      ordinal: s.ordinal,
      title: s.title,
      questionCount: s.question_count,
      minimumCorrect: s.minimum_correct,
      topics: (topicsBySubject.get(s.id) ?? []).map((t) => ({
        id: t.id,
        subjectId: t.subject_id,
        ordinal: t.ordinal,
        title: t.title,
        questionCount: t.question_count,
        mappedChapterIds: mappingsByTopic.get(t.id) ?? [],
      })),
    })),
  }
}
