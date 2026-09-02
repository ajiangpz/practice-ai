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
3. `specs/phase-03-real-vision-evaluation.md`
4. `docs/api-phase-03.md`
5. `docs/rubrics/bg01-background-control.md`
6. `docs/product.md`
7. `docs/architecture.md`
8. `docs/decisions.md`

If documents conflict, `harness/manifest.yaml` and the active phase spec win.

## Current phase

Current phase: **Phase 3 — Real Vision Evaluation**.

Phase 1 and Phase 2 have passed manual acceptance. Phase 3 replaces deterministic mock coaching with real multimodal evaluation for the same single practice.

Only implement:

```text
Taro photo
→ real multipart upload
→ FastAPI
→ VisionProvider
→ BG-01 rubric
→ validated pass / retry / uncertain
→ existing focused Coach UI
```

## Hard constraints

- Keep Taro 4 + React + TypeScript + Sass.
- Keep Python 3.11+ + FastAPI + Pydantic.
- Only `BG-01 / background_control`.
- Use real image bytes, not opaque `imageClientRef` pretending to be model-readable.
- Create a provider abstraction under `backend/app/vision/`.
- Implement at least one real configurable multimodal provider adapter.
- Prefer a configurable OpenAI-compatible HTTP adapter unless repository/environment evidence justifies another adapter.
- Provider settings/secrets come only from environment configuration.
- Automated tests use a fake provider and must not require paid API calls.
- All live model output must pass Pydantic validation before it becomes business/UI state.
- RETRY: exactly one primary issue and one immediate action.
- PASS: no coaching action.
- UNCERTAIN: no invented action; request better evidence.
- Do not expose raw provider output, hidden reasoning, API keys or image bytes.
- No silent fallback to deterministic Phase 2 mock results.
- No database/ORM or permanent image storage.
- No LangGraph/LangChain in Phase 3.
- No RAG, vector DB, web search, Multi-Agent, Redis, BullMQ, queues or WebSocket.
- No Home/Growth/login/sharing/extra skills.
- No semantic Before/After comparison or action-effectiveness replanning yet; those belong to Phase 4.
- Do not copy source code, prompts, branding or UI from reference projects.

## Active rubric

Read `docs/rubrics/bg01-background-control.md` before changing evaluation logic.

The model is not asked whether a photo is attractive. It only checks:

```text
subject_clear
background_distraction
subject_background_separation
```

PASS means only that the current practice target is satisfied.

## Development loop

```text
Read active spec/rubric
→ inspect Phase 2 implementation
→ make smallest coherent change
→ backend tests with fake provider
→ frontend typecheck/build
→ bash scripts/verify-phase3.sh
→ fix failures
→ live-provider manual acceptance
→ stop
```

Do not silently broaden scope.

## Stop conditions

Stop and document in `docs/decisions.md` before continuing when:

- the requested change conflicts with the active Phase 3 spec;
- provider API behavior requires a material contract change;
- a new dependency is required outside Phase 3 scope;
- implementation would add DB/object storage/LangGraph/queue infrastructure;
- reliable evaluation cannot be achieved without changing the BG-01 rubric;
- acceptance criteria require claiming Before/After improvement without actually comparing both images.

## Phase 3 validation

Before declaring Phase 3 complete:

```bash
bash scripts/verify-phase3.sh
```

Automated checks must pass without live credentials. Then manually verify real photos with a configured live provider. Do not proceed to Phase 4 automatically.
