# Phase 2 Spec — Backend Contract

## Objective

Move the deterministic Phase 1 mock coaching decision behind a small FastAPI HTTP API without changing the product experience.

Phase 2 validates the frontend/backend boundary only.

```text
Taro UI
→ typed HTTP request
→ FastAPI
→ deterministic mock result
→ typed HTTP response
→ existing Coach UI
```

## Explicit non-goals

Do **not** implement:

- real AI or Vision evaluation;
- OpenAI/Qwen/Gemini/DeepSeek SDKs;
- image understanding;
- LangGraph;
- database or ORM;
- Redis, BullMQ, queues or WebSocket;
- object storage/COS;
- authentication;
- Home/Growth pages;
- new photography skills.

## Product regression contract

Phase 1 has passed manual acceptance. Phase 2 must preserve:

```text
Practice
→ Capture first image
→ one retry issue + one concrete action
→ Capture second image
→ Before / After
→ Complete
```

The user-visible coaching copy may remain the Phase 1 deterministic mock copy.

## Backend structure

Recommended minimum structure:

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── practice.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   └── memory.py
│   └── services/
│       ├── __init__.py
│       └── coaching.py
├── tests/
│   └── test_api.py
├── requirements.txt
└── README.md
```

Equivalent organization is acceptable if boundaries remain explicit.

## Required endpoints

### `GET /health`

Response:

```json
{
  "status": "ok"
}
```

### `POST /api/v1/practices`

Request:

```json
{
  "templateId": "BG-01"
}
```

Response:

```json
{
  "id": "practice_xxx",
  "templateId": "BG-01",
  "skill": "background_control",
  "title": "背景做减法",
  "maxAttempts": 3,
  "attemptCount": 0,
  "status": "ready"
}
```

Only `BG-01` is supported. Unsupported template IDs should return a clear 4xx response.

### `GET /api/v1/practices/{practice_id}`

Return the in-memory practice or 404.

### `POST /api/v1/practices/{practice_id}/submissions`

Request:

```json
{
  "attempt": 1,
  "imageClientRef": "wxfile://opaque-client-reference"
}
```

`imageClientRef` is deliberately opaque. The backend stores it for contract continuity but must not try to open/read it.

Response:

```json
{
  "submissionId": "submission_xxx",
  "practiceId": "practice_xxx",
  "attempt": 1,
  "status": "completed"
}
```

Validation rules:

- practice must exist;
- attempt must be `1` or `2` in Phase 2;
- `imageClientRef` must be non-empty;
- attempt greater than `maxAttempts` returns 4xx.

### `GET /api/v1/submissions/{submission_id}/result`

Attempt 1 must deterministically return:

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

Attempt 2 must deterministically return:

```json
{
  "state": "compare",
  "comparison": {
    "summary": "改变机位后，主体后方的干扰减少了。"
  }
}
```

The backend does not need Before/After image URLs in its result because the real user images remain owned/rendered by the frontend in Phase 2.

Unknown submission returns 404.

### `POST /api/v1/practices/{practice_id}/complete`

Response:

```json
{
  "practiceId": "practice_xxx",
  "status": "completed"
}
```

Practice state in the in-memory repository must update to `completed`.

## Required Pydantic models

At minimum create explicit models equivalent to:

```python
class PracticeCreateRequest(BaseModel): ...
class PracticeResponse(BaseModel): ...
class SubmissionCreateRequest(BaseModel): ...
class SubmissionResponse(BaseModel): ...
class CriterionIssue(BaseModel): ...
class CoachingAction(BaseModel): ...
class ComparisonSummary(BaseModel): ...
class CoachResultResponse(BaseModel): ...
class PracticeCompleteResponse(BaseModel): ...
```

Use aliases or a shared serialization strategy so the external JSON contract stays camelCase where specified.

## Repository rule

Use an in-memory repository abstraction, not raw dictionaries spread across route handlers.

Example responsibility:

```text
MemoryPracticeRepository
- create_practice
- get_practice
- save_submission
- get_submission
- complete_practice
```

This repository is intentionally ephemeral. Restarting FastAPI may clear data.

## Coaching service rule

Deterministic Phase 2 behavior belongs in a service function/class, not in the frontend and not directly inside route handlers.

Conceptually:

```python
def get_mock_coach_result(submission):
    if submission.attempt == 1:
        return retry_result
    return compare_result
```

## Frontend integration

Create a typed API service layer, e.g.:

```text
frontend/src/services/api.ts
```

Requirements:

- API base URL is configurable, preferably through `TARO_APP_API_BASE_URL`;
- no attempt-based result branching remains inside `CoachPage`;
- submission is sent to the backend;
- Coach result is fetched from the backend;
- result rendering remains driven by `CoachResult`/typed state;
- display a clear loading state while requesting;
- network failure must show a recoverable error with retry action;
- preserve Taro Storage for Before/After local images in Phase 2.

### Important

Do not send a temporary WeChat image path and pretend the backend can inspect it. It is only an opaque field in Phase 2.

## Suggested frontend sequence

First practice entry may create the backend practice lazily:

```text
start Practice
→ POST /practices
→ persist server practice id
→ Capture #1
→ POST submission
→ GET result
→ retry
→ Capture #2
→ POST submission
→ GET result
→ compare
→ POST complete
```

If a simpler equivalent sequence preserves the contract, document it in `docs/decisions.md`.

## Backend tests

Use FastAPI `TestClient` or equivalent.

Tests must cover at minimum:

1. health returns 200;
2. create BG-01 practice;
3. unsupported template returns 4xx;
4. get existing practice;
5. missing practice returns 404;
6. attempt 1 submission result is exactly one `retry` issue/action;
7. attempt 2 submission result is `compare`;
8. missing submission result returns 404;
9. complete updates practice to `completed`;
10. invalid attempt/image reference returns 4xx.

## Automated acceptance

From repository root:

```bash
bash scripts/verify-phase2.sh
```

It must validate backend tests plus existing frontend typecheck/build.

## Manual acceptance

Run backend and mini-program, then verify:

1. open Practice;
2. create/start practice successfully through API;
3. capture/select image A;
4. submit and receive Retry from API;
5. disconnect/stop backend and confirm recoverable network error UI;
6. restart backend and retry;
7. capture/select image B;
8. submit and receive Compare from API;
9. real local Before/After images render;
10. Complete calls backend and finishes flow.

## Definition of done

Phase 2 is complete only when automated gates pass and the same Phase 1 user flow works with backend-derived mock states.

Do not begin Phase 3 automatically.
