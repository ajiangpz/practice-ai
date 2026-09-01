# Product

## Name

练一下 · 手机摄影

## Positioning

An AI practice coach that helps ordinary phone users improve through short real-world photography exercises.

It is not:

- an AI chat assistant;
- a photography encyclopedia;
- a photo beauty score app;
- a photo editor;
- a fixed video course.

## Core product loop

```text
Choose one practice target
→ user takes a real photo
→ system checks only the active rubric
→ system identifies one highest-value issue
→ system gives one concrete physical action
→ user retakes
→ system compares Before / After
→ system records skill progress
→ system selects the next practice
```

## MVP learning domain

Phone photography composition only.

Planned skill tree:

1. `subject_clarity` — 主体明确
2. `subject_position` — 主体位置
3. `background_control` — 背景控制
4. `visual_balance` — 留白与画面平衡
5. `light_awareness` — 光线意识

Phase 1 implements only `background_control / BG-01`.

## Product principles

### Practice over explanation

Knowledge should be short enough to read in seconds. The product should push the user into a real action quickly.

### One correction at a time

Never overwhelm users with exposure, color, composition, lighting and perspective feedback together. The active practice target determines what matters.

### Verify improvement

The important outcome is not “AI gave advice”. The important outcome is whether the second attempt visibly satisfies the practice target better than the first.

### No fake precision

Avoid unsupported overall scores such as `82.7 photography points`. Future skill state should use coarse mastery levels and evidence from completed practices.

### Photos are the main content

UI should support the user's own images, not dominate them with AI decoration.
