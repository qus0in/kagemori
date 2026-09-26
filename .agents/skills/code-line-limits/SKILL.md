---
name: code-line-limits
description: Inspect, enforce, and refactor code and document files to adhere to 128-line modular limits and 1000-line hard limits.
---

# Code Line Limits & Refactoring Skill

Use this skill to inspect file/function lengths, prevent module bloating, and refactor files exceeding 128 lines (modular soft limit) or 1000 lines (absolute hard limit).

## Core Limits & Rules

1. **128-Line Limit (Soft/Modular Limit)**:
   - Target: `src/**/*.ts`, `src/**/*.tsx`, and individual functions/methods.
   - Files or functions > 128 lines must be refactored into smaller single-responsibility submodules.
   - In standard checks, `src` files > 128 lines trigger warnings and refactoring recommendations.
2. **1000-Line Limit (Hard Limit)**:
   - Target: All repository files (`src`, `test`, `docs`, `.agents`).
   - Any file > 1000 lines triggers a build/check failure (Exit Code 1).

## Commands

- Check file and function line counts: `pnpm check:lines`
- Strict mode (fail if any `src` file exceeds 128 lines): `pnpm check:lines --strict`
- Show refactoring improvement suggestions: `pnpm check:lines --suggest`

## Refactoring / Improvement Strategies

When a file exceeds or approaches 128 lines, apply these clean-architecture refactoring patterns:

1. **Domain Layer**:
   - Extract validation logic into dedicated helper files (e.g., `QuestionValidation.ts`).
   - Separate complex type definitions into `*Types.ts` (e.g., `PracticeSessionTypes.ts`).
2. **App Layer (Use Cases)**:
   - Extract coordination sub-steps into domain services or usecase helpers (e.g., `SubmitAnswerExplanationHelper.ts`).
3. **Infra Layer (Repositories & Adapters)**:
   - Extract large seed data into separate seed chunks (e.g., `SeedQuestionsPart1.ts`).
   - Extract query builders or payload mappers into separate mapper modules.
4. **UI Layer (Components & Hooks)**:
   - Split large components into smaller atomic subcomponents (e.g., `QuestionCardHeader`, `QuestionOptionList`).
   - Extract stateful logic and action handlers into custom hooks (e.g., `useStudyNextAction.ts`).
   - Extract constants, styles, or dictionary objects into separate files.
