// src/ui/components/common/remarkBrAsBreak.ts

interface ParentNode { children?: unknown[] }
interface HtmlNode { type?: unknown; value?: unknown }

const BR_TAG = /^<br\s*\/?\s*>$/i
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isBrHtmlNode = (node: unknown): boolean => {
  if (!isObject(node)) return false
  const { type, value } = node as HtmlNode
  return type === 'html' && typeof value === 'string' && BR_TAG.test(value.trim())
}

/**
 * react-markdown escapes raw HTML by default, so a model-emitted `<br>` renders as the
 * literal text `<br>`. Replace exactly those html nodes with real Markdown break nodes,
 * keeping arbitrary raw HTML (scripts, images, event handlers) disabled.
 */
export function remarkBrAsBreak() {
  const walk = (node: unknown): void => {
    if (!isObject(node)) return
    const children = (node as ParentNode).children
    if (!Array.isArray(children)) return
    for (let i = 0; i < children.length; i++) {
      if (isBrHtmlNode(children[i])) children[i] = { type: 'break' }
      else walk(children[i])
    }
  }
  return walk
}
