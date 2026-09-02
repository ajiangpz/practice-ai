# Phase 3 Spec — Real Vision Evaluation

## Objective

Replace the deterministic Phase 2 mock coaching decision with a real multimodal model for the single practice `BG-01 / background_control`.

Phase 3 validates one thing only:

> Can a real vision model inspect the user's photo against a narrow practice rubric and reliably return a typed `pass | retry | uncertain` decision with at most one concrete coaching action?

```text
Taro Capture
→ multipart image upload
→ FastAPI
→ VisionProvider
→ BG-01 rubric
→ validated structured result
→ Coach UI
```

## Regression contract

Phase 1 and Phase 2 have passed manual acceptance. Preserve:

- Practice → Capture → Coach flow;
- camera and album input;
- one primary issue only;
- one immediate action only;
- real local Before/After images when a retry occurs;
- recoverable network/provider errors;
- no chat UI and no overall photography score.

## Explicit non-goals

Do **not** implement in Phase 3:

- LangGraph;
- Before/After semantic comparison or previous-action effectiveness reasoning;
- automatic replanning after an ineffective action;
- database/ORM;
- object storage/COS;
- Redis, queue, BullMQ, WebSocket;
- RAG/vector DB/web search;
- authentication;
- Home/Growth pages;
- extra photography skills;
- arbitrary AI-generated practice content.

Actual Before/After comparison and replanning are Phase 4 concerns.

## Image transport

The Phase 2 `imageClientRef` mock contract is replaced by a real multipart upload.

### Submission endpoint

`POST /api/v1/practices/{practice_id}/submissions`

Content type: `multipart/form-data`

Fields:

- `attempt`: integer (`1` or `2` in Phase 3);
- `image`: uploaded image file.

Allowed image MIME types:

- `image/jpeg`
- `image/png`
- `image/webp`

Maximum input size: 10 MiB.

The backend may keep image bytes only for the duration of evaluation. Phase 3 must not introduce permanent image storage.

The frontend continues to retain its local photo paths for rendering Before/After.

## Vision provider boundary

Create an explicit provider abstraction under `backend/app/vision/`.

Conceptually:

```python
class VisionProvider(Protocol):
    async def evaluate_bg01(
        self,
        image_bytes: bytes,
        mime_type: str,
        context: VisionContext,
    ) -> VisionEvaluation:
        ...
```

Requirements:

- business routes/services depend on the abstraction, not directly on a model SDK;
- at least one real provider implementation exists;
- provider configuration comes from environment variables;
- tests use a fake provider and require no real API key;
- missing provider configuration returns a clear recoverable service error;
- secrets and image bytes must never be logged.

### Recommended first live adapter

Use a configurable OpenAI-compatible multimodal HTTP adapter rather than binding business code to one vendor.

Suggested environment contract:

```text
VISION_PROVIDER=openai_compatible
VISION_API_BASE_URL=https://example-provider/v1
VISION_API_KEY=...
VISION_MODEL=...
VISION_TIMEOUT_SECONDS=30
```

The adapter may use `httpx`. Keep all provider-specific request/response handling inside the adapter.

If the selected live endpoint is not compatible with this adapter, record the change in `docs/decisions.md` rather than leaking provider-specific logic into routes or coaching services.

## BG-01 rubric

The model is **not** asked whether the photo is good-looking.

It evaluates only:

1. `subject_clear`
2. `background_distraction`
3. `subject_background_separation`

See `docs/rubrics/bg01-background-control.md` for exact definitions.

Core decision rule:

```text
PASS when:
subject_clear == pass
AND
background_distraction == pass

UNCERTAIN when:
subject cannot be identified reliably
OR visual evidence is insufficient
OR overall confidence is below the configured threshold

otherwise:
RETRY
```

`subject_background_separation` is supporting evidence and does not independently force PASS.

## Structured evaluation schema

Use Pydantic. The live model output must never bypass schema validation.

Equivalent schema:

```python
class CriterionResult(BaseModel):
    result: Literal["pass", "partial", "fail", "uncertain"]
    observation: str

class CoachingAction(BaseModel):
    type: Literal[
        "move_left",
        "move_right",
        "move_closer",
        "move_back",
        "lower_camera",
        "raise_camera",
        "change_angle",
        "simplify_background",
    ]
    instruction: str

class VisionEvaluation(BaseModel):
    subject_detected: bool
    subject_description: str | None
    subject_clear: CriterionResult
    background_distraction: CriterionResult
    subject_background_separation: CriterionResult
    decision: Literal["pass", "retry", "uncertain"]
    positive_observation: str | None
    primary_issue: str | None
    action: CoachingAction | None
    confidence: float
```

Validation invariants:

- `confidence` is within `[0, 1]`;
- `pass` must not contain a coaching action;
- `retry` must contain exactly one `primary_issue` and one `action`;
- `uncertain` must not invent a correction; it should ask for better evidence;
- no overall photo score is allowed;
- model prose outside the schema is not exposed to the frontend.

If model output is malformed, the provider/service may perform **one** controlled schema-repair retry. If it still fails, return a recoverable provider error. Do not loop indefinitely.

## Prompt contract

The system prompt must explicitly state:

- this is a narrow practice evaluator, not a photography judge;
- inspect only the active BG-01 rubric;
- never score overall aesthetics;
- never provide multiple corrections;
- actions must be immediately executable;
- do not invent objects not visible in the image;
- return `uncertain` when evidence is weak;
- PASS means only that the current practice target is satisfied.

Prompt text belongs in a dedicated module/file, not inline in route handlers.

## API behavior

### Create practice

Keep Phase 2 behavior.

### Submit image

The submission request now carries the real image. The backend:

1. validates practice/attempt/file;
2. reads image bytes within the size limit;
3. calls `VisionProvider.evaluate_bg01`;
4. validates the structured result;
5. stores only submission metadata + evaluation in the in-memory repository;
6. discards raw image bytes;
7. returns submission metadata.

The existing result endpoint returns the stored real evaluation.

### Result endpoint

`GET /api/v1/submissions/{submission_id}/result`

Return a typed Phase 3 evaluation response with:

- `state: pass | retry | uncertain`;
- criterion observations;
- optional positive observation;
- optional primary issue/action;
- confidence.

Do not return hidden reasoning or raw provider output.

## Frontend behavior

Replace the Phase 2 `Taro.request` JSON submission with `Taro.uploadFile` (or an equivalent Taro-supported multipart upload).

Coach states:

### `retry`

Render the existing focused coaching UI:

```text
✓ one positive observation

先只改这一点
<one issue>

下一步
<one executable action>

[再拍一次]
```

### `pass`

If attempt 1 passes directly:

```text
本关通过
✓ 已达到“背景做减法”的练习目标
[完成今天的练习]
```

Do not force a second photo.

If attempt 2 passes after a retry, show the two local images, but use honest Phase 3 wording:

```text
第二张已通过
Before → After
[真实第一张] [真实第二张]
第二张照片已满足本关目标
```

Do **not** claim the model verified causal improvement yet. Semantic Before/After comparison belongs to Phase 4.

### `uncertain`

Render a recoverable state such as:

```text
这张照片我还不能可靠判断
让主体更明确一些，再拍一张
[重新拍摄]
```

An uncertain reshoot should not consume the next coached attempt if practical; document the exact state choice if Taro flow constraints require otherwise.

### Provider/network failure

Keep a visible retry action. Never silently fall back to the old deterministic mock result.

## Repository changes

Extend the in-memory submission record to store the validated evaluation. Do not add persistent DB/storage.

## Tests

Tests must not call a paid/live provider by default.

At minimum cover:

1. image MIME validation;
2. image size validation;
3. fake-provider PASS result;
4. fake-provider RETRY result;
5. fake-provider UNCERTAIN result;
6. retry invariant: one issue + one action;
7. pass invariant: no action;
8. malformed provider result becomes recoverable error;
9. missing provider config has a clear error;
10. result endpoint returns stored validated evaluation;
11. raw image bytes are not stored in repository records;
12. existing create/get/complete contract still works.

## Evaluation tooling

Add a small offline evaluation runner under `evaluation/` that can accept a user-supplied folder/manifest of BG-01 images and compare provider decisions against labels.

Do not commit private user photos.

Target metric for later manual dataset work:

> Human vs AI PASS/RETRY agreement >= 80% on a labeled sample.

This target is not an automated gate until a real labeled dataset is supplied.

## Automated acceptance

From repository root:

```bash
bash scripts/verify-phase3.sh
```

The script must run:

- backend tests with fake provider;
- forbidden-scope checks;
- frontend typecheck;
- WeChat build.

It must not require a live API key.

## Manual live acceptance

With a configured real vision provider:

1. start backend;
2. confirm `/health` works;
3. take/select a photo with a clear subject and obvious background distraction;
4. submit it and verify the result comes from the real provider;
5. verify only one primary correction is shown;
6. follow the correction and submit a second photo;
7. confirm the second photo is independently evaluated;
8. test a clean-background photo that can pass directly;
9. test an ambiguous photo that can return `uncertain`;
10. remove/break provider credentials and verify a recoverable error instead of a fake result.

## Definition of done

Phase 3 is complete only when automated gates pass and at least one real provider has successfully evaluated real BG-01 photos through the mini-program end to end.

Do not begin Phase 4 automatically.
