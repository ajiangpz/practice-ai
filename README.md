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
4. `specs/phase-01-mock-killer-loop.md` — current implementation spec
5. `docs/prompts/codex-phase-01.md` — prompt to give Codex

## Current phase

**Phase 1 — Mock Killer Loop**

```text
Practice
→ Capture #1
→ Mock Retry
→ Capture #2
→ Before / After
→ Complete
```

Phase 1 intentionally has no backend, real AI, database or LangGraph.

## 本地开发

环境要求：Node.js 18+、npm，以及用于预览真机交互的微信开发者工具。

```bash
cd frontend
npm install
npm run dev:weapp
```

开发构建持续输出到 `frontend/dist`。在微信开发者工具中导入仓库内的
`frontend` 目录即可预览；当前 `project.config.json` 使用游客 AppID，真机能力请按本地
微信开发者工具配置处理。

## 类型检查与生产构建

```bash
cd frontend
npm run typecheck
npm run build:weapp
```

生产构建同样输出到 `frontend/dist`。

## Verification contract

从仓库根目录执行完整 Phase 1 自动验证：

```bash
bash scripts/verify-phase1.sh
```

The script checks required files, TypeScript validation and WeChat Mini Program build. Manual acceptance is still required for the actual interaction flow.

## Codex handoff

After cloning the repository, give Codex the contents/instruction in:

```text
docs/prompts/codex-phase-01.md
```

Codex should stop after Phase 1 passes and must not automatically continue to Phase 2.
