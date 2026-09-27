---
name: rag-adaptive-study
description: Implement and maintain RAG concept explanation, adaptive multiple-choice question study, vector similarity search, and Gemini/Gemma pipelines based on ADR 0003.
---

# RAG & Adaptive Study Skill

- 작업 전 [ADR 0003](../../../docs/adr/0003-adaptive-question-rag-study.md) 및 [학습 설계](../../../docs/plans/rag-question-study-design.md)를 필독한다.
- **학습 인터랙션 원칙**: 화면과 API는 1회 1문항 원칙을 고수하며, 제출 전 정답을 클라이언트에 노출하지 않는다.
- **조회 실패 복구**: 다음 문제를 받기 전 해설·선택을 지우지 않는다. 첫 조회 실패도 같은 세션에서 재시도하며, 중복 요청과 초기화 후 늦은 응답을 차단한다. `/next` GET의 제한된 재시도 정책을 제출 POST에 적용하지 않는다. 다음 문제 조회 중에는 카드를 반투명·`inert`로 고정하고 스피너를 겹친다.
- **모델 사용 현황(코드 기준, ADR 0003 표)**: 힌트·일반 해설 `gemini-3.5-flash-lite` → `gemma-4-26b-a4b-it` 품질 검토 → 미달/실패 시 `gemini-3.8-flash` 보정(`ReviewedTextClient`), 사용자 해설 재요청은 3.8 직행(`GeminiAiAdapter`), 출제·1차 검수 `gemini-3.8-flash`(`GeminiQuestionAuthor`), 초안 선별·쟁점 태깅 `gemma-4-26b-a4b-it`, 교차 블라인드 검수 `gemma-4-31b-it`(`GemmaQuestionModels`), 의미 중복·약점 유사 `gemini-embedding-2` 768차원(`GeminiEmbeddingAdapter` + Vectorize), 풀이 후 개념 도식 `gemini-3.1-flash-image`(Nano Banana 2, `GeminiDiagramAdapter`, 모델별 KV 캐시). Gemma는 JSON 모드 없이 `parseModelJsonList`로 파싱한다. 출제 보조 모델 실패는 해당 단계만 건너뛰고, 실시간 품질 검토 실패는 3.8로 승격한다.
- **풀이 후 기능**: 해설 재요청·도식은 `loadAnsweredQuestion`으로 제출 여부를 확인한 뒤에만 제공한다(미제출 409). 도식은 `gemini-3.5-flash-lite`→`gemma-4-26b-a4b-it` 순서로 표현 방식을 판정하고, 구조 도식(Lite 작성 → Gemma 승인/3.8 보정의 Mermaid·GFM 표, `validateStructuredDiagram` 통과분)을 우선한다. 이미지는 판정·검증 실패·사용자 요청 시에만 만들어 R2에 저장하고 세션 경로로 내려보낸다.
- **출제 계획**: 세션 생성 시 `CreateStudySessionUseCase`가 D1 최신 결과로 `미풀이 → 오답·힌트 → 정답(오래된 순)` 목록을 즉시 확정해 DO에 저장한다(AI 대기 없음). 1·2번은 항상 기존 문항이고, 미풀이가 모자라면 이후 자리를 `generation` 계획으로 표시한다. 클라이언트가 첫 문항 수신 후 `/prepare`를 호출하면 `PrepareSessionQuestionsUseCase`가 `ReplenishQuestionBankUseCase`(주제 배정 → 출제 → 선별·중복 차단 → 병렬 블라인드 검수)로 만든 문항을 미제공·미잠금 자리에만 넣는다. 생성 자리에 먼저 도착하면 `/next`가 202로 대기를 안내하고, 기한(75초)이나 사용자 선택 시 자리를 잠그고 기존 문항을 낸다. 시험 점검에는 섞지 않는다(ADR 0003).
- **모델 파이프라인(ADR 원안)**:
  - 임베딩: `Gemini Embedding 2` (768차원, Cosine)
  - 서브 병렬/전처리: `gemma-4-26b-a4b-it` (MoE 전처리·태깅), `gemma-4-31b-it` (Dense 초안 검수)
  - 실시간 서빙: `gemini-3.5-flash-lite` (초저지연 힌트·해설 서빙)
  - 심층 추론/검증: `Gemini 3.8 Flash` (1M 컨텍스트 복합 계산·법령 검증)
  - 시각 자료: `gemini-3.1-flash-image` (Nano Banana 2, 2026-09-27 Lite에서 상향)
- **벡터 검색 아키텍처**:
  - `VectorSearchPort` 인터페이스로 격리
  - 프로덕션: Cloudflare Vectorize (에지 네이티브)
  - 로컬/테스트: `@orama/orama` 인메모리/임베디드 어댑터 사용
- **데이터 무결성**: D1을 개념 원문·문제은행·풀이 이력의 단일 진실 공급원(SSOT)으로 유지한다.
- **학습 지도**: ADR 0005의 진도는 세부과목별 힌트 없는 정답 확인 비율이다. 개인용 전체 풀이를 D1에 영속화하고 문항별 최신 결과를 조회한다. DO 답안과 archive alarm은 함께 저장하며 브라우저 저장으로 대체하지 않는다. 오답·힌트 후 정답은 복습 대상으로 구분하고 숙달률·합격 확률로 표현하지 않는다.
- **AI 응답 캐시**: 힌트·해설의 검토 승인/승격 성공 응답만 정책 버전·작성/검토/승격 모델·재요청 경로·토큰·프롬프트 해시 키로 KV에 캐시한다(ADR 0006). 폴백은 캐시하지 않고 KV 장애가 응답을 막지 않게 한다.
- **힌트 품질**: 서두·자기소개 없이 1~2문장, 정답 용어·수치·선지 문장을 직접 쓰지 않고 판단 기준만 안내한다(2026-09-27 실호출 검증).
- **해설 품질 및 사족 배제**:
  - 화면에 결과 배지와 질문이 이미 있으므로, 해설에 '~는 정답/오답입니다', 질문 원문 복사, 선택지 단순 복창 등 사족을 절대 출력하지 않는다.
  - 서두 없이 해당 선지의 정답/오답 근거(법령 조문, 투자 이론, 계산 논리, 출제 함정)만을 담백하게 마크다운으로 제공한다.
  - AI 호출 실패나 할당량 초과 시의 폴백에서도 공식 출제 해설(`question.explanation`) 원문만을 불필요한 서두 없이 직접 반환한다.
