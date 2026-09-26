import type { ExamSubject } from '../../../domain/models/Catalog.ts'
import { CatalogSubjectTopicsTable } from './CatalogSubjectTopicsTable.tsx'

export interface CatalogSubjectCardProps {
  subject: ExamSubject
}

export function CatalogSubjectCard({ subject }: CatalogSubjectCardProps) {
  const subjectPercentage = Math.round((subject.questionCount / 100) * 100)

  return (
    <div className="card bg-base-100 shadow border border-base-300 p-5 min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-base-200 pb-3 min-w-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-base-content break-keep">{subject.title}</h3>
          <p className="text-xs text-base-content/60 mt-0.5 break-keep">
            총 {subject.questionCount}문항 ({subjectPercentage}%) • 과락 최저 정답선: {subject.minimumCorrect}문항
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="badge badge-primary font-bold text-xs">{subject.questionCount}문항</span>
          <span className="badge badge-error badge-outline text-xs">
            과락기준: {subject.minimumCorrect}개
          </span>
        </div>
      </div>

      <CatalogSubjectTopicsTable
        topics={subject.topics}
        subjectQuestionCount={subject.questionCount}
      />
    </div>
  )
}
