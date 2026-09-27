import { useEffect, useRef, useState } from 'react'
import { MarkdownView } from '../common/MarkdownView.tsx'

type Message = { role: 'user' | 'assistant'; text: string; evidence?: { id: string; question: string; topic: string; answeredAt: string; isCorrect: boolean; hintUsed: boolean }[] }

export function StudyChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const input = useRef<HTMLTextAreaElement>(null)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { if (open) input.current?.focus() }, [open])
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])

  async function send(text = draft) {
    const question = text.trim()
    if (!question || busy) return
    setDraft(''); setError(''); setBusy(true)
    const next = [...messages, { role: 'user' as const, text: question }]
    setMessages(next)
    try {
      const response = await fetch('/api/study/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: next.slice(-6) }) })
      const data = await response.json() as { answer?: string; error?: string; evidence?: Message['evidence'] }
      if (!response.ok) throw new Error(data.error ?? '질문을 처리하지 못했어요.')
      setMessages((current) => [...current, { role: 'assistant', text: data.answer ?? '', evidence: data.evidence }])
    } catch (cause) { setError(cause instanceof Error ? cause.message : '질문을 처리하지 못했어요.') }
    finally { setBusy(false) }
  }

  return <>
    <button className="btn btn-primary fixed bottom-5 right-5 z-40 rounded-full shadow-lg" aria-haspopup="dialog" aria-expanded={open}
      onClick={() => setOpen(true)}>학습 질문</button>
    {open && <div role="dialog" aria-modal="true" aria-label="학습 질문" className="fixed inset-0 z-50 flex justify-end bg-black/30" onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }}>
      <section className="flex h-full w-full max-w-lg flex-col bg-base-100 shadow-xl">
        <header className="flex items-center justify-between border-b border-base-300 p-4"><div><h2 className="font-bold">학습 질문</h2><p className="text-xs opacity-60">누적 풀이 기록과 연결 개념으로 답해요.</p></div>
          <div className="flex gap-2"><button className="btn btn-ghost btn-sm" onClick={() => { setMessages([]); setError('') }}>새 대화</button><button className="btn btn-ghost btn-sm" aria-label="닫기" onClick={() => setOpen(false)}>닫기</button></div></header>
        <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
          {!messages.length && <div className="space-y-2"><p className="text-sm opacity-70">대화를 닫으면 유지되며, 새로고침하면 초기화됩니다.</p>
            {['최근 오답에서 반복되는 개념을 정리해 줘', '힌트 후 맞힌 문제는 무엇을 복습해야 해?', '이전에 틀린 문제의 핵심 근거를 설명해 줘'].map((q) => <button key={q} className="btn btn-outline btn-sm mr-2" onClick={() => void send(q)}>{q}</button>)}</div>}
          {messages.map((message, index) => <article key={index} className={`rounded-xl p-3 ${message.role === 'user' ? 'ml-8 bg-primary/10' : 'mr-4 bg-base-200'}`}>
            <MarkdownView content={message.text}/>{message.evidence?.map((item) => <details key={item.id} className="mt-3 border-t border-base-300 pt-2 text-xs"><summary>근거 · {item.topic} · {new Date(item.answeredAt).toLocaleDateString('ko-KR')}</summary><p className="mt-1">{item.question}</p><p>{item.isCorrect ? '정답 제출' : '오답'}{item.hintUsed ? ' · 힌트 사용' : ''}</p></details>)}</article>)}
          {busy && <p className="text-sm opacity-60">기록을 확인하고 답변을 검토하고 있어요…</p>}{error && <div className="alert alert-error text-sm">{error}<button className="btn btn-xs" onClick={() => void send(messages.at(-1)?.text ?? '')}>다시 시도</button></div>}<div ref={end}/>
        </div>
        <form className="flex gap-2 border-t border-base-300 p-3" onSubmit={(event) => { event.preventDefault(); void send() }}><textarea ref={input} className="textarea textarea-bordered min-h-12 flex-1 resize-none" value={draft} maxLength={2000} placeholder="풀이 기록에 대해 질문하세요" onChange={(event) => setDraft(event.target.value)} disabled={busy}/><button className="btn btn-primary self-end" disabled={busy || !draft.trim()}>전송</button></form>
      </section>
    </div>}
  </>
}
