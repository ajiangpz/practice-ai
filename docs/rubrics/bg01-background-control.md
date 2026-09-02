# BG-01 Rubric — 背景做减法

## Purpose

Evaluate whether the user's current photo satisfies the single practice target: **keep the subject clear while reducing obvious background distraction**.

This rubric is deliberately narrow. It is not a general photography critique.

## Criterion 1 — subject_clear

Question:

> Is there one reasonably identifiable primary subject?

### pass

A main subject is visually clear enough that an ordinary viewer can tell what the user is primarily photographing.

### partial

A likely subject exists but competes strongly with another object or is framed so ambiguously that the primary subject is not fully clear.

### fail

No credible primary subject can be identified.

### uncertain

The image quality, crop, obstruction or scene ambiguity prevents reliable judgment.

## Criterion 2 — background_distraction

Question:

> Is there an obvious unrelated background element near/behind the subject that strongly competes for attention?

### pass

No clearly dominant unrelated background distraction is visible around the main subject.

The background does not need to be empty, blurred or aesthetically perfect.

### partial

Some clutter exists, but its visual competition with the subject is moderate rather than clearly dominant.

### fail

At least one unrelated background element is conspicuous enough to compete strongly with the subject.

Typical examples can include, when actually visible:

- high-contrast power strips or cables;
- bright trash bins or packaging;
- strong text/signage unrelated to the subject;
- a very bright window immediately behind the subject;
- another high-salience object touching or visually cutting through the subject silhouette;
- dense clutter directly surrounding the subject.

Do not assume these objects exist. Mention only visible evidence.

### uncertain

The scene or image quality does not support a reliable judgment.

## Criterion 3 — subject_background_separation

Question:

> Can the subject be visually distinguished from the background?

This is supporting evidence only.

### pass

Subject boundaries are generally distinguishable.

### partial

Some portions merge with background elements, but the subject remains identifiable.

### fail

The subject substantially merges into the background and is difficult to distinguish.

### uncertain

Insufficient evidence.

## Decision rule

### PASS

```text
subject_clear == pass
AND
background_distraction == pass
```

`subject_background_separation` may be partial without automatically failing the practice.

### UNCERTAIN

Use when the evaluator cannot make a reliable judgment, including when:

- the primary subject cannot be determined reliably;
- image quality/crop is insufficient;
- confidence is below the configured threshold.

Do not invent a correction in this state.

### RETRY

Use for all other non-uncertain cases that do not satisfy PASS.

## Coaching rule

A RETRY response must choose **one** primary issue only.

Priority:

1. If there is no sufficiently clear primary subject, address subject clarity first.
2. Otherwise address the single strongest background distraction relevant to BG-01.
3. Do not introduce unrelated exposure/color/aesthetic critique.

Then return one immediate physical action.

Allowed action types:

- `move_left`
- `move_right`
- `move_closer`
- `move_back`
- `lower_camera`
- `raise_camera`
- `change_angle`
- `simplify_background`

Action instructions must be concrete enough to execute immediately.

Good:

> 不要移动杯子，向左移动一步，让右后方的插线板离开主体后方，再拍一次。

Bad:

> 优化构图，让画面更高级。

## Forbidden evaluation dimensions

Do not evaluate or mention unless required to explain inability to see the practice evidence:

- overall aesthetics;
- overall score;
- artistic value;
- story/emotion;
- color grading;
- filters;
- white balance;
- professional-camera settings;
- post-processing quality.

## Confidence

Return a `confidence` value in `[0,1]` representing confidence in the narrow rubric decision, not confidence in overall photo quality.

Default product threshold may start around `0.65`, but implementation should keep it configurable and tune it with labeled evaluation data rather than treating this number as permanent truth.
