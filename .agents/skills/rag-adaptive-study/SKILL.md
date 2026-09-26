---
name: rag-adaptive-study
description: Implement and maintain RAG concept explanation, adaptive multiple-choice question study, vector similarity search, and Gemini/Gemma pipelines based on ADR 0003.
---

# RAG & Adaptive Study Skill

- 작업 전 [ADR 0003](../../../docs/adr/0003-adaptive-question-rag-study.md) 및 [학습 설계](../../../docs/plans/rag-question-study-design.md)를 필독한다.
- **학습 인터랙션 원칙**: 화면과 API는 1회 1문항 원칙을 고수하며, 제출 전 정답을 클라이언트에 노출하지 않는다.
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
- **학습 지도**: ADR 0005의 진도는 세부과목별 힌트 없는 정답 확인 비율이다. 서버 채점 성공 후 문항별 최신 결과를 브라우저에 보조 저장하며 세션 초기화로 지우지 않는다. 오답·힌트 후 정답은 복습 대상으로 구분하고 숙달률·합격 확률로 표현하지 않는다.
