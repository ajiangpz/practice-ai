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
