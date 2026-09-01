# AGENTS.md

## Mission

Build **练一下 · 手机摄影 (Practice AI)** as an AI learning-by-doing mini program. The product is not a chat assistant and not a photography scoring app.

Core loop:

```text
Practice → Capture → Evaluate → One concrete action → Re-capture → Compare → Complete
```

## Source of truth

Read in this order before changing code:

1. `HARNESS.md`
2. `harness/manifest.yaml`
3. `specs/phase-01-mock-killer-loop.md`
4. `docs/product.md`
5. `docs/architecture.md`
6. `docs/decisions.md`

If documents conflict, `harness/manifest.yaml` and the active phase spec win.

## Current phase

Current phase: **Phase 1 — Mock Killer Loop**.

Only implement:

```text
Practice
→ Capture #1
→ Mock Retry
→ Capture #2
→ Before / After Compare
→ Complete
```

## Hard constraints

- Taro 4 + React + TypeScript + Sass.
- No backend in Phase 1.
- No real AI in Phase 1.
- No database in Phase 1.
- No LangGraph in Phase 1.
- No RAG, Multi-Agent, WebSocket, Redis, BullMQ.
- Only one skill: `BG-01 / background_control`.
- Use `Taro.chooseMedia()` for camera/album input.
- Persist essential Phase 1 state with Taro Storage.
- UI must be state-driven by TypeScript types, never inferred from free-form text.
- No AI chat page or chatbot-style UI.
- Each coaching step shows at most one primary issue and one immediate action.
- Before/After must use the user's two real selected/captured images.
- Do not copy source code from reference projects. References may inform architecture only.

## Development loop

For every task:

```text
Read spec
→ inspect existing implementation
→ make the smallest coherent change
→ run validation
→ fix failures
→ update docs when behavior changes
→ commit only after gates pass
```

Do not silently broaden scope.

## Stop conditions

Stop and document in `docs/decisions.md` before continuing when:

- the requested implementation contradicts the active phase spec;
- a new dependency is required but not justified by the current phase;
- WeChat/Taro API behavior is uncertain and affects correctness;
- a change would introduce backend/AI/data infrastructure before its phase;
- acceptance criteria cannot be met without changing product behavior.

## Phase 1 validation

Before declaring Phase 1 complete:

```bash
bash scripts/verify-phase1.sh
```

All checks must pass. Do not proceed to Phase 2 automatically.
