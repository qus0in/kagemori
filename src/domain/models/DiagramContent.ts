// src/domain/models/DiagramContent.ts

export type StructuredDiagram =
  | { readonly kind: 'mermaid'; readonly code: string }
  | { readonly kind: 'table'; readonly markdown: string }

/** Stored diagram: structured text rendered by the browser, or a pointer to an image in object storage. */
export type DiagramContent =
  | (StructuredDiagram & { readonly model: string })
  | { readonly kind: 'image'; readonly model: string; readonly imageKey: string }

export const MERMAID_TYPES = ['flowchart', 'graph', 'xychart-beta', 'quadrantChart', 'pie', 'mindmap', 'timeline'] as const
const MAX_LENGTH = 4000

function stripFence(text: string): string {
  return text.trim().replace(/^```[a-z-]*\s*\n?/i, '').replace(/\n?```\s*$/, '').trim()
}

/**
 * Accepts only allow-listed Mermaid diagram types without init directives or click handlers,
 * and GFM tables with a header separator. Returns null when the output should fall back.
 */
export function validateStructuredDiagram(input: StructuredDiagram): StructuredDiagram | null {
  if (input.kind === 'mermaid') {
    const code = stripFence(input.code ?? '')
    const firstWord = code.split(/\s+/)[0] ?? ''
    if (!code || code.length > MAX_LENGTH || !(MERMAID_TYPES as readonly string[]).includes(firstWord)) return null
    if (/%%\s*\{/.test(code) || /^\s*click\s/m.test(code) || /<\s*script|javascript:/i.test(code)) return null
    return { kind: 'mermaid', code }
  }
  const markdown = stripFence(input.markdown ?? '')
  const lines = markdown.split('\n').map((line) => line.trim())
  const hasTable = lines.some((line, i) => line.startsWith('|') && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(lines[i + 1] ?? ''))
  if (!markdown || markdown.length > MAX_LENGTH || !hasTable || /<\s*script|javascript:/i.test(markdown)) return null
  return { kind: 'table', markdown }
}

export function diagramImageKey(model: string, questionId: string, version: number): string {
  return `diagrams/${model}/${questionId}/v${version}`
}
