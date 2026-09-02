# 练一下 · 手机摄影（Practice AI）

AI 实践型手机摄影教练。

核心体验：

```text
现实拍摄任务
→ 拍照
→ 按本关 Rubric 检查
→ 只给一个具体动作
→ 重拍
→ Before / After 验证
→ 更新技能状态
```

## Development model

This repository uses a harness-first workflow for Codex-assisted development.

Start here:

1. `AGENTS.md` — coding-agent rules
2. `HARNESS.md` — development harness
3. `harness/manifest.yaml` — active scope and quality gates
4. `specs/phase-02-backend-contract.md` — current implementation spec
5. `docs/api-phase-02.md` — current API contract
6. `docs/prompts/codex-phase-02.md` — prompt to give Codex

## Current phase

**Phase 2 — Backend Contract**

Phase 1 — Mock Killer Loop has passed manual acceptance.

Phase 2 keeps the accepted UI flow but moves deterministic mock coaching behind FastAPI:

```text
Practice
→ Capture #1
→ FastAPI mock Retry
→ Capture #2
→ FastAPI mock Compare
→ Before / After
→ Complete
```

Phase 2 intentionally has **no real AI, no database and no LangGraph**.

## Frontend development

Environment: Node.js 18+, npm, WeChat Developer Tools for manual mini-program verification.

```bash
cd frontend
npm install
npm run dev:weapp
```

Build output: `frontend/dist`.

Typecheck/build:

```bash
cd frontend
npm run typecheck
npm run build:weapp
```

## Backend development — Phase 2 target

Codex will create a Python 3.11+ FastAPI backend under `backend/`.

Expected setup after implementation:

```bash
cd backend
python -m venv .venv
# activate the virtual environment
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The exact Python launcher may be `python3` depending on environment.

Phase 2 backend is intentionally ephemeral and uses an in-memory repository only.

## Phase 2 verification

After Codex implements Phase 2, run from repository root:

```bash
bash scripts/verify-phase2.sh
```

This gate checks backend imports/tests, Phase 2 scope constraints, frontend typecheck and WeChat build. Manual acceptance is still required with the backend actually running.

## Codex handoff

Give Codex this instruction:

```text
Read AGENTS.md and HARNESS.md first, then harness/manifest.yaml,
specs/phase-02-backend-contract.md, docs/api-phase-02.md and
docs/prompts/codex-phase-02.md. Implement only Phase 2, run
bash scripts/verify-phase2.sh, fix all failures, then stop.
```

Do not automatically continue to Phase 3.
