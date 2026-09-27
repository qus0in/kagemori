// src/infra/ai/GeminiQuestionPrompts.ts
import type { QuestionDraft } from '../../domain/models/GeneratedQuestion.ts'
import type { AuthoringRequest } from '../../domain/ports/QuestionBankPorts.ts'

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max)}…` : text)

function topicBlock(request: AuthoringRequest): string {
  return request.allocations.map(({ topicId, count }) => {
    const topic = request.topics.find((t) => t.id === topicId)!
    const chapters = topic.chapters.map((c) => `  - ${c.id}: ${c.title}`).join('\n') || '  - (매핑된 장 없음)'
    const notes = topic.conceptNotes.map((n) => `  - ${clip(n, 400)}`).join('\n') || '  - (없음)'
    const existing = (request.existingPrompts[topicId] ?? []).slice(-30).map((p) => `  - ${clip(p, 120)}`).join('\n') || '  - (없음)'
    return `## topicId: ${topicId} (${topic.subjectTitle} > ${topic.title}) — ${count}문항
교재 장(chapterId: 제목):
${chapters}
검증된 개념:
${notes}
기존 문항(중복 금지):
${existing}`
  }).join('\n\n')
}

export function buildDraftPrompt(request: AuthoringRequest): string {
  return `당신은 금융투자협회 투자자산운용사 자격시험 출제위원입니다. 2026년 시행 법령·세법·교재 기준으로 4지선다 문항을 출제하세요.

[출제 원칙]
- 각 topicId에 지정된 문항 수만큼 출제하고, chapterId는 해당 주제의 교재 장 목록에서 고릅니다.
- 정답은 정확히 1개이며, 오답 선지는 그럴듯하지만 명확한 근거로 틀려야 합니다. "모두 옳다/옳지 않다" 선지는 쓰지 않습니다.
- 기존 문항과 같은 쟁점·수치를 반복하지 말고, 시점에 따라 달라지거나 확신할 수 없는 수치·조문은 출제하지 않습니다.
- 계산 문항은 선지 간 차이가 계산 실수 유형을 반영하도록 만듭니다.
- 문제와 선지는 평문으로 쓰고 LaTeX 대신 β, σ, √, ² 같은 유니코드 기호를 씁니다.
- explanation은 정답 근거와 대표 오답의 함정을 3~5문장 마크다운으로, basis는 근거가 되는 법령 조문·이론·공식을 2~4문장으로 씁니다.

[주제별 자료]
${topicBlock(request)}

[출력 JSON]
{"questions":[{"topicId":"topic-x-y","chapterId":"c…","type":"CONCEPT|APPLICATION|CALCULATION|REGULATION","difficulty":"EASY|MEDIUM|HARD","prompt":"…","options":["…","…","…","…"],"correctIndex":0,"explanation":"…","basis":"…"}]}`
}

export function buildReviewPrompt(drafts: readonly QuestionDraft[], request: AuthoringRequest): string {
  const items = drafts.map((draft, index) => {
    const topic = request.topics.find((t) => t.id === draft.topicId)
    const existing = (request.existingPrompts[draft.topicId] ?? []).slice(-30).map((p) => `   - ${clip(p, 120)}`).join('\n') || '   - (없음)'
    return `### index ${index} — ${topic?.subjectTitle} > ${topic?.title}
${draft.prompt}
${draft.options.map((option, i) => `${i}. ${option}`).join('\n')}
기존 문항:
${existing}`
  }).join('\n\n')
  return `당신은 투자자산운용사 시험 문항 검수위원입니다. 아래 문항에는 정답과 해설이 없습니다. 각 문항을 직접 풀고 엄격히 판정하세요.

[판정 기준]
- solvedIndex: 스스로 판단한 정답 선지 번호(0~3).
- approved는 다음을 모두 만족할 때만 true: 정답이 정확히 하나, 모든 선지가 2026년 기준 법령·이론에 비추어 참/거짓이 명확, 제시된 세부과목 범위, 기존 문항과 쟁점 중복 없음, 문장이 모호하지 않음.
- 조금이라도 의심스러우면 approved=false로 하고 issues에 이유를 한 문장으로 적습니다. 문제가 없으면 issues는 빈 문자열입니다.

${items}

[출력 JSON]
{"reviews":[{"index":0,"solvedIndex":0,"approved":true,"issues":""}]}`
}

export function buildScreenPrompt(drafts: readonly QuestionDraft[], request: AuthoringRequest): string {
  const items = drafts.map((draft, index) => {
    const topic = request.topics.find((t) => t.id === draft.topicId)
    return `### index ${index} — ${topic?.title ?? draft.topicId}
${draft.prompt}
${draft.options.map((option, i) => `${i}. ${option}`).join('\n')}`
  }).join('\n\n')
  return `투자자산운용사 시험 문항 초안을 빠르게 1차 선별하고 태깅하세요. 정답 여부는 판단하지 않습니다.

[제거 기준] 한국어 문장이 아님, 선지 4개가 서로 구별되지 않음, LaTeX 기호($, \\frac 등) 사용, 제시된 세부과목과 무관, 문장이 잘리거나 모호함.
[태깅] issue: 문항이 묻는 핵심 쟁점을 40자 이내 한 줄로(예: "PER 계산과 EPS 정의").

${items}

반드시 아래 JSON만 출력하세요.
{"screens":[{"index":0,"keep":true,"issue":"…"}]}`
}
