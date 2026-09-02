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
active phase spec
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

## Phase 1 status

Phase 1 — Mock Killer Loop has passed manual acceptance. Its behavior is now a regression contract: Phase 2 must preserve the same user-visible flow while moving mock evaluation behind HTTP.

## Phase 2 quality gates

Phase 2 requires:

- FastAPI backend exists and starts;
- explicit Pydantic API schemas exist;
- in-memory repository abstraction exists;
- required REST endpoints are implemented;
- backend tests cover health, create/get practice, attempt-1 retry, attempt-2 compare and complete;
- frontend evaluation result is fetched from the backend rather than selected locally by attempt;
- frontend still typechecks and builds as a WeChat Mini Program;
- no real AI, model SDK, database, LangGraph or queue infrastructure exists;
- README documents backend setup and the Phase 2 development flow.

Automated checks are run by `scripts/verify-phase2.sh`. Actual WeChat UI/network behavior remains a manual acceptance step.

## API evolution rule

Phase 2 deliberately treats the frontend image path/reference as opaque client metadata. The backend must not pretend it can read a WeChat temporary file path. Real image upload/storage and model-accessible image transport are deferred to Phase 3.

This avoids building fake image infrastructure only to replace it immediately when Vision evaluation is introduced.

## Change discipline

When implementation requires deviating from a spec, do not hide the deviation in code. Add a dated entry to `docs/decisions.md` with:

- problem;
- options considered;
- decision;
- impact on acceptance criteria.

## Competition originality

Reference projects may be studied for engineering patterns, but their source, branding, UI, prompts, data or business flow must not be copied. Track material external references in `docs/references.md`.
