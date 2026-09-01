# AGENTS.md

## Project

“练一下 · 手机摄影”是一个 AI 实践型手机摄影教练。核心闭环：

```text
现实拍摄任务
→ 用户拍照
→ 按当前训练 Rubric 检查
→ 只给一个最值得改的动作
→ 用户重拍
→ Before / After 验证
→ 更新 Skill State
→ 决定下一练
```

## Current phase

当前只执行 **Phase 1 — Mock Killer Loop**：

```text
Practice
→ Capture #1
→ Mock Retry
→ Capture #2
→ Before / After
→ Complete
```

## Hard constraints for Phase 1

1. 只使用 Taro 4 + React + TypeScript + Sass。
2. 不实现 backend。
3. 不接真实 AI。
4. 不安装或使用 LangGraph。
5. 不实现数据库。
6. 不加入 Zustand，优先使用 React state + Taro Storage。
7. 不增加其他摄影 Skill，只实现 `BG-01 background_control`。
8. 使用 `Taro.chooseMedia()` 支持拍照和相册选图。
9. 第一次提交 Mock `retry`，第二次提交 Mock `compare/pass`。
10. Before / After 必须来自用户两次真实选择/拍摄的图片，不使用占位图替代业务数据。
11. 业务状态必须使用 TypeScript 类型定义，禁止根据自由文本推断页面状态。
12. UI 不做 Chat 风格；不要加入 AI 聊天页、机器人、紫黑渐变、发光球、玻璃拟态。
13. 照片应是页面视觉中心；风格为摄影杂志 + 极简训练 App。
14. 每轮 Coach 最多展示一个主要问题和一个具体动作。
15. 不提前实现 Home、Growth、RAG、Multi-Agent、WebSocket、Redis、BullMQ。
16. 如实现与规格冲突，先记录到 `docs/decisions.md`，再做最小必要调整。

## Phase 1 required routes

- `/pages/practice/index`
- `/pages/capture/index`
- `/pages/coach/index`

## Required business types

至少定义：

- `Practice`
- `Submission`
- `CoachState`
- `CoachResult`

`CoachState` 至少包含：

```ts
type CoachState = 'retry' | 'pass' | 'compare' | 'uncertain'
```

## BG-01 fixed practice

- ID: `BG-01`
- Skill: `background_control`
- Title: `背景做减法`
- Objective: `让主体后面的背景更干净`
- Max attempts: `3`

任务文案：

> 找一个不会移动的东西，比如杯子、植物或电脑。不要移动主体，只改变自己的拍摄位置，让背景里少一个明显干扰物。

## Mock behavior

Attempt 1：

```json
{
  "state": "retry",
  "positiveObservation": "主体已经比较明确",
  "primaryIssue": {
    "type": "background_distraction",
    "description": "右后方的干扰物比较抢眼"
  },
  "action": {
    "type": "move_left",
    "instruction": "不要移动主体，向左移动一步，再拍一次。"
  }
}
```

Attempt 2：进入 `compare`，展示真实 Before / After，并显示：

- `背景控制`
- `需要练习 → 通过`
- `改变机位后，主体后方的干扰减少了。`

## Persistence

Phase 1 允许使用 `Taro.setStorageSync` / `Taro.getStorageSync` 保存：

- 当前 attempt
- before temp image path
- after temp image path
- 当前 practice 状态

确保页面跳转、返回或重新进入后，核心流程不会立刻丢失。

## Validation before finishing

完成 Phase 1 前必须：

1. 运行 TypeScript type check。
2. 运行微信小程序构建命令。
3. 修复所有构建错误。
4. 更新 README，写清安装、开发、构建方法。
5. 不进入 Phase 2。
