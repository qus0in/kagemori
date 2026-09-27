// src/ui/components/common/MermaidDiagram.tsx
import { useEffect, useId, useState } from 'react'

export interface MermaidDiagramProps {
  code: string
  onError?: () => void
}

/** Lazy-loads Mermaid (strict security) only when a diagram is shown. */
export function MermaidDiagram({ code, onError }: MermaidDiagramProps) {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const [svg, setSvg] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    setSvg(null)
    setFailed(false)
    import('mermaid').then(async ({ default: mermaid }) => {
      const dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: dark ? 'dark' : 'neutral' })
      const { svg: rendered } = await mermaid.render(id, code)
      if (active) setSvg(rendered)
    }).catch(() => {
      if (!active) return
      setFailed(true)
      onError?.()
    })
    return () => { active = false }
  }, [code, id, onError])

  if (failed) return <p role="alert" className="text-xs text-error">도식을 그리지 못했어요. 이미지로 다시 그려 보세요.</p>
  if (!svg) return <span className="loading loading-dots loading-sm text-primary" aria-label="도식을 그리는 중" />
  // Mermaid's strict mode sanitises labels; the code comes from our validated server output.
  return <div className="overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
}
