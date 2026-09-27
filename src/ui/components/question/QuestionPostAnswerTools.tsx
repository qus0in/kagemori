import type { DiagramMode, DiagramResponseDto } from '../../../app/dto/StudyDto.ts'
import { MarkdownView } from '../common/MarkdownView.tsx'
import { MermaidDiagram } from '../common/MermaidDiagram.tsx'

export interface QuestionPostAnswerToolsProps {
  onRegenerateExplanation?: () => void
  isExplanationLoading?: boolean
  onRequestDiagram?: (mode?: DiagramMode) => void
  isDiagramLoading?: boolean
  diagram?: DiagramResponseDto | null
  postAnswerError?: string | null
}

function DiagramBody({ diagram }: { diagram: DiagramResponseDto }) {
  if (diagram.kind === 'image' && diagram.imageUrl) {
    return <img src={diagram.imageUrl} alt="AI가 생성한 개념 도식" loading="lazy" className="w-full h-auto rounded-lg" />
  }
  if (diagram.kind === 'table' && diagram.markdown) return <MarkdownView content={diagram.markdown} />
  if (diagram.kind === 'mermaid' && diagram.code) return <MermaidDiagram code={diagram.code} />
  return null
}

export function QuestionPostAnswerTools(p: QuestionPostAnswerToolsProps) {
  if (!p.onRegenerateExplanation && !p.onRequestDiagram) return null
  const canAskImage = p.onRequestDiagram && p.diagram && p.diagram.kind !== 'image'
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {p.onRegenerateExplanation && (
          <button type="button" className="btn btn-outline btn-sm gap-2" onClick={() => p.onRegenerateExplanation?.()} disabled={p.isExplanationLoading}>
            {p.isExplanationLoading && <span className="loading loading-spinner loading-xs"></span>}
            {p.isExplanationLoading ? '다른 방식으로 설명하는 중…' : '해설 다시 받기'}
          </button>
        )}
        {p.onRequestDiagram && !p.diagram && (
          <button type="button" className="btn btn-outline btn-sm gap-2" onClick={() => p.onRequestDiagram?.()} disabled={p.isDiagramLoading}>
            {p.isDiagramLoading && <span className="loading loading-spinner loading-xs"></span>}
            {p.isDiagramLoading ? '도식 그리는 중…' : '개념 도식 보기'}
          </button>
        )}
        {canAskImage && (
          <button type="button" className="btn btn-ghost btn-sm gap-2" onClick={() => p.onRequestDiagram?.('image')} disabled={p.isDiagramLoading}>
            {p.isDiagramLoading && <span className="loading loading-spinner loading-xs"></span>}
            {p.isDiagramLoading ? '이미지 그리는 중…' : '이미지로 보기'}
          </button>
        )}
      </div>
      {p.postAnswerError && <p role="alert" className="text-xs text-error">{p.postAnswerError}</p>}
      {p.diagram && (
        <figure className="rounded-xl border border-base-300 bg-base-100 p-3 space-y-1">
          <DiagramBody diagram={p.diagram} />
          <figcaption className="text-xs text-base-content/60">
            {p.diagram.kind === 'image' ? 'AI 생성 이미지' : 'AI 작성 도식'} · 참고용이며 교재·해설을 우선하세요.
          </figcaption>
        </figure>
      )}
    </div>
  )
}
