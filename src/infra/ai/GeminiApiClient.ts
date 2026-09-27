// src/infra/ai/GeminiApiClient.ts

export interface GeminiCallOptions {
  /** Ask for a JSON response body (responseMimeType). */
  readonly json?: boolean
  readonly temperature?: number
  readonly timeoutMs?: number
}

export async function callGemini(
  fetchFn: typeof fetch,
  url: string,
  promptText: string,
  maxTokens: number,
  options: GeminiCallOptions = {},
): Promise<string | null> {
  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: maxTokens,
        ...(options.json ? { responseMimeType: 'application/json' } : {}),
      },
    }),
    ...(options.timeoutMs ? { signal: AbortSignal.timeout(options.timeoutMs) } : {}),
  })

  if (!response.ok) return null

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>
  }
  // Thinking models may prepend thought parts; keep only the answer text.
  const parts = data.candidates?.[0]?.content?.parts ?? []
  return parts.filter((part) => !part.thought).map((part) => part.text ?? '').join('').trim() || null
}
