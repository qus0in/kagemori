// src/infra/ai/GeminiDiagramAdapter.ts
import type { DiagramImage, DiagramPort } from '../../domain/ports/SemanticPorts.ts'
import type { GeminiModelOptions } from './GeminiQuestionAuthor.ts'
import { geminiUrl } from './ModelJson.ts'

/** gemini-3.1-flash-lite-image (Nano Banana 2 Lite): one 4:3 concept diagram at 1K. */
export class GeminiDiagramAdapter implements DiagramPort {
  readonly model: string
  private readonly apiKey: string
  private readonly fetch: typeof fetch

  constructor(options: GeminiModelOptions) {
    this.apiKey = options.apiKey
    this.model = options.model ?? 'gemini-3.1-flash-lite-image'
    this.fetch = options.fetchFn ?? globalThis.fetch
  }

  async generate(prompt: string): Promise<DiagramImage> {
    const response = await this.fetch(geminiUrl(this.model, this.apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:3' } },
      }),
      signal: AbortSignal.timeout(60_000),
    })
    if (!response.ok) throw new Error(`Diagram request failed: ${response.status}`)
    const data = await response.json() as {
      candidates?: { content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[]
    }
    const image = data.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData
    if (!image?.data || !image.mimeType?.startsWith('image/')) throw new Error('Diagram response had no image')
    return { mimeType: image.mimeType, data: image.data }
  }
}
