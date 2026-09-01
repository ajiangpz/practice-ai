# 「练一下 · 手机摄影」MVP 开发计划

## Product goal

「练一下」是一个 AI 实践型手机摄影教练。用户每天只练一个摄影能力：

```text
完成现实拍摄任务
→ 上传照片
→ AI 按当前训练目标判断
→ 只给一个最值得修改的动作
→ 用户重拍
→ AI 比较 Before / After
→ 更新技能状态
→ 决定下一次练习
```

第一阶段只验证 `BG-01 背景做减法` Killer Loop。

---

## Tech direction

| Layer | Technology |
|---|---|
| Mini Program | Taro 4 |
| UI | React + TypeScript + Sass |
| Backend | FastAPI（Phase 2） |
| AI | Multimodal Vision Provider Adapter（Phase 3） |
| Agent | LangGraph（在真实 Vision + Compare + Replan 验证后） |
| Data | MySQL（后期） |
| Image | COS / Cloud storage（后期） |

原则：前端业务状态由结构化数据驱动，不允许直接把 LLM 自由文本作为状态机。

---

# Phase 1 — Mock Killer Loop

## Goal

完全不接 AI、不接后端，在微信开发者工具中跑通：

```text
Practice
→ Capture #1
→ Mock Retry
→ Capture #2
→ Before / After Compare
→ Complete
```

### Required pages

- `/pages/practice/index`
- `/pages/capture/index`
- `/pages/coach/index`

### Practice

固定：

- `templateId = BG-01`
- `skill = background_control`
- `title = 背景做减法`
- `objective = 让主体后面的背景更干净`
- `maxAttempts = 3`

任务：

> 找一个不会移动的东西，比如杯子、植物或电脑。不要移动主体，只改变自己的拍摄位置，让背景里少一个明显干扰物。

### Capture

使用 `Taro.chooseMedia()`：

```text
拍照/选图
→ Preview
→ 重新拍
→ 提交给 AI 教练
```

Phase 1 不上传服务器，使用 temp file path + Taro Storage。

### Coach Mock

Attempt 1：`retry`

```text
✓ 主体已经比较明确

先只改这一点
右后方的干扰物比较抢眼。

下一步
不要移动主体，向左移动一步，再拍一次。
```

Attempt 2：`compare`

```text
明显改善

Before → After

背景控制
需要练习 → 通过

改变机位后，主体后方的干扰减少了。
```

### Acceptance criteria

- Practice → Capture → Retry → Capture → Compare → Complete 可完整走通。
- Before / After 使用用户两次真实拍摄或选择的照片。
- 页面返回/重新进入时核心数据不能立即丢失。
- 没有 Chat UI。
- 每次 Coach 只展示一个主要问题和一个动作。
- TypeScript check 通过。
- 微信小程序 build 通过。
- README 写清开发和构建方式。

---

# Phase 2 — FastAPI backend

在 Phase 1 验收后执行。

目标：

```text
frontend
→ FastAPI
→ Mock Evaluation
```

建议最小 API：

```text
GET  /health
POST /api/v1/practices
GET  /api/v1/practices/:id
POST /api/v1/practices/:id/submissions
GET  /api/v1/submissions/:id/result
POST /api/v1/practices/:id/complete
```

先用内存 repository，不引入 MySQL。

---

# Phase 3 — Real Vision evaluation

只做 BG-01，不扩其他 Skill。

定义 Provider Adapter：

```python
class VisionProvider:
    async def evaluate(self, image_url: str, rubric: dict, context: dict) -> Evaluation:
        ...
```

业务代码不得绑定某一家模型。

### BG-01 rubric

只检查：

- `subject_clear`
- `background_distraction`
- `subject_background_separation`

通过条件：

```text
subject_clear == pass
AND
background_distraction == pass
```

禁止评价总体审美、色彩、白平衡、滤镜、艺术性等与本关无关的问题。

所有 LLM 输出必须经过 Pydantic Schema 校验后再进入业务逻辑。

---

# Phase 4 — Before / After compare

比较输入应基于：

```text
before rubric result
+
after rubric result
+
previous action
```

核心输出：

```ts
interface ComparisonResult {
  target: 'background_control'
  before: 'pass' | 'partial' | 'fail'
  after: 'pass' | 'partial' | 'fail'
  improved: boolean
  previousActionEffective: boolean
  summary: string
  decision: 'pass' | 'retry'
}
```

---

# Phase 5 — Replan

保存 `previousActions`。

如果一个动作没有改善，下一轮不得机械重复同一个动作。

最多 3 次 attempt。第三次仍未通过则标记 `needs_practice`，允许正常结束。

---

# Phase 6 — LangGraph

只有真实 Vision、Compare、Replan 已经可独立工作后再引入。

建议 Graph：

```text
START
 ↓
load_context
 ↓
analyze_photo
 ↓
evaluate_rubric
 ↓
decision
 ├─ PASS → compare_before_after? → update_skill → COMPLETE
 ├─ RETRY → attempt < 3 → plan_next_action → checkpoint → WAIT_USER
 └─ UNCERTAIN → request_better_evidence
```

`WAIT_USER` 不保持长 HTTP 请求：保存 checkpoint，用户下一次提交时恢复 State。

---

# Phase 7 — Skill State

五个最终 Skill：

```ts
type SkillType =
  | 'subject_clarity'
  | 'subject_position'
  | 'background_control'
  | 'visual_balance'
  | 'light_awareness'
```

掌握度只用：

```text
0 未掌握
1 初步掌握
2 稳定掌握
```

避免虚假的 0–100 摄影能力分。

---

# Phase 8 — 25 Practice templates

每个 Skill 5 个模板，总计 25 个。

Practice 不由 LLM 从零生成。Agent 负责读取 Skill State、选择模板、按环境做轻度个性化。

---

# Phase 9 — Home + Growth

一级 Tab 只保留：

```text
今日
成长
```

Home：Today's Practice、Skill State、最近 Before / After。

Growth：Skill Map、Practice History、Before / After History。

MVP 不加入 AI Chat、社区、排行榜、AI 修图、RAG、Multi-Agent、WebSocket、Redis、BullMQ。
