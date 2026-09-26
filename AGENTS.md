# 작업 지침

- 제품·기술 결정은 ADR [0001](docs/adr/0001-investment-manager-dday.md) ~ [0006](docs/adr/0006-cloudflare-durable-objects-and-kv-session-architecture.md)을 따른다.
- 세부 작업은 [`.agents/skills`](.agents/skills)의 단일 책임 모듈화 스킬을 준수한다:
  - 일정/D-day: kagemori-schedule, 풀스택: cloudflare-workers-vite
  - 아키텍처/품질: clean-architecture-ts, code-line-limits
  - 교재/학습/테스트: investment-manager-catalog, rag-adaptive-study, layered-testing
- AI 해설·힌트는 사족(정답 여부·질문 원문 복사)을 배제하고 수험 핵심 근거만 담백하게 제공한다.
- 패키지 매니저는 `pnpm`을 사용하며, 요구사항 변경 시 ADR과 문서를 선행 갱신한다.
- 완료 후 관련 스킬·문서를 최신화하고 `package.json` SemVer를 검토·필요 시 갱신한다.
- 배포(`pnpm deploy`) 및 Git 커밋은 사용자의 **명시적 요청 시에만** 진행한다.
- 제안·보고 및 `AGENTS.md`는 16줄, 1000자 이내로 엄격히 유지한다.
