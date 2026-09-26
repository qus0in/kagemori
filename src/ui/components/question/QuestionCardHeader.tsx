import type { PublicQuestionDto } from '../../../app/dto/StudyDto.ts'

export interface QuestionCardHeaderProps {
  question: PublicQuestionDto
  questionNumber: number
  totalQuestions: number
}

export function QuestionCardHeader({ question, questionNumber, totalQuestions }: QuestionCardHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-3">
      <div className="flex items-center gap-2">
        <span className="badge badge-primary font-bold text-xs">
          Q{questionNumber} / {totalQuestions}
        </span>
        <span className="badge badge-outline text-xs text-base-content/80">
          {question.topicId}
        </span>
        {question.isAiGenerated && (
          <span className="badge badge-accent badge-outline text-xs" title="AI가 출제하고 별도 AI 검수를 통과한 문항이에요">
            AI 출제·검수
          </span>
        )}
        {question.type && (
          <span className="badge badge-ghost text-xs">
            {question.type}
          </span>
        )}
      </div>
      {question.difficulty && (
        <span className="text-xs text-base-content/60">
          난이도: {question.difficulty}
        </span>
      )}
    </div>
  )
}
