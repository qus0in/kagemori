// src/infra/ai/GeminiPromptTemplates.ts
import type { GenerateExplanationParams } from '../../domain/ports/AiExplanationPort.ts'

export function buildHintPrompt(conceptBody: string, questionPrompt: string): string {
  return `당신은 투자자산운용사 자격시험의 초저지연 학습 튜터입니다.
아래 학습 개념을 바탕으로 문제 풀이에 도움이 되는 핵심 힌트를 1~2문장으로 제공하세요.
직접적인 정답 번호나 문장을 그대로 누설하지 말고, 정답 판별의 기준 원리를 안내하세요.

[관련 개념]:
${conceptBody}

[문제 질문]:
${questionPrompt}`
}

function normalizeExplanationParams(
  paramsOrConcept: GenerateExplanationParams | string,
  questionPrompt?: string,
  selectedOptionText?: string,
  isCorrect?: boolean
): GenerateExplanationParams {
  if (typeof paramsOrConcept === 'object') {
    return paramsOrConcept
  }
  return {
    conceptBody: paramsOrConcept,
    questionPrompt: questionPrompt ?? '',
    selectedOptionText: selectedOptionText ?? '',
    correctOptionText: isCorrect ? (selectedOptionText ?? '') : '',
    isCorrect: !!isCorrect,
  }
}

export function buildExplanationPrompt(params: GenerateExplanationParams): string
export function buildExplanationPrompt(
  conceptBody: string,
  questionPrompt: string,
  selectedOptionText: string,
  isCorrect: boolean
): string
export function buildExplanationPrompt(
  paramsOrConcept: GenerateExplanationParams | string,
  questionPrompt?: string,
  selectedOptionText?: string,
  isCorrect?: boolean
): string {
  const p = normalizeExplanationParams(paramsOrConcept, questionPrompt, selectedOptionText, isCorrect)
  const optionsCtx = p.allOptions?.length
    ? `\n[전체 보기 선지]:\n${p.allOptions.map((o) => `- ${o.text}`).join('\n')}`
    : ''
  const correctLine = p.correctOptionText ? `\n[실제 정답 선지]: "${p.correctOptionText}"` : ''
  const refExp = p.questionExplanation ? `\n[공식 교재 해설]:\n${p.questionExplanation}` : ''

  const instructions = p.isCorrect
    ? `[작성 지침 - 정답 시]
- 화면 상단에 문제 질문과 정답 배지가 이미 표시되어 있으므로, 질문 내용이나 '~는 정답입니다' 같은 형식적인 확인 문구는 절대 다시 쓰지 마세요.
- 해당 선지가 왜 옳은지 법령 조문, 경제·투자 이론상의 핵심 근거와 수험상 유의할 포인트를 곧바로 담백하게 설명하세요.`
    : `[작성 지침 - 오답 시]
- 화면 상단에 문제 질문과 오답 배지가 이미 표시되어 있으므로, 질문 내용이나 '~는 오답입니다' 같은 형식적인 확인 문구는 절대 다시 쓰지 마세요.
- 응시자가 선택한 선지("${p.selectedOptionText}")의 구체적인 오류/함정 이유와, 실제 정답 선지${p.correctOptionText ? `("${p.correctOptionText}")` : ''}의 정답 근거를 곧바로 명확하게 설명하세요.`

  return `당신은 투자자산운용사 자격시험의 전문 강사입니다.
수험생이 문제를 푼 직후 읽는 해설이므로, 질문 복사나 사족 없이 실질적인 수험 핵심 근거만 군더더기 없이 마크다운으로 작성하세요.

[정답 여부]: ${p.isCorrect ? '정답' : '오답'}
[응시자 선택지]: "${p.selectedOptionText}"${correctLine}${optionsCtx}
[문제 질문]:
${p.questionPrompt}

[관련 개념]:
${p.conceptBody}${refExp}

${instructions}`
}

export function fallbackHint(conceptBody: string, questionPrompt: string): string {
  const firstSentence = conceptBody.split(/[.!?]\s/)[0] || conceptBody
  return `[학습 힌트] ${questionPrompt} 관련 핵심 원리: ${firstSentence}.`
}

export function fallbackExplanation(params: GenerateExplanationParams): string
export function fallbackExplanation(
  conceptBody: string,
  questionPrompt: string,
  selectedOptionText: string,
  isCorrect: boolean
): string
export function fallbackExplanation(
  paramsOrConcept: GenerateExplanationParams | string,
  questionPrompt?: string,
  selectedOptionText?: string,
  isCorrect?: boolean
): string {
  const p = normalizeExplanationParams(paramsOrConcept, questionPrompt, selectedOptionText, isCorrect)
  if (p.questionExplanation) {
    return p.questionExplanation
  }
  return p.conceptBody
}
