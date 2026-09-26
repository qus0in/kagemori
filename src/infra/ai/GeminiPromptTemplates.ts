// src/infra/ai/GeminiPromptTemplates.ts

export function buildHintPrompt(conceptBody: string, questionPrompt: string): string {
  return `당신은 투자자산운용사 자격시험의 초저지연 학습 튜터입니다.
아래 학습 개념을 바탕으로 문제 풀이에 도움이 되는 핵심 힌트를 1~2문장으로 제공하세요.
직접적인 정답 번호나 문장을 그대로 누설하지 말고, 정답 판별의 기준 원리를 안내하세요.

[관련 개념]:
${conceptBody}

[문제 질문]:
${questionPrompt}`
}

export function buildExplanationPrompt(
  conceptBody: string,
  questionPrompt: string,
  selectedOptionText: string,
  isCorrect: boolean
): string {
  return `당신은 투자자산운용사 자격시험의 전문 강사입니다.
응시자가 선택한 선지의 정답 여부와 관련 법령/개념 근거를 연결하여 명쾌하게 해설하세요.

[정답 여부]: ${isCorrect ? '정답' : '오답'}
[응시자 선택지]: "${selectedOptionText}"
[문제 질문]:
${questionPrompt}

[관련 개념 및 법령 조문]:
${conceptBody}`
}

export function fallbackHint(conceptBody: string, questionPrompt: string): string {
  const firstSentence = conceptBody.split(/[.!?]\s/)[0] || conceptBody
  return `[학습 힌트] ${questionPrompt} 관련 핵심 원리: ${firstSentence}.`
}

export function fallbackExplanation(
  conceptBody: string,
  questionPrompt: string,
  selectedOptionText: string,
  isCorrect: boolean
): string {
  const resultTag = isCorrect ? '[정답 해설]' : '[오답 복습]'
  return `${resultTag} 선택하신 선지 "${selectedOptionText}" 관련 기준: ${conceptBody} (질문: ${questionPrompt})`
}
