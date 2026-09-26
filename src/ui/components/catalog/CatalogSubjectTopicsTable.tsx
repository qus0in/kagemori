import { DICTIONARY } from '../../constants/dictionary.ts'
import type { ExamTopic } from '../../../domain/models/Catalog.ts'
import { CatalogTopicRow } from './CatalogTopicRow.tsx'

export interface CatalogSubjectTopicsTableProps {
  topics: ExamTopic[]
  subjectQuestionCount: number
}

export function CatalogSubjectTopicsTable({ topics, subjectQuestionCount }: CatalogSubjectTopicsTableProps) {
  const th = DICTIONARY.catalog.tableHeaders

  return (
    <div className="mt-4 overflow-x-auto max-w-full">
      <table className="table table-sm w-full">
        <thead>
          <tr className="bg-base-200/60 text-xs">
            <th className="w-12">{th.ordinal}</th>
            <th>{th.topicTitle}</th>
            <th className="text-right w-24">{th.questionCount}</th>
            <th className="w-36">{th.ratio}</th>
            <th className="text-right w-28">{th.mappedChapters}</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((top) => (
            <CatalogTopicRow
              key={top.id}
              top={top}
              total={subjectQuestionCount}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
