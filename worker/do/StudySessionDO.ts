// worker/do/StudySessionDO.ts
import type { PracticeSessionProps } from '../../src/domain/models/PracticeSessionTypes.ts'

export interface DurableObjectState {
  storage: {
    get<T>(key: string): Promise<T | undefined>
    put<T>(key: string, value: T): Promise<void>
    delete(key: string): Promise<boolean>
  }
}

export class StudySessionDO {
  private state: DurableObjectState
  private cachedSession: PracticeSessionProps | null = null

  constructor(state: DurableObjectState) {
    this.state = state
  }

  async getSession(): Promise<PracticeSessionProps | null> {
    if (this.cachedSession) {
      return this.cachedSession
    }
    const session = await this.state.storage.get<PracticeSessionProps>('session')
    this.cachedSession = session ?? null
    return this.cachedSession
  }

  async saveSession(props: PracticeSessionProps): Promise<void> {
    this.cachedSession = props
    await this.state.storage.put('session', props)
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'GET' && url.pathname === '/session') {
      const session = await this.getSession()
      if (!session) {
        return new Response(JSON.stringify({ error: 'Session not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify(session), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (request.method === 'POST' && url.pathname === '/session') {
      const body = (await request.json()) as PracticeSessionProps
      await this.saveSession(body)
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('Not Found', { status: 404 })
  }
}
