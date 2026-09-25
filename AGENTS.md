# 작업 지침

- 제품·기술 결정은 [ADR 0001](docs/adr/0001-investment-manager-dday.md) 및 [ADR 0002](docs/adr/0002-textbook-catalog-and-exam-blueprint.md)를 따른다.
- 세부 작업은 [`.agents/skills`](.agents/skills)의 단일 책임 모듈화 스킬을 준수한다:
  - 일정/D-day: [kagemori-schedule](.agents/skills/kagemori-schedule/SKILL.md) (한국 시간 기준)
  - 풀스택: [cloudflare-workers-vite](.agents/skills/cloudflare-workers-vite/SKILL.md) (로컬 빌드·인증 확인)
  - 아키텍처/테스트: [clean-architecture-ts](.agents/skills/clean-architecture-ts/SKILL.md), [layered-testing](.agents/skills/layered-testing/SKILL.md)
  - 교재/D1: [investment-manager-catalog](.agents/skills/investment-manager-catalog/SKILL.md) (1단계 완료, 2단계 확장 시 사전확인)
- 스킬은 거대화하지 않고 선별 발동 조건을 갖춰 `.agents/skills`에 모듈 단위로 작성한다.
- 패키지 매니저는 `pnpm`을 사용한다.
- 요구사항 변경 시 ADR을 선행 갱신하고 코드와 문서를 일치시킨다.
- 작업 완료 후 관련 스킬·룰·문서를 최신화하고 `package.json` SemVer를 검토·갱신한다.
- 배포(`pnpm deploy`) 및 Git 커밋은 사용자의 **명시적 요청 시에만** 진행한다.
- 제안 및 보고는 16줄, 1000자 이내로 간결하게 전달한다.
- 이 규칙 파일(`AGENTS.md`) 자체도 최대 16줄, 1000자 이내 분량을 상시 유지한다.
