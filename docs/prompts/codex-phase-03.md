# Codex Handoff — Phase 3

Read the repository instructions before editing code.

Required reading order:

1. `AGENTS.md`
2. `HARNESS.md`
3. `harness/manifest.yaml`
4. `specs/phase-03-real-vision-evaluation.md`
5. `docs/api-phase-03.md`
6. `docs/rubrics/bg01-background-control.md`
7. `docs/product.md`
8. `docs/architecture.md`
9. `docs/decisions.md`

Then implement **only Phase 3 — Real Vision Evaluation**.

## Required outcome

Replace Phase 2 deterministic coaching with real multimodal evaluation for `BG-01 / background_control` only:

```text
Taro chooseMedia
→ multipart upload
→ FastAPI
→ VisionProvider
→ BG-01 rubric
→ Pydantic-validated evaluation
→ pass / retry / uncertain UI
```

## Mandatory constraints

- Keep the accepted Practice/Capture/Coach product flow.
- Use real image bytes; do not pretend `wxfile://` is server-readable.
- Use a provider abstraction in `backend/app/vision/`.
- Implement at least one real configurable vision adapter.
- Prefer a configurable OpenAI-compatible HTTP adapter with `httpx` unless repository/environment evidence justifies another adapter.
- Use environment variables for base URL, API key, model and timeout.
- No API key or provider URL hardcoding.
- Backend tests must use a fake provider and must not consume paid API calls.
- All model output must validate through explicit Pydantic schemas before entering business/UI state.
- RETRY: exactly one primary issue + one action.
- PASS: no coaching action.
- UNCERTAIN: no invented coaching action; ask for better evidence.
- Do not expose raw model output or hidden reasoning.
- Do not log image bytes, base64 payloads or API keys.
- Do not add LangGraph, DB/ORM, COS/object storage, Redis, queues, WebSocket, RAG, authentication, Home/Growth or extra photography skills.
- Do not implement semantic Before/After comparison or action-effectiveness replanning yet; those belong to Phase 4.
- Do not silently fall back to Phase 2 mock results when provider calls fail.

## Provider behavior

Add a clear provider interface/protocol and dependency boundary. The application should start without a live key so automated tests can run. A real evaluation request without configured provider credentials should return a clear recoverable service error.

If the live provider returns malformed structured data, allow at most one controlled repair/retry and then fail safely.

## Frontend behavior

- Replace JSON `imageClientRef` submission with real multipart upload using `Taro.uploadFile` or equivalent.
- Preserve local image paths for UI rendering.
- Render `retry`, `pass`, `uncertain`, loading and recoverable error states explicitly.
- Attempt 1 PASS may finish directly.
- Attempt 2 PASS after a retry may show the real Before/After images, but wording must only say the second photo passes the target. Do not claim causal improvement until Phase 4.

## Tests

Add/adjust tests required by the Phase 3 spec. No live secrets should be required for automated verification.

When implementation is complete, run from repository root:

```bash
bash scripts/verify-phase3.sh
```

Fix every failure.

Then stop. Do not begin Phase 4.

In your final report, include:

- files/architecture changed;
- provider configuration variables;
- automated test/build results;
- exact commands for live provider manual verification;
- any decision recorded in `docs/decisions.md`;
- remaining manual acceptance items.
