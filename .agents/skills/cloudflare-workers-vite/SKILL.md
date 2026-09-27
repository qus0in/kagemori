---
name: cloudflare-workers-vite
description: Develop, preview, or deploy full-stack Cloudflare Workers applications combined with Vite, Hono backend, and static assets.
---

# Cloudflare Workers + Vite Full-Stack Skill

Use this skill when configuring Vite, running local full-stack development, building Workers bundles, or executing Cloudflare deployments with Wrangler.

## Architecture

- **Single Dev Server**: Run Vite development server on port `5173` with `strictPort: true` using `@cloudflare/vite-plugin`.
- **Same-Origin API**: Route `/api/*` requests to the Hono Worker in `worker/index.ts`. All other routes serve React SPA static assets.
- **SPA Routing**: Configure `assets.not_found_handling: "single-page-application"` in `wrangler.jsonc`.

## Commands

- Dev Server: `pnpm dev`
- Type Check: `pnpm check`
- Production Build: `pnpm build`
- Deploy to Cloudflare: `pnpm deploy` (or `pnpm build && wrangler deploy`)

## Deployment Policy

- **On-Demand Only**: Deploy to Cloudflare ONLY when explicitly requested by the user. Never deploy automatically.
- Before deploying, verify authentication with `wrangler whoami`.
- After deploy, check root URL (`/`), `/api/schedule` and `/api/study/coverage`. Create missing Vectorize/R2 resources only as part of an explicitly requested deployment.

## Study Storage

- Follow ADR 0006 and `docs/operations/study-storage.md`: DO transactions own session progression, D1 stores global attempt history, KV stores optional session metadata, the `ai:` Gemini response cache and `diagram:auto:` structured diagrams/image pointers only; R2 `DIAGRAM_BUCKET` holds generated images. Vectorize `QUESTION_INDEX` holds question embeddings; code must degrade when it is missing.
- Validate new migrations (currently through 0005) locally; apply them before an explicitly requested deployment. Never mask persistent storage failures with local state.
- Long-running AI work (question drafting ≈40s) must not rely on `waitUntil`, which ends about 30s after the response. Use a client-triggered request such as `POST /session/:id/prepare` and keep sessions answerable with fallbacks.
- DO session updates are either an answer (attempts +1, plan unchanged) or plan-only (slot lock/swap/status). Reload and retry on revision conflicts with `updateSessionWithRetry`.
