import type { DiagramResponseDto } from '../../../app/dto/StudyDto.ts'

export interface QuestionPostAnswerToolsProps {
  onRegenerateExplanation?: () => void
  isExplanationLoading?: boolean
  onRequestDiagram?: () => void
  isDiagramLoading?: boolean
  diagram?: DiagramResponseDto | null
  postAnswerError?: string | null
}

export function QuestionPostAnswerTools(p: QuestionPostAnswerToolsProps) {
  if (!p.onRegenerateExplanation && !p.onRequestDiagram) return null
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {p.onRegenerateExplanation && (
          <button type="button" className="btn btn-outline btn-sm gap-2" onClick={p.onRegenerateExplanation} disabled={p.isExplanationLoading}>
            {p.isExplanationLoading && <span className="loading loading-spinner loading-xs"></span>}
            {p.isExplanationLoading ? '다른 방식으로 설명하는 중…' : '해설 다시 받기'}
          </button>
        )}
        {p.onRequestDiagram && !p.diagram && (
          <button type="button" className="btn btn-outline btn-sm gap-2" onClick={p.onRequestDiagram} disabled={p.isDiagramLoading}>
            {p.isDiagramLoading && <span className="loading loading-spinner loading-xs"></span>}
            {p.isDiagramLoading ? '도식 그리는 중…' : '개념 도식 보기'}
          </button>
        )}
      </div>
      {p.postAnswerError && <p role="alert" className="text-xs text-error">{p.postAnswerError}</p>}
      {p.diagram && (
        <figure className="rounded-xl border border-base-300 bg-base-100 p-2">
          <img src={`data:${p.diagram.mimeType};base64,${p.diagram.data}`} alt="AI가 생성한 개념 도식" className="w-full h-auto rounded-lg" />
          <figcaption className="mt-1 text-xs text-base-content/60">AI 생성 도식 · 참고용이며 교재·해설을 우선하세요.</figcaption>
        </figure>
      )}
    </div>
  )
}
