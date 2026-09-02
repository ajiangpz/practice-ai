# Harness

This repository is developed with a **spec → implement → verify → document** harness so Codex can work autonomously without expanding scope or guessing product behavior.

## Harness goals

1. Keep the active phase small and testable.
2. Make product behavior explicit before code is written.
3. Give Codex deterministic stop conditions.
4. Turn acceptance criteria into executable checks where possible.
5. Keep architecture decisions and competition originality traceable.

## Workflow

```text
AGENTS.md
   ↓
harness/manifest.yaml
   ↓
active phase spec + rubric
   ↓
implementation
   ↓
scripts/verify-*.sh
   ↓
manual acceptance
   ↓
docs/decisions.md if anything changed
```

## Phase policy

Codex must work on only one phase at a time. A later phase is locked until the current phase passes its quality gates and a human explicitly asks to continue.

The current phase and allowed scope are declared in `harness/manifest.yaml`.

## Accepted regression baseline

Phase 1 — Mock Killer Loop and Phase 2 — Backend Contract have both passed manual acceptance.

The accepted product flow remains:

```text
Practice
→ Capture
→ focused Coach feedback
→ optional re-capture
→ local Before/After when relevant
→ Complete
```

Phase 3 may change where feedback comes from, but must not turn the product into chat, generic photo scoring or a broad photography course.

## Phase 3 quality gates

Phase 3 requires:

- real image bytes are transported from the mini-program to FastAPI;
- a `VisionProvider` abstraction exists;
- at least one real configurable multimodal provider adapter exists;
- no live credentials are required for automated tests;
- BG-01 has a written narrow rubric;
- provider output is converted into explicit Pydantic-validated structure;
- business decisions are `pass | retry | uncertain`;
- RETRY contains exactly one issue and one action;
- PASS contains no action;
- UNCERTAIN avoids invented corrections;
- raw image bytes are not permanently stored;
- provider/network failures are visible and recoverable;
- frontend still typechecks/builds for WeChat;
- no LangGraph, database, object storage, queue, RAG or extra skill is introduced.

Automated checks run through `scripts/verify-phase3.sh`. Real model behavior remains a manual acceptance gate because repository CI must not consume paid API credentials.

## Image transport rule

Phase 2 deliberately treated local image paths as opaque. Phase 3 ends that mock boundary: the frontend must upload actual image bytes.

The backend may hold those bytes only long enough to perform evaluation. Permanent image storage remains deferred.

## Model reliability rule

The model does not own business truth merely because it returns JSON. All output must pass schema validation and product invariants.

If live model output is malformed, allow at most one controlled repair attempt. On continued failure, surface a recoverable provider error. Never silently substitute the old deterministic mock result.

## Phase boundary to Phase 4

Phase 3 evaluates each submitted photo independently against BG-01.

It does **not** yet prove that the second photo improved because of the previous coaching action. Semantic Before/After comparison and action-effectiveness replanning are Phase 4 work.

## Change discipline

When implementation requires deviating from a spec, add a dated entry to `docs/decisions.md` with:

- problem;
- options considered;
- decision;
- impact on acceptance criteria.

## Competition originality

Reference projects may inform engineering patterns only. Do not copy their source, branding, UI, prompts, datasets or business flow. Track material external references in `docs/references.md`.
