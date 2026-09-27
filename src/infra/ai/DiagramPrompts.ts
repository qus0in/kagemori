// src/infra/ai/DiagramPrompts.ts
import type { DiagramInput } from '../../domain/ports/SemanticPorts.ts'

function context(input: DiagramInput): string {
  return `주제: ${input.topicTitle}
핵심 근거: ${input.conceptBody}
정답 포인트: ${input.correctOptionText}
해설: ${input.explanation}`
}

export function buildRouterPrompt(input: DiagramInput): string {
  return `투자자산운용사 복습용 도식을 어떤 방식으로 그릴지 판정하세요.
${context(input)}

- structured: 절차·분류·비교·공식 관계·수치 차트·시간 순서처럼 흐름도, 표, 막대/선 차트, 사분면, 마인드맵, 타임라인으로 정확히 표현되는 경우(대부분).
- image: 곡선 아래 면적·음영, 공간 배치, 은유적 그림처럼 구조 도식으로는 의미가 크게 손실되는 경우에만.

{"mode":"structured|image","reason":"한 문장"} 형식의 JSON 객체 하나만 출력하세요.`
}

export function buildStructuredPrompt(input: DiagramInput): string {
  return `투자자산운용사 수험생이 한눈에 복습할 도식을 텍스트 형식으로 작성하세요.
${context(input)}

[형식 선택]
- kind "mermaid": flowchart, xychart-beta, quadrantChart, pie, mindmap, timeline 중 하나로 시작하는 Mermaid 코드. %%{init} 지시문, click, 스타일 클래스, HTML 태그 금지.
- kind "table": 비교·분류가 핵심이면 GFM 표(머리행과 구분행 포함, 행마다 줄바꿈).
- 노드·레이블은 짧은 한국어(15자 이내), 수치·공식·용어는 근거와 정확히 일치. 문제 원문·선지 번호는 옮기지 않기.
- Mermaid 노드 텍스트에 괄호·쉼표가 있으면 큰따옴표로 감싸기(예: A["PER(배)"]).

{"kind":"mermaid","code":"flowchart TD\\n  A[…] --> B[…]"} 또는 {"kind":"table","markdown":"| 구분 | … |\\n| --- | --- |\\n| … | … |"}`
}

export function buildImagePrompt(input: DiagramInput): string {
  return `투자자산운용사 수험생이 한눈에 복습할 개념 도식 한 장을 그려 주세요.
주제: ${input.topicTitle}
핵심 근거: ${input.conceptBody.slice(0, 1200)}
정답 포인트: ${input.correctOptionText}

[형식]
- 흰 배경의 간결한 플랫 인포그래픽. 그래프·비교표·흐름도 중 개념에 가장 알맞은 한 가지만 사용.
- 한국어 레이블은 짧게(10자 이내), 수식·기호·축 이름은 정확하게, 불필요한 문장·장식·인물·로고 금지.
- 문제 원문이나 선지 번호를 그대로 옮기지 않기.`
}
