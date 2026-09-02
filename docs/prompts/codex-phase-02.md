# Codex Handoff — Phase 2

Read these files first, in order:

1. `AGENTS.md`
2. `HARNESS.md`
3. `harness/manifest.yaml`
4. `specs/phase-02-backend-contract.md`
5. `docs/api-phase-02.md`
6. existing Phase 1 implementation
7. `docs/decisions.md`

Then implement **only Phase 2 — Backend Contract**.

## Goal

Preserve the accepted Phase 1 mini-program UX while moving the deterministic mock coaching decision behind FastAPI:

```text
Taro
→ HTTP
→ FastAPI
→ deterministic mock coaching service
→ typed response
→ existing Coach UI
```

## Required implementation

- Add Python 3.11+ FastAPI backend.
- Add explicit Pydantic request/response models.
- Add an in-memory repository abstraction.
- Implement the six endpoints from `docs/api-phase-02.md`.
- Attempt 1 result must be `retry` with exactly one primary issue and one action.
- Attempt 2 result must be `compare`.
- Add backend tests for the contract.
- Add a typed frontend API service.
- Make API base URL configurable.
- Remove local attempt-based coaching-result selection from `CoachPage`.
- Preserve local Taro Storage for the user's real Before/After images.
- Add loading and recoverable network-error UI.
- Update README/backend docs with startup instructions.

## Forbidden

Do not implement or install:

- OpenAI/Qwen/Gemini/DeepSeek/model SDKs;
- real AI/Vision;
- LangGraph;
- database/ORM;
- Redis/BullMQ/queues/WebSocket;
- RAG/vector DB;
- object storage/COS;
- login/auth;
- Home/Growth;
- extra photography skills.

Do not make the FastAPI server attempt to read `wxfile://` or Taro temporary paths. In Phase 2, `imageClientRef` is opaque metadata only.

## Validation

When implementation is complete, run from repository root:

```bash
bash scripts/verify-phase2.sh
```

Fix all failures.

Then report:

1. files changed;
2. API endpoints implemented;
3. tests added and result;
4. frontend typecheck/build result;
5. any manual verification still required.

Stop after Phase 2. Do not start Phase 3.
