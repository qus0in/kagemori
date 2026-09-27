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
- Exercise the actual `MarkdownView`: Korean particles adjoining quoted/parenthesized emphasis, nested emphasis, code, escapes, links, raw HTML safety, GFM tables, and KaTeX math (`$...$`, block `$$`). Assert semantic HTML and unchanged visible text.

## Storage, Async and Model Tests

- `test/helpers/storageHarness.ts`: `sqliteD1()` applies every migration and queues batches (D1 accepts concurrent batches; SQLite cannot nest transactions). `memoryDOState()` backs `StudySessionDO`.
- Background generation: drive `/prepare` explicitly, assert `/next` returns 202 while preparing and that locked (`?existing=1`) slots are never replaced. Simulate write races with a second repository instance on the same DO.
- UI polling: use small `retryAfterMs` in fake repositories and assert both the wait state and the opt-out path.
- Model adapters: mock `fetch` and assert model URL, JSON mode (none for Gemma), hidden answer keys and parsing. Real Gemini calls cost money; run them only from a scratchpad script when the user asks.
