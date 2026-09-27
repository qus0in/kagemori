# 시험 통과 점검 VERIFIED 혼합 구현 명세

- 작성일: 2026-09-27 (Asia/Seoul)
- 상태: 구현 대기. 구현은 본 문서 지시를 기계적으로 따른다(자율 판단 금지, 예외는 구현 중단 후 보고).
- 결정: [ADR 0003](../adr/0003-adaptive-question-rag-study.md) "시험 통과 점검의 VERIFIED 등급 혼합 (2026-09-27)"
- 준수: clean-architecture-ts(레이어 경계), code-line-limits(파일 128줄), layered-testing(단위·슬라이스·통합)
- 버전: 완료 시 `package.json` `0.15.0` → `0.16.0` (마이너)

## 1. 등급 체계

생성 문항에 `tier`를 저장한다. 판정은 출제 시점에 결정론적으로 내린다.

| 등급 | 조건 (전부 만족) | 용도 |
|---|---|---|
| `VERIFIED` | ① 1차 검수자 승인·독립 풀이 일치(기존 통과 조건) ② 응답한 검수자 ≥ 2명(교차 Gemma ≥ 1 응답) ③ 응답한 검수자 전원 승인·풀이 일치 ④ 선별(screening) 실행·통과 ⑤ 임베딩 중복 검사 실행·통과 | 시험 통과 점검 혼합 + 학습 |
| `REVIEWED` | ①·③만 충족(보조 단계 생략·실패 허용). 기존 저장 문항 전부 | 학습(진단·향상) 전용 |

## 2. 시험 점검 풀 정책

- 풀 = 비생성 문항 전부 + `VERIFIED` 생성 문항 표본(세션 시드 셔플). `REVIEWED` 생성 문항은 배제.
- 혼합 상한: `Math.floor(세션 문항 수 × 0.4)`. 상수 `MOCK_EXAM_AI_MAX_RATIO = 0.4`는 검증 후 조정값.
- `MOCK_EXAM` 세션의 `generation` 계획은 계속 부재(세션 중 출제·대기·교체·잠금 금지).
- `listGenerated()` 조회 실패 시 warn 로그 후 빈 등급 집합으로 폴백(비생성 문항만, 시험 생성 중단 금지).

## 3. 파일별 구현 지시 (번호 순서대로)

1. `src/domain/models/GeneratedQuestion.ts`
   - `export type GeneratedQuestionTier = 'REVIEWED' | 'VERIFIED'` 추가.
   - `GeneratedQuestionRecord`에 `readonly tier: GeneratedQuestionTier` 추가.
   - `export function tierOfReview(passed: boolean, crossReviewed: boolean, screened: boolean, dedupeChecked: boolean): GeneratedQuestionTier` 추가 — 인자 4개 전부 `true`면 `'VERIFIED'`, 아니면 `'REVIEWED'`.
2. `migrations/0006_generated_question_tier.sql` (신규)
   ```sql
   ALTER TABLE generated_questions ADD COLUMN tier TEXT NOT NULL DEFAULT 'REVIEWED';
   CREATE INDEX IF NOT EXISTS generated_questions_tier ON generated_questions(tier);
   ```
3. `test/helpers/storageHarness.ts` — 마이그레이션 배열 끝에 `'0006_generated_question_tier.sql'` 추가.
4. `src/infra/d1/D1QuestionBank.ts` — `Row`·`toRecord`·`list()`/`findById()` SELECT·`save()` INSERT에 `tier` 반영. 변환은 `row.tier === 'VERIFIED' ? 'VERIFIED' : 'REVIEWED'`.
5. `src/domain/ports/QuestionBankPorts.ts` — `QuestionBankPort`에 `listGenerated(): Promise<GeneratedQuestionRecord[]>` 추가(주석: 등급 조회용).
6. `src/infra/study/InMemoryQuestionRepository.ts` — `listGenerated() { return this.generated.list() }` 구현.
7. `src/app/usecases/ReplenishQuestionBankUseCase.ts`
   - `screen()` 반환을 `{ drafts: QuestionDraft[]; screened: boolean[] }`로 변경. 배열은 반환 `drafts`와 같은 길이·순서(스크리너 미구성·예외 시 전부 `false`, 판정 없는 통과 인덱스도 `false`).
   - `dedupe()` 반환을 `{ drafts; vectors; checked: boolean[] }`로 변경(semantic 미구성·예외 시 전부 `false`, 실행 시 duplicate 아닌 인덱스 `true`).
   - 저장 `records`의 `tier`에 `tierOfReview(verdict.passed(index, draft), verdict.models.length >= 2, screened[index], checked[index])`.
   - 128줄 초과 시에만 타입·사소한 헬퍼를 별도 파일로 분리한다(로직 재배치 금지).
8. `src/domain/models/MockExamPool.ts` (신규)
   ```ts
   export const MOCK_EXAM_AI_MAX_RATIO = 0.4
   export function selectMockExamPool(
     pool: readonly Question[], verifiedIds: ReadonlySet<string>, count: number, shuffleSeed: string,
   ): Question[]
   ```
   본문: `base = pool.filter((q) => !isGeneratedQuestionId(q.id))`, `ai = seededShuffle(pool.filter((q) => verifiedIds.has(q.id)), shuffleSeed).slice(0, Math.floor(count * MOCK_EXAM_AI_MAX_RATIO))`, 반환 `[...base, ...ai]`.
9. `src/app/usecases/CreateStudySessionUseCase.ts`
   - 기존 `isGeneratedQuestionId` 전역 배제 필터(`mockExam` 분기)를 삭제하고, `mockExam`일 때 `selectMockExamPool(all, verifiedIds, count, seed)`를 적용.
   - `verifiedIds`는 `bank.listGenerated()`에서 `tier === 'VERIFIED'`인 `question.id`의 `Set`. try/catch로 warn 후 빈 집합(기존 `loadHistory` 패턴 준용).
   - `generation` 계획 조건의 `!mockExam` 유지. 나머지 로직(순서 계획·히스토리·부스트) 변경 금지.
10. UI·worker 변경 없음 — 문항 카드의 기존 `AI 출제·검수` 배지가 시험 문항에 자동 적용된다.

주의: `GeneratedQuestionRecord`를 직접 생성하는 기존 테스트 픽스처에는 `tier: 'REVIEWED'`를 추가한다(`pnpm check` 오류로 위치 식별).

## 4. 테스트 매트릭스 (layered-testing)

| 계층 | 파일 (신규/확장) | 필수 입증 |
|---|---|---|
| 단위·도메인 | `test/unit/domain/MockExamPool.test.ts` (신규) | VERIFIED만 포함, REVIEWED 배제, 상한 `Math.floor` 절삭, 동일 seed 재현성, 비생성 문항 전부 포함 |
| 단위·도메인 | `test/unit/domain/QuestionTier.test.ts` (신규) | `tierOfReview` 전 인자 true→`VERIFIED`, 하나라도 false→`REVIEWED` |
| 슬라이스·앱 | `test/slice/app/QuestionModelPipeline.test.ts` (확장) | 검수자 2 + 선별 + 중복 검사 통과→`VERIFIED` 저장, 3.8 단독 검수→`REVIEWED` |
| 슬라이스·앱 | `test/slice/app/CreateStudySessionUseCase.test.ts` (확장) | MOCK_EXAM 풀에 VERIFIED 포함·REVIEWED 배제·상한 준수·`generation` 부재·`listGenerated` 실패 시 비생성 폴백 |
| 통합·인프라 | `test/integration/infra/GeneratedQuestionFlow.test.ts` (확장) | 마이그레이션 0006 적용 후 tier 저장·조회 왕복, 기존 행 DEFAULT `REVIEWED` |

## 5. 완료 게이트

- `pnpm check`, `pnpm check:lines`, `pnpm test` 전부 통과가 완료 조건이다.
- 기존 저장 문항은 전부 `REVIEWED`로 동작해야 하며 진단·향상 세션 동작에 회귀가 없어야 한다.
- 배포(`pnpm deploy`)와 Git 커밋은 사용자의 명시적 요청 시에만 수행한다.
