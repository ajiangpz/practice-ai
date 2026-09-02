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

Read first:

1. `AGENTS.md`
2. `HARNESS.md`
3. `harness/manifest.yaml`
4. `specs/phase-03-real-vision-evaluation.md`
5. `docs/api-phase-03.md`
6. `docs/rubrics/bg01-background-control.md`
7. `docs/prompts/codex-phase-03.md`

## Current phase

**Phase 3 — Real Vision Evaluation**

Phase 1 and Phase 2 have passed manual acceptance.

Phase 3 replaces the deterministic backend mock with a real multimodal evaluator for the single practice `BG-01 / background_control`:

```text
Practice
→ Capture real photo
→ multipart upload
→ FastAPI
→ VisionProvider
→ BG-01 rubric
→ pass / retry / uncertain
→ Complete or re-capture
```

Phase 3 still has **no LangGraph, no database, no permanent image storage, no RAG and no extra photography skills**.

## Frontend development

Environment: Node.js 18+, npm, WeChat Developer Tools.

```bash
cd frontend
npm install
npm run dev:weapp
```

API base URL:

```powershell
$env:TARO_APP_API_BASE_URL='http://127.0.0.1:8000'
npm run dev:weapp
```

For real-device testing use an address reachable by the phone and rebuild the mini-program.

Typecheck/build:

```bash
cd frontend
npm run typecheck
npm run build:weapp
```

## Backend development

Python 3.11+.

```powershell
cd backend
uv venv .venv --python 3.13
uv pip install --python .venv/Scripts/python.exe -r requirements.txt
& '.venv/Scripts/python.exe' -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

macOS/Linux use `.venv/bin/python`.

## Vision provider configuration

Phase 3 requires at least one real provider adapter but keeps provider configuration outside source code.

Recommended environment contract:

```text
VISION_PROVIDER=openai_compatible
VISION_API_BASE_URL=https://example-provider/v1
VISION_API_KEY=...
VISION_MODEL=...
VISION_TIMEOUT_SECONDS=30
```

The exact live endpoint/model depends on the configured provider. Never commit credentials.

Automated tests must run without these live credentials by using a fake provider.

## Phase 3 verification

From repository root:

```bash
bash scripts/verify-phase3.sh
```

This gate checks backend tests without a live key, Phase 3 scope constraints, frontend typecheck and WeChat build.

A separate manual acceptance is required with a configured live vision provider and real BG-01 photos.

## Codex handoff

```text
Read AGENTS.md and HARNESS.md first, then harness/manifest.yaml,
specs/phase-03-real-vision-evaluation.md, docs/api-phase-03.md,
docs/rubrics/bg01-background-control.md and docs/prompts/codex-phase-03.md.
Implement only Phase 3, run bash scripts/verify-phase3.sh, fix all failures,
report live-provider setup/manual verification steps, then stop.
```

Do not automatically continue to Phase 4.
