# 작업 지침

- 이 저장소의 제품·기술 결정은 [ADR 0001](docs/adr/0001-investment-manager-dday.md)을 먼저 읽는다.
- 세부 작업은 단일 책임으로 모듈화된 [`.agents/skills`](.agents/skills) 내 해당 스킬을 따른다:
  - 도메인 일정 및 D-day 규칙: [`.agents/skills/kagemori-schedule/SKILL.md`](.agents/skills/kagemori-schedule/SKILL.md)
  - 풀스택 Workers/Vite/배포: [`.agents/skills/cloudflare-workers-vite/SKILL.md`](.agents/skills/cloudflare-workers-vite/SKILL.md)
  - 클린 아키텍처: [`.agents/skills/clean-architecture-ts/SKILL.md`](.agents/skills/clean-architecture-ts/SKILL.md)
  - 계층별 TDD/BDD 테스트: [`.agents/skills/layered-testing/SKILL.md`](.agents/skills/layered-testing/SKILL.md)
- **스킬 모듈화 원칙**: 스킬은 거대하게 하나로 합치지 않고, 관심사별로 보편적이고 쪼개진 단위 스킬로 작성한다. 각 스킬의 `description`에는 꼭 필요한 작업에서만 선별적으로 호출되도록 명확한 발동 조건을 작성해야 하며, 향후 신규 스킬 추가 시에도 이 방식을 필히 준수한다.
- 스킬은 `.agents/skills` 표준 경로에 배치한다.
- 패키지 매니저는 `pnpm`을 사용한다.
- 요구사항이 바뀌면 ADR을 먼저 갱신하고 코드와 문서를 맞춘다.
- 작업 완료 후에는 관련된 스킬, 룰, 문서를 항상 최신 상태로 업데이트한다.
- 작업 완료 후에는 `package.json`의 시맨틱 버전(SemVer)을 검토하여 기능 변경 규모(Breaking: Major, 기능 추가/라이브러리 확장: Minor, 수정/리팩토링: Patch)에 따라 버전 업그레이드 여부를 판정하고 갱신한다.
- 배포(`pnpm deploy`)와 Git 커밋은 사용자의 **명시적 요청 시에만** 진행한다.
- 제47회 투자자산운용사 일정은 한국 시간 기준으로 다룬다.
- Cloudflare 배포 전에는 로컬 빌드와 Wrangler 인증 상태를 확인한다.
