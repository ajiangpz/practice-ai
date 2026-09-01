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

## Verification contract

Once the frontend has been generated and Phase 1 implemented:

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
