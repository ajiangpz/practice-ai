# Decisions

Record non-trivial implementation decisions here. Do not rewrite history; append entries.

## ADR-0001 — Harness-first development

**Date:** 2026-09-01

**Decision:** Establish repository instructions, active-phase scope, acceptance criteria and verification commands before generating application code.

**Why:** The product depends on a narrow behavioral loop. An unconstrained coding agent could easily overbuild infrastructure or turn the product into an AI chat/photo-scoring app.

**Consequence:** Codex must follow `AGENTS.md`, `harness/manifest.yaml` and the active phase spec. Later phases remain locked until explicitly advanced.

---

## ADR-0002 — Phase 1 is frontend-only

**Date:** 2026-09-01

**Decision:** Prove the Practice → Capture → Retry → Re-capture → Compare loop with mock evaluation before adding FastAPI or real AI.

**Why:** Product interaction risk is higher than infrastructure risk at this stage.

**Consequence:** No backend, database, LangGraph or AI dependencies are allowed in Phase 1.

---

## ADR-0003 — One coaching action per attempt

**Date:** 2026-09-01

**Decision:** Each coach response exposes at most one primary issue and one immediate action.

**Why:** The product teaches by focused deliberate practice rather than broad critique.

**Consequence:** UI and future AI schemas must preserve this constraint.

---

## ADR-0004 — Phase 1 scope guard ignores package-manager lockfiles

**Date:** 2026-09-01

**Problem:** Taro's build/dev toolchain includes transitive development packages whose lockfile metadata contains `websocket`, even though the application has no WebSocket dependency or runtime feature. The original recursive text guard treated that metadata as a Phase 1 scope violation.

**Options considered:** Remove the lockfile, allow the false positive, or keep the lockfile and limit the text guard to implementation/direct dependency files.

**Decision:** Keep the reproducible npm lockfile and exclude standard package-manager lockfiles from the forbidden-concept text scan. Source files and `package.json` remain in scope for the guard.

**Impact on acceptance criteria:** The no-WebSocket product constraint remains enforced without rejecting Taro's build tooling. No product behavior or Phase 1 scope changes.

---

## ADR-0005 — Phase 1 manually accepted; advance to backend contract

**Date:** 2026-09-02

**Problem:** Phase 1 automated structure/build checks are not sufficient to prove the actual mini-program photo-selection and Before/After interaction.

**Decision:** Treat the user's successful manual run of the Phase 1 flow as the human acceptance gate and advance the harness to Phase 2.

**Consequence:** Phase 1 UX becomes a regression contract. Phase 2 may move state/evaluation behind HTTP but must not redesign the accepted coaching flow.

---

## ADR-0006 — Phase 2 image references remain opaque

**Date:** 2026-09-02

**Problem:** WeChat temporary image paths such as client-local file references are not directly readable by a remote FastAPI server, while real image upload/storage belongs with Vision integration rather than the backend-contract phase.

**Options considered:** Add local-file upload now, add cloud object storage now, or keep the image reference as opaque metadata until Phase 3.

**Decision:** In Phase 2, the frontend sends an `imageClientRef` only to satisfy the API contract. The backend stores it but does not read or inspect it. Real image transport is deferred to Phase 3.

**Impact on acceptance criteria:** Phase 2 cleanly validates the frontend/backend boundary without pretending to perform image analysis or introducing disposable storage infrastructure.

---

## ADR-0007 — Recover current action after in-memory backend restart

**Date:** 2026-09-02

**Problem:** The Phase 2 repository is intentionally ephemeral, while manual acceptance requires a network failure to be recoverable after the backend is restarted. A restarted process no longer knows the persisted client-side practice ID.

**Options considered:** Force the user to restart the whole exercise, retain a hidden durable backend store, or recreate the server-side practice when the current operation receives a practice `404`.

**Decision:** Keep the backend strictly in memory. On an operation-specific `404`, the frontend creates a replacement `BG-01` practice, persists its new ID, and retries the current submission or completion once. Ordinary network errors remain visible with an explicit retry action.

**Impact on acceptance criteria:** The accepted photo flow remains recoverable without introducing a database or changing the deterministic result contract.
