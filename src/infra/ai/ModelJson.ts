// src/infra/ai/ModelJson.ts

/** Extracts `{ [key]: [...] }` from model text, tolerating code fences or prose (Gemma has no JSON mode). */
export function parseModelJsonList(text: string | null, key: string): Record<string, unknown>[] {
  if (!text) throw new Error('Model returned no content')
  const body = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    const start = body.indexOf('{')
    const end = body.lastIndexOf('}')
    if (start < 0 || end <= start) throw new Error('Model response is not JSON')
    parsed = JSON.parse(body.slice(start, end + 1))
  }
  const list = (parsed as Record<string, unknown> | null)?.[key]
  if (!Array.isArray(list)) throw new Error(`Model response missing ${key}`)
  return list.map((item) => (item && typeof item === 'object' ? item as Record<string, unknown> : {}))
}

export const asText = (value: unknown) => (typeof value === 'string' ? value : '')

export function geminiUrl(model: string, apiKey: string, method = 'generateContent'): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}?key=${apiKey}`
}
