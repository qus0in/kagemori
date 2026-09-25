# ADR 0003: 근거 기반 RAG와 목적별 객관식 학습

- 상태: 설계 채택, 구현 전 검증 대기
- 작성일: 2026-09-25 (Asia/Seoul)
- 선행 결정: [ADR 0001](0001-investment-manager-dday.md), [ADR 0002](0002-textbook-catalog-and-exam-blueprint.md)
- 상세 설계: [RAG·문제 학습 설계](../plans/rag-question-study-design.md)

## 배경

사용자는 D-day를 보면서 객관식 문제를 풀고, 모르는 개념은 먼저 설명받고, 풀이 이력으로 강점과 약점을 파악한다. 교재 목차·출제기준은 내부 분류와 선별에 사용하며 별도 카탈로그 화면을 학습의 주 경로로 삼지 않는다. 기존 D1에는 개념 본문과 문제은행이 없고, 세부과목 문항 배분도 `PROVISIONAL`이다. 장·절별 실제 출제 빈도는 확인되지 않았다.

## 결정

1. 학습의 내부 목적을 **실력 체크**, **실력 향상**, **시험 통과 점검**으로 구분한다. 모든 목적에서 화면과 API는 한 번에 한 문제만 제공한다. 답 제출 후에만 다음 문제로 진행하며, 총 문항 수는 순차 세션의 목표다. 각 목적의 문항 선택, 힌트, 평가 기준은 상세 설계에 따른다.
2. 출제 가중치는 `공식 또는 검증 대기 중인 세부과목 문항 배분 → 근거 있는 회차별 관측 빈도 → 개인별 약점` 순으로 사용한다. 현재의 세부과목 배분은 시험 설계상 비중이지 관측 빈도가 아니다. 확인되지 않은 장·절에 임의의 빈출 점수나 균등 문항 수를 배분하지 않는다. 근거 수준과 표본을 저장하고, 빈도 근거가 없으면 상위 계층 배분과 미진단 범위의 탐색으로 돌아간다.
3. 공개 자료와 AI가 재구성한 개념 설명을 분리 보관한다. 출처 URL, 확인일, 적용 시점, 이용 조건, 검토 상태를 기록한다. 열람 가능한 원문을 자동 재게시하지 않는다. 검증된 개념만 검색·출제에 사용하고, 법령·세제 등 시점에 민감한 내용은 적용일을 명시한다.
4. Google AI Studio에서 발급한 키로 Worker가 Gemini API를 직접 호출한다. Worker secret에 키를 둔다. 임베딩은 최신 `Gemini Embedding 2`(768차원, Cosine)를 사용하며, 실시간 서빙은 단가와 지연시간을 최적화한 `gemini-3.5-flash-lite`, 심층 계산·에이전트 검증은 `Gemini 3.8 Flash`, 대량 반복/병렬 전처리는 Gemma 4 계열(`gemma-4-26b-a4b-it`, `gemma-4-31b-it`), 설명용 인포그래픽은 `gemini-3.1-flash-lite-image`(Nano Banana 2 Lite)를 사용한다. 벡터 저장소는 프로덕션에서 Cloudflare Vectorize를 쓰고, `VectorSearchPort`로 추상화하여 로컬/테스트에서는 TS 표준 검색 라이브러리(`@orama/orama`) 대역을 지원한다. D1을 원문·문제·풀이 이력의 기준 저장소로 둔다.
5. 문제는 Gemini/Gemma 파이프라인으로 초안을 만들 수 있으나 정답, 오답 선택지, 해설, 개념 연결, 근거, 중복 여부를 검증한 뒤에만 문제은행에 등록한다. 정답은 제출 전 클라이언트에 보내지 않는다. 시험 점검은 고정된 검증 문제로 채점하며 즉석 AI 생성 문항을 섞지 않는다.
6. D-day 계산은 ADR 0001을 유지한다. 학습 기능 도입으로 ADR 0001의 초기 “DB 불필요” 결정은 일정 기능에만 적용한다. ADR 0002의 목차·출제기준 판본과 검증 상태를 보존한다.

## 구현 조건과 검증

- [상세 설계](../plans/rag-question-study-design.md)의 자료 파이프라인, 빈도 근거, 출제 목적, D1/Vectorize 모델, 단계별 게이트를 따른다.
- ADR 0002가 요구한 2단계 확장의 구현 범위와 구체적 데이터 출처는 구현 착수 직전에 사용자와 다시 확인한다. 이 ADR은 설계 결정이며 외부 자료 수집, D1 변경, Vectorize 생성, 배포를 승인하지 않는다.
- 실력 체크의 힌트 없는 최초 답과 힌트 후 답을 구분하고, 시험 점검의 과목별 최소 정답 및 총점 계산을 검증한다. 출제기준이 미확인 상태이면 공식 합격 예측으로 표시하지 않는다.

## 참고 자료

- [2026년 교재·출제기준 조사와 불확실성](../plans/2026-investment-manager-catalog-d1.md)
- [금융투자협회 자격시험센터](https://license.kofia.or.kr/examInfo/examInfo.do?licenseCd=FWM006)
- [Gemini 임베딩 모델](https://ai.google.dev/gemini-api/docs/embeddings)
- [Cloudflare Vectorize 제한](https://developers.cloudflare.com/vectorize/platform/limits/)
