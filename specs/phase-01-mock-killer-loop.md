# Phase 1 Spec — Mock Killer Loop

## Objective

Validate the product interaction before adding backend or AI infrastructure.

The user must be able to complete this exact loop in the WeChat Mini Program build:

```text
Practice
→ Capture first image
→ Mock coaching retry
→ Capture second image
→ Before / After comparison
→ Complete
```

## Product rule

The app is a practice coach, not a content course and not an AI chat product.

The user should always know the **single thing to practice now**.

## BG-01

```yaml
id: BG-01
skill: background_control
title: 背景做减法
objective: 让主体后面的背景更干净
max_attempts: 3
```

Instruction:

> 找一个不会移动的东西，比如杯子、植物或电脑。不要移动主体，只改变自己的拍摄位置，让背景里少一个明显干扰物。

## Page 1 — Practice

Route: `/pages/practice/index`

Required content:

- `DAY 1`
- title `背景做减法`
- `今天只练一件事`
- objective
- task instruction
- suggested subjects: 杯子 / 植物 / 电脑
- primary CTA: `开始拍摄`

CTA navigates to Capture with attempt = 1.

## Page 2 — Capture

Route: `/pages/capture/index`

Requirements:

- use `Taro.chooseMedia()`;
- allow camera and album;
- show selected image preview;
- allow `重新拍`;
- primary CTA `提交给 AI 教练`;
- persist image before navigation.

Attempt 1 saves the image as Before.
Attempt 2 saves the image as After.

## Page 3 — Coach

Route: `/pages/coach/index`

Business state:

```ts
type CoachState = 'retry' | 'pass' | 'compare' | 'uncertain'
```

### Attempt 1 mock result

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

Required rendering:

```text
方向对了

✓ 主体已经比较明确

先只改这一点
右后方的干扰物比较抢眼。

下一步
不要移动主体，向左移动一步，再拍一次。

[再拍一次]
```

The CTA returns to Capture with attempt = 2.

### Attempt 2 mock result

State: `compare`.

Required rendering:

```text
明显改善

Before → After

[真实第一张] → [真实第二张]

背景控制
需要练习 → 通过

改变机位后，主体后方的干扰减少了。

[完成今天的练习]
```

## Required TypeScript domain model

At minimum:

```ts
type SkillType = 'background_control'

type PracticeStatus =
  | 'ready'
  | 'in_progress'
  | 'analyzing'
  | 'retry'
  | 'passed'
  | 'needs_practice'
  | 'completed'

interface Practice {
  id: string
  templateId: 'BG-01'
  title: string
  skill: SkillType
  objective: string
  instruction: string
  maxAttempts: number
  attemptCount: number
  status: PracticeStatus
}

interface Submission {
  id: string
  practiceId: string
  attempt: number
  imageUrl: string
}

type CoachState = 'retry' | 'pass' | 'compare' | 'uncertain'

interface CoachResult {
  state: CoachState
  positiveObservation?: string
  primaryIssue?: {
    type: string
    description: string
  }
  action?: {
    type: string
    instruction: string
  }
  comparison?: {
    beforeUrl: string
    afterUrl: string
    summary: string
  }
}
```

Exact file organization may differ if Taro conventions require it, but behavior and domain model must remain explicit.

## Persistence contract

Use Taro Storage in Phase 1. Persist enough state so navigation/re-entry does not immediately destroy the flow.

At minimum persist:

- current attempt;
- practice state;
- before image path;
- after image path.

## UI constraints

- No chat bubbles.
- No assistant avatar.
- No AI orb.
- No overall photo score.
- No more than one primary correction.
- User photos dominate the Capture/Compare screens.
- One primary CTA per state.

## Automated acceptance

`bash scripts/verify-phase1.sh` must pass.

## Manual acceptance scenarios

### Scenario A — happy path

1. Open Practice.
2. Tap 开始拍摄.
3. Select/capture image A.
4. Submit.
5. Coach shows one retry issue and one action.
6. Tap 再拍一次.
7. Select/capture image B.
8. Submit.
9. Coach displays image A and image B as Before/After.
10. Tap 完成今天的练习.

### Scenario B — navigation persistence

1. Complete first submission.
2. Navigate away/back or re-enter relevant page.
3. The app still knows attempt and Before image.

## Definition of done

Phase 1 is done only when automated gates pass and manual scenarios are verified. Do not begin Phase 2 automatically.
