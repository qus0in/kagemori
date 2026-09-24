# ADR 0001: 제47회 투자자산운용사 D-day 웹앱 구성

- 상태: 채택
- 작성일: 2026-09-24

## 배경

제47회 투자자산운용사 원서접수 시작일과 시험일까지 남은 날짜를 한 화면에서 확인할 수 있는 웹앱을 만든다. 저장소에는 아직 앱 코드가 없다. 로컬 개발에서는 프런트엔드와 Hono API를 `http://localhost:5173` 한 주소로 제공하고, 완성된 앱은 Cloudflare에 Wrangler로 배포한다.

## 결정

### 애플리케이션 구성

- React와 Vite로 화면을 만든다. Tailwind CSS의 Vite 플러그인과 daisyUI를 사용해 카운터 카드를 꾸민다.
- 메인 색상은 웜 차콜(`#2D2926`)과 코랄(`#ed6f63`)을 응용하여 구성한다. 텍스트·구조적 중립 색상에 `#2D2926` 계열을, D-day 숫자 및 주요 배지/강조에 `#ed6f63`을 사용한다.
- Cloudflare Vite 플러그인으로 Hono를 Workers 런타임에 연결한다. Vite 개발 서버의 포트를 `5173`으로 고정하고 `strictPort`를 켠다. Hono API는 `/api/*`, React 화면은 `/`에서 **같은 출처**로 제공한다. 별도 Hono 개발 서버나 프록시 포트는 두지 않는다.
- Hono의 `GET /api/schedule`은 회차, 두 날짜와 표시 이름을 반환한다. 날짜는 `YYYY-MM-DD` 형식의 날짜 값으로 관리한다. 프런트엔드는 이 응답을 받아 두 카운터를 그린다.
- 기술 스택으로 다음 라이브러리를 도입하여 활용한다.
  - 라우팅: `react-router` (SPA 라우팅 구조)
  - HTTP 통신: `ky` (인프라 계층의 간결하고 안전한 HTTP 클라이언트)
  - 클라이언트 상태: `zustand` (테마 및 클라이언트 전역 상태 관리)
  - 서버 상태: `@tanstack/react-query` (서버 일정 데이터 캐싱 및 갱신 상태 관리)
  - 캐싱: `lru-cache` (인프라 계층의 LRU 캐시 어댑터를 통한 중복 요청 방지)
  - 로깅: `pino` 및 `pino-pretty` (구조화된 로깅 인프라. 에이전트 및 진단용으로 `logs/app.log`에 로그를 기록하되 Git 추적에서 제외)
- 스킬은 거대 단일 스킬을 지양하고 관심사별 단일 책임(`kagemori-schedule`, `cloudflare-workers-vite`, `clean-architecture-ts`, `layered-testing`)으로 쪼개어 꼭 필요한 상황에서만 호출되도록 관리한다.
- 예상 파일 배치는 `worker/index.ts`(Hono), `src/ui/App.tsx`(React), `src/main.tsx`, `src/style.css`, `vite.config.ts`, `wrangler.jsonc`이다. `vite.config.ts`에는 Cloudflare·React·Tailwind 플러그인을 등록한다.
- 로그 파일(`logs/app.log`)은 에이전트가 런타임 및 테스트 진단을 수행할 수 있는 표준 경로로 유지하며, `.gitignore`에 등록하여 저장소에 커밋되지 않도록 관리한다.
- 클린 아키텍처 원칙에 따라 코드를 `domain`, `app`, `infra`, `ui` 4개 계층으로 분리한다.
  - `domain`: 비즈니스 엔티티 및 규칙(DDay 계산, 캘린더 날짜 값 객체, 일정 포트 인터페이스)
  - `app`: 유스케이스 계층(일정 조회 및 D-day 계산 조합 등 비즈니스 흐름 조율)
  - `infra`: 외부 연동 및 어댑터(ky 기반 HTTP 클라이언트, 시스템 시간 제공자, Pino 로거, Hono Worker 핸들러)
  - `ui`: React Router 라우팅, React Query 훅, Zustand 스토어, 프레젠터 컴포넌트
- 계층별 TDD / BDD 테스트 체계를 구축한다.
  - `domain`: 순수 유닛 테스트 (D-day 상태 판별, 윤년/월 경계 엣지 케이스 BDD 시나리오)
  - `app`: 유스케이스 슬라이스 테스트 (Stub/Mock 리포지토리를 통한 유스케이스 상호작용 검증)
  - `infra`: 통합 테스트 (Hono 엔드포인트 실제 요청/응답 검증, HTTP 클라이언트 검증)
  - `ui`: 훅 및 뷰모델 슬라이스 테스트 (시간 변경 및 로딩/에러 상태 전이 검증)
- TypeScript 환경은 브라우저(React), Worker, Node 환경 분리를 위해 Project References를 적용하되, `tsbuildinfo` 캐시 부산물은 `node_modules/.tmp/`로 격리하여 소스 트리에 생성되지 않도록 유지한다.

### 배포 및 릴리스 정책

- 배포 대상은 Cloudflare Workers와 정적 에셋이다. `wrangler.jsonc`의 `main`은 Hono Worker를 가리키고, SPA 경로를 위해 `assets.not_found_handling`을 `single-page-application`으로 둔다.
- 패키지 매니저는 `pnpm`을 사용한다. `pnpm dev`는 Vite 개발 서버를 `5173` 포트에서 실행한다. `pnpm build`는 `vite build`, `pnpm deploy`는 빌드 후 `wrangler deploy`를 실행한다. 배포 전에는 `wrangler whoami`로 인증 상태를 확인한다.
- **배포 및 커밋 정책**: 배포(`pnpm deploy`)와 Git 커밋은 **사용자의 명시적 요청 시에만** 진행한다.
- **시맨틱 버전(SemVer) 정책**: 작업 완료 후 `package.json`의 버전을 검토하고 기능 변경 규모(Major/Minor/Patch)에 따라 업그레이드 여부를 판정한다.
- 날짜 값은 코드에 고정한다. 이 버전에는 데이터베이스, 로그인, 예약 작업이 필요하지 않다.

### D-day 규칙

| 항목 | 대상 날짜 | 화면 이름 |
| --- | --- | --- |
| 원서접수 | 2026-10-12 | 접수 시작 |
| 시험 | 2026-11-08 | 시험일 |

- 기준 시간대는 `Asia/Seoul`이다. 사용자의 기기 시간대와 관계없이 한국의 **오늘 날짜**와 대상 날짜 사이의 달력상 일수 차이를 계산한다. 시각 정보가 없는 날짜를 브라우저 현지 시각의 자정으로 파싱하지 않는다.
- 대상일 전에는 `D-N`, 당일에는 `D-Day`, 지난 뒤에는 `D+N`으로 표시한다. 예를 들어 2026-09-24 한국 시간에는 접수 `D-18`, 시험 `D-45`다.
- 페이지를 켜 둔 상태에서도 한국 시간 자정이 지나면 값을 갱신한다. 탭을 다시 볼 때도 재계산한다.
- 두 날짜는 접수 **시작일**과 시험 **날짜**를 뜻한다. 접수 마감이나 시험 시각은 이 카운터의 기준에 포함하지 않는다.

## 결과와 확인 기준

- 로컬에서 `http://localhost:5173/`에 접속하면 두 카운터가 보이고, 같은 주소의 `/api/schedule`이 날짜를 반환한다.
- 빌드 산출물에는 React 정적 파일과 Hono Worker가 함께 포함되며, Wrangler 한 번으로 배포된다.
- 한국 시간 기준 2026-10-12와 2026-11-08에 각각 해당 카운터가 `D-Day`로 바뀐다. 사용자의 시간대가 달라도 표시가 같다.
- 일정이 변경되면 날짜 상수와 이 ADR의 대상 날짜를 함께 수정한다.

## 근거 자료

- [금융투자협회 자격시험센터](https://license.kofia.or.kr/main/main.do): 제47회 투자자산운용사 회차 확인
- [금융투자협회 자격시험센터 시험안내](https://license.kofia.or.kr/examInfo/examInfo.do?selLicenseCd=FWM006): 공식 일정 확인 경로
- [Hono: Cloudflare Workers + Vite](https://hono.dev/docs/getting-started/cloudflare-workers-vite): Hono와 Vite의 단일 개발 서버 구성
- [Cloudflare: React + Vite](https://developers.cloudflare.com/workers/framework-guides/web-apps/react/): Workers 정적 에셋, SPA 및 Wrangler 배포
- [daisyUI: React 설치](https://daisyui.com/docs/install/react/): Tailwind CSS와 daisyUI의 Vite 설정
