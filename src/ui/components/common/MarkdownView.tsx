// src/ui/components/common/MarkdownView.tsx
import Markdown from 'react-markdown'
import remarkCjkFriendly from 'remark-cjk-friendly'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { sanitizeMarkdown } from './markdownHelper.ts'
import { remarkBrAsBreak } from './remarkBrAsBreak.ts'

export interface MarkdownViewProps {
  content?: string
  className?: string
}

export function MarkdownView({ content = '', className = '' }: MarkdownViewProps) {
  const sanitized = sanitizeMarkdown(content)
  if (!sanitized) return null

  return (
    <div
      className={`prose prose-sm max-w-none text-base-content/90 leading-relaxed
        [&>h3]:text-sm [&>h3]:font-bold [&>h3]:mt-3 [&>h3]:mb-1.5 [&>h3]:text-base-content
        [&>h4]:text-xs [&>h4]:font-semibold [&>h4]:mt-2 [&>h4]:mb-1 [&>h4]:text-base-content/90
        [&>ul]:my-1.5 [&>ul]:ps-5 [&>ul]:list-disc
        [&>ol]:my-1.5 [&>ol]:ps-5 [&>ol]:list-decimal
        [&>li]:my-0.5 [&>li]:text-xs sm:[&>li]:text-sm
        [&>p]:my-1.5 [&>p]:text-xs sm:[&>p]:text-sm
        [&_strong]:font-bold [&_strong]:text-base-content
        [&>hr]:my-2.5 [&>hr]:border-base-300
        [&_code]:bg-base-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
        [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:my-2
        [&_th]:border [&_th]:border-base-300 [&_th]:bg-base-200 [&_th]:px-2 [&_th]:py-1 [&_th]:whitespace-nowrap
        [&_td]:border [&_td]:border-base-300 [&_td]:px-2 [&_td]:py-1 [&_td]:align-top
        [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden
        ${className}`}
    >
      <Markdown remarkPlugins={[remarkCjkFriendly, remarkGfm, remarkMath, remarkBrAsBreak]} rehypePlugins={[rehypeKatex]}
        components={{ table: ({ node: _node, ...props }) => <div className="overflow-x-auto"><table {...props} /></div> }}>
        {sanitized}
      </Markdown>
    </div>
  )
}
