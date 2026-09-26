---
name: rag-adaptive-study
description: Implement and maintain RAG concept explanation, adaptive multiple-choice question study, vector similarity search, and Gemini/Gemma pipelines based on ADR 0003.
---

# RAG & Adaptive Study Skill

- 작업 전 [ADR 0003](../../../docs/adr/0003-adaptive-question-rag-study.md) 및 [학습 설계](../../../docs/plans/rag-question-study-design.md)를 필독한다.
- **학습 인터랙션 원칙**: 화면과 API는 1회 1문항 원칙을 고수하며, 제출 전 정답을 클라이언트에 노출하지 않는다.
- **조회 실패 복구**: 다음 문제를 받기 전 해설·선택을 지우지 않는다. 첫 조회 실패도 같은 세션에서 재시도하며, 중복 요청과 초기화 후 늦은 응답을 차단한다. `/next` GET의 제한된 재시도 정책을 제출 POST에 적용하지 않는다.
- **모델 파이프라인**:
  - 임베딩: `Gemini Embedding 2` (768차원, Cosine)
  - 서브 병렬/전처리: `gemma-4-26b-a4b-it` (MoE 전처리·태깅), `gemma-4-31b-it` (Dense 초안 검수)
  - 실시간 서빙: `gemini-3.5-flash-lite` (초저지연 힌트·해설 서빙)
  - 심층 추론/검증: `Gemini 3.8 Flash` (1M 컨텍스트 복합 계산·법령 검증)
  - 시각 자료: `gemini-3.1-flash-lite-image` (Nano Banana 2 Lite 다이어그램 생성)
- **벡터 검색 아키텍처**:
  - `VectorSearchPort` 인터페이스로 격리
  - 프로덕션: Cloudflare Vectorize (에지 네이티브)
  - 로컬/테스트: `@orama/orama` 인메모리/임베디드 어댑터 사용
- **데이터 무결성**: D1을 개념 원문·문제은행·풀이 이력의 단일 진실 공급원(SSOT)으로 유지한다.
- **학습 지도**: ADR 0005의 진도는 세부과목별 힌트 없는 정답 확인 비율이다. 개인용 전체 풀이를 D1에 영속화하고 문항별 최신 결과를 조회한다. DO 답안과 archive alarm은 함께 저장하며 브라우저 저장으로 대체하지 않는다. 오답·힌트 후 정답은 복습 대상으로 구분하고 숙달률·합격 확률로 표현하지 않는다.
- **해설 품질 및 사족 배제**:
  - 화면에 결과 배지와 질문이 이미 있으므로, 해설에 '~는 정답/오답입니다', 질문 원문 복사, 선택지 단순 복창 등 사족을 절대 출력하지 않는다.
  - 서두 없이 해당 선지의 정답/오답 근거(법령 조문, 투자 이론, 계산 논리, 출제 함정)만을 담백하게 마크다운으로 제공한다.
  - AI 호출 실패나 할당량 초과 시의 폴백에서도 공식 출제 해설(`question.explanation`) 원문만을 불필요한 서두 없이 직접 반환한다.
