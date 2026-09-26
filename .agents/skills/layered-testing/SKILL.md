---
name: layered-testing
description: Author and maintain layered TDD/BDD tests across domain unit, application/ui slice, and infrastructure integration test levels.
---

# Layered TDD/BDD Testing Skill

Use this skill when creating or updating test suites, applying BDD Given-When-Then patterns, or testing specific architectural layers.

## Test Pyramid & Structure

```
test/
├── unit/         # Pure domain tests without IO, network, or external libraries
│   └── domain/   # CalendarDate.test.ts, DDay.test.ts
├── slice/        # Vertical slice tests using mock ports
│   ├── app/      # GetScheduleWithDDayUseCase.test.ts
│   └── ui/       # useAppStore.test.ts, useScheduleDDayState.test.ts
└── integration/  # Real adapter and endpoint integration tests
    └── infra/    # HonoScheduleApi.test.ts, HttpScheduleRepository.test.ts, LruCacheAdapter.test.ts
```

## BDD Scenario Convention

Structure each test suite with descriptive features and scenarios:

```typescript
describe('[Level / Layer] Feature: ComponentName', () => {
  describe('Scenario: Specific user or system behavior', () => {
    it('Given [precondition], When [action], Then [expected outcome]', () => {
      // Given
      // When
      // Then
    })
  })
})
```

## Test Commands

- All tests: `pnpm test`
- Domain Unit tests: `pnpm test:unit`
- Slice tests: `pnpm test:slice`
- Integration tests: `pnpm test:integration`

## Markdown UI Regression

- For TSX rendering in Node tests, import `test/helpers/registerTsx.ts` before dynamically importing components, then use React's `renderToStaticMarkup`.
- Exercise the actual `MarkdownView`: Korean particles adjoining quoted/parenthesized emphasis, nested emphasis, code, escapes, links, and raw HTML safety. Assert semantic HTML and unchanged visible text.
