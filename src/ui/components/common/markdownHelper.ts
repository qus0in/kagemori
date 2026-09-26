// src/ui/components/common/markdownHelper.ts

export function sanitizeMarkdown(content: string): string {
  if (!content) return ''
  // Normalize Windows line endings and trim trailing whitespace
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
}
