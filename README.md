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

API 地址通过 `TARO_APP_API_BASE_URL` 配置。微信开发者工具本机联调示例：

```powershell
$env:TARO_APP_API_BASE_URL='http://127.0.0.1:8000'
npm run dev:weapp
```

真机联调时需改成手机可访问的开发地址，并重新编译小程序。

Build output: `frontend/dist`.

Typecheck/build:

```bash
cd frontend
npm run typecheck
npm run build:weapp
```

## Backend development

后端要求 Python 3.11+。推荐通过 `uv` 创建隔离环境：

```powershell
cd backend
uv venv .venv --python 3.13
uv pip install --python .venv/Scripts/python.exe -r requirements.txt
& '.venv/Scripts/python.exe' -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

macOS/Linux 使用对应的 `.venv/bin/python`。启动后访问
`http://127.0.0.1:8000/health` 检查健康状态。

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
