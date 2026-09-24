---
name: clean-architecture-ts
description: Design, organize, or refactor TypeScript applications using Clean Architecture layers: domain, app, infra, and ui.
---

# Clean Architecture in TypeScript

Use this skill when designing module boundaries, structuring directories, managing dependency inversion (ports & adapters), or refactoring application layers.

## Layer Boundaries & Dependency Rules

Dependencies must strictly point inwards: `ui` / `infra` ➔ `app` ➔ `domain`.

```
src/
├── domain/     # Core business logic, Entities, Value Objects, Port interfaces
│   ├── models/ # CalendarDate, DDay, Schedule
│   └── ports/  # ScheduleRepository, TimeProvider, CachePort
│
├── app/        # Use cases and DTOs orchestrating domain rules
│   ├── dto/    # Plain serializable DTOs
│   └── usecases/ # GetScheduleWithDDayUseCase
│
├── infra/      # External adapters, network clients, time providers, loggers, caches
│   ├── api/    # HttpScheduleRepository (ky), StaticScheduleRepository
│   ├── cache/  # LruCacheAdapter (lru-cache)
│   ├── logger/ # pino structured logger
│   └── time/   # KoreaTimeProvider (Intl.DateTimeFormat)
│
└── ui/         # User interface, React components, state, hooks
    ├── components/ # Presentation cards, navbar, header
    ├── hooks/      # React Query + custom state hooks
    ├── pages/      # Route pages
    └── store/      # Zustand client stores
```

## Key Principles

1. **Domain Independence**: The `domain/` layer must NEVER import from `infra/`, `ui/`, or framework libraries (React, Vite, ky, Zustand).
2. **Ports & Adapters**: Define abstract interfaces in `domain/ports/` and implement concrete adapters in `infra/`.
3. **Use Cases for Business Flows**: Keep business coordination in `app/usecases/` and deliver plain DTOs to the UI.
