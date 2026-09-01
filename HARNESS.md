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

## Quality gates

Phase 1 requires:

- required page files exist;
- TypeScript type check passes;
- WeChat Mini Program build passes;
- `Practice → Capture → Retry → Capture → Compare → Complete` is implemented;
- core flow state survives page navigation/re-entry via Taro Storage;
- no backend/AI/LangGraph/database dependency exists;
- README documents install, dev and build steps.

Automated checks are run by `scripts/verify-phase1.sh`. Visual/user-flow checks remain manual until automated mini-program testing is introduced in a later phase.

## Change discipline

When implementation requires deviating from a spec, do not hide the deviation in code. Add a dated entry to `docs/decisions.md` with:

- problem;
- options considered;
- decision;
- impact on acceptance criteria.

## Competition originality

Reference projects may be studied for engineering patterns, but their source, branding, UI, prompts, data or business flow must not be copied. Track material external references in `docs/references.md`.
