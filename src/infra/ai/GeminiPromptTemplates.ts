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

  const instructions = p.isCorrect
    ? `[출력 형식 및 지침 - 정답 시]
반드시 다음 마크다운 헤더와 볼릿 형식을 사용하여 작성하세요:
### 선택한 정답 선지 확인
- 선택하신 선지("${p.selectedOptionText}")가 정답인 이유를 관련 법령/개념 조문에 근거하여 명확하게 설명하세요.
### 핵심 개념 및 출제 포인트
- 본 문제에서 다루는 핵심 개념 요약과 시험에 자주 출제되는 함정/포인트를 정리하세요.`
    : `[출력 형식 및 지침 - 오답 시]
반드시 다음 마크다운 헤더와 볼릿 형식을 사용하여 작성하세요:
### 선택한 선지 분석 (오답 이유)
- 응시자가 선택한 선지("${p.selectedOptionText}")가 왜 오답인지 법령/개념 위반 또는 불일치 이유를 명확하게 설명하세요.
### 정답 선지 해설 (정답 이유)
- 실제 정답 선지${p.correctOptionText ? `("${p.correctOptionText}")` : ''}가 왜 정답인지 관련 법령/개념을 근거로 명확하게 설명하세요.`

  return `당신은 투자자산운용사 자격시험의 전문 강사입니다.
응시자가 푼 문제와 선택한 선지, 정답 여부를 바탕으로 깊이 있고 정확한 해설을 제공하세요.

[정답 여부]: ${p.isCorrect ? '정답' : '오답'}
[응시자 선택지]: "${p.selectedOptionText}"${correctLine}${optionsCtx}
[문제 질문]:
${p.questionPrompt}

[관련 개념 및 법령 조문]:
${p.conceptBody}

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
  if (p.isCorrect) {
    return `[정답 해설]
### 선택한 정답 선지 확인
- 선택하신 선지 "${p.selectedOptionText}"은(는) 정답입니다.

### 핵심 개념 및 출제 포인트
- 관련 기준: ${p.conceptBody}
- 질문: ${p.questionPrompt}`
  }

  const correctLine = p.correctOptionText
    ? `\n### 정답 선지 해설 (정답 이유)\n- 실제 정답: "${p.correctOptionText}"\n`
    : '\n'

  return `[오답 해설]
### 선택한 선지 분석 (오답 이유)
- 선택하신 선지 "${p.selectedOptionText}"은(는) 오답입니다.
${correctLine}- 관련 기준: ${p.conceptBody}
- 질문: ${p.questionPrompt}`
}
