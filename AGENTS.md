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
3. `specs/phase-02-backend-contract.md`
4. `docs/api-phase-02.md`
5. `docs/product.md`
6. `docs/architecture.md`
7. `docs/decisions.md`

If documents conflict, `harness/manifest.yaml` and the active phase spec win.

## Current phase

Current phase: **Phase 2 — Backend Contract**.

Phase 1 has passed manual acceptance. Phase 2 exists only to replace the frontend-local mock decision with a small FastAPI service while preserving the same user-visible flow.

Only implement:

```text
Taro Phase 1 UI
→ HTTP API
→ FastAPI
→ deterministic mock evaluation
→ same Retry / Compare UI states
```

## Hard constraints

- Keep the existing Taro 4 + React + TypeScript + Sass frontend.
- Backend: Python 3.11+ + FastAPI + Pydantic.
- No real AI in Phase 2.
- No Vision model SDK/API in Phase 2.
- No database in Phase 2; use an in-memory repository only.
- No LangGraph in Phase 2.
- No RAG, Multi-Agent, WebSocket, Redis, BullMQ, queue or vector database.
- Only one skill: `BG-01 / background_control`.
- Preserve the Phase 1 UI and coaching rule: one primary issue + one immediate action.
- Frontend business state must come from typed API responses, never from free-form text parsing.
- Phase 2 does not need to make the backend understand local `wxfile://` / temp image paths. The image reference is opaque mock metadata until Phase 3 introduces real image transport.
- Do not add Home, Growth, login, sharing or extra photography skills.
- Do not copy source code from reference projects. References may inform architecture only.

## Required backend contract

Implement at minimum:

```text
GET  /health
POST /api/v1/practices
GET  /api/v1/practices/{practice_id}
POST /api/v1/practices/{practice_id}/submissions
GET  /api/v1/submissions/{submission_id}/result
POST /api/v1/practices/{practice_id}/complete
```

The server must use explicit Pydantic request/response models and an in-memory repository abstraction.

Attempt 1 deterministically returns `retry`; attempt 2 deterministically returns `compare`. The frontend must consume those API responses instead of deciding the result locally.

## Development loop

For every task:

```text
Read spec
→ inspect existing implementation
→ make the smallest coherent change
→ run backend tests
→ run frontend typecheck/build
→ run phase verification
→ fix failures
→ update docs when behavior changes
→ stop after Phase 2 gates pass
```

Do not silently broaden scope.

## Stop conditions

Stop and document in `docs/decisions.md` before continuing when:

- the requested implementation contradicts the active phase spec;
- a new dependency is required but not justified by Phase 2;
- WeChat/Taro or FastAPI behavior is uncertain and affects correctness;
- a change would introduce real AI, database or LangGraph;
- acceptance criteria cannot be met without changing the Phase 1 product behavior.

## Phase 2 validation

Before declaring Phase 2 complete:

```bash
bash scripts/verify-phase2.sh
```

All automated checks must pass. Then manually verify the same mini-program flow with the backend running. Do not proceed to Phase 3 automatically.
