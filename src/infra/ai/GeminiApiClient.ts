// src/infra/ai/GeminiApiClient.ts

export async function callGemini(
  fetchFn: typeof fetch,
  url: string,
  promptText: string,
  maxTokens: number
): Promise<string | null> {
  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: maxTokens },
    }),
  })

  if (!response.ok) return null

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
}
