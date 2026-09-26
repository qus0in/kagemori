# 개인용 학습 기록 저장소

- DO: 세션 진행·답안 확정, revision 비교와 transaction으로 동시 수정 차단.
- D1: 모든 세션의 풀이 영속 기록, 문항별 최신 결과를 전체 진도로 집계. 기기·브라우저로 구분하지 않음. AI 출제·검수 통과 문항은 `generated_questions`(0004)에 저장한다.
- KV: 세션 생성 메타데이터와 AI 힌트·해설 캐시(`ai:`, 30일)만 선택적으로 저장. 답안 복원에는 사용하지 않음.
- DO는 답안과 archive alarm을 함께 저장하고 D1 장애 시 60초 뒤 재예약한다. D1은 `(session_id, question_id)` 중복 삽입을 무시한다.
- GET `/api/study/coverage` 실패는 503이며 빈 진도로 위장하지 않는다. 반영 지연은 화면의 5초 주기 조회로 해소한다.

## 적용 순서

1. 배포 요청 시 먼저 `pnpm exec wrangler d1 migrations apply DB --remote`로 0004까지 적용한다. AI 출제는 Gemini 지출 한도가 남아 있어야 동작하며, 실패 시 기존 문항을 반복한다.
2. `pnpm deploy`로 Worker와 UI를 함께 배포한다. 운영 필수 바인딩은 DO·D1, `STORAGE_MODE=persistent`이다.
3. 기존 세션은 재조회 시 반영 예약된다. 일괄 반영은 `pnpm history:backfill https://kagemori.qus0in.workers.dev`로 KV 메타데이터에 남은 ID를 조회한다.
4. 결과의 `missing`은 DO 원본이 없는 세션, `failed`는 재시도 대상이다. KV ID 목록이 만료된 세션은 알고 있는 ID로 재조회해야 한다. 브라우저 저장값이나 KV 답안 복사본으로 원본을 재구성하지 않는다.
5. D1 `study_attempts` 행 수와 `/api/study/coverage`를 확인한다. alarm 오류는 `Study history archive deferred` 로그와 DO 저장소를 함께 점검한다.

## 호환성과 장애

- 기존 DO `session` 키와 namespace·migration tag를 유지한다. 기존 session의 revision은 0으로 시작한다.
- 기존 `session_state:*` KV 항목은 읽지 않으며 TTL로 만료된다. SQLite DO로 전환하지 않는다.
- DO 장애는 503, 동시 변경·다른 답으로 재제출은 409, 없는 세션은 404로 구분한다. 동일 답 재제출은 진도를 늘리지 않는다.
- D1 반영 전 DO 상태를 삭제하지 않는다. 과거 유실된 DO/브라우저 기록은 자동 복구할 수 없다.
- 개인용 공통 기록이므로 이 앱에 제출된 모든 답안이 하나의 진도에 포함된다.
