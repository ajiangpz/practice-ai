# Phase 3 API Contract

## Scope

Phase 3 keeps the Phase 2 practice lifecycle but replaces opaque image references and deterministic mock coaching with real image upload + validated vision evaluation for BG-01 only.

## `GET /health`

```json
{"status":"ok"}
```

The application should be able to start even when live vision credentials are absent. Provider readiness may be reported separately or through a non-secret field if useful, but `/health` itself must not expose secrets.

## `POST /api/v1/practices`

Unchanged from Phase 2.

Request:

```json
{"templateId":"BG-01"}
```

## `GET /api/v1/practices/{practice_id}`

Unchanged from Phase 2.

## `POST /api/v1/practices/{practice_id}/submissions`

Content-Type: `multipart/form-data`

Fields:

```text
attempt=1
image=<binary file>
```

Rules:

- `attempt`: 1 or 2;
- file required;
- MIME: JPEG, PNG or WebP;
- max size: 10 MiB;
- missing practice: 404;
- invalid image input: 4xx;
- provider unavailable/misconfigured: recoverable 503-class response;
- provider timeout/failure: recoverable 502/503-class response;
- never silently return Phase 2 mock coaching.

Successful response:

```json
{
  "submissionId": "submission_xxx",
  "practiceId": "practice_xxx",
  "attempt": 1,
  "status": "completed"
}
```

Evaluation happens synchronously in Phase 3. The validated evaluation is stored with submission metadata in the in-memory repository. Raw image bytes are discarded after evaluation.

## `GET /api/v1/submissions/{submission_id}/result`

### Retry

```json
{
  "state": "retry",
  "criteria": {
    "subjectClear": {
      "result": "pass",
      "observation": "杯子是画面中最明确的主体"
    },
    "backgroundDistraction": {
      "result": "fail",
      "observation": "主体右后方存在明显高对比干扰物"
    },
    "subjectBackgroundSeparation": {
      "result": "pass",
      "observation": "主体轮廓与背景基本可区分"
    }
  },
  "positiveObservation": "主体已经比较明确",
  "primaryIssue": "右后方的干扰物比较抢眼",
  "action": {
    "type": "move_left",
    "instruction": "不要移动主体，向左移动一步，让干扰物离开主体后方，再拍一次。"
  },
  "confidence": 0.88
}
```

### Pass

```json
{
  "state": "pass",
  "criteria": {
    "subjectClear": {"result":"pass","observation":"主体明确"},
    "backgroundDistraction": {"result":"pass","observation":"未发现明显背景干扰"},
    "subjectBackgroundSeparation": {"result":"pass","observation":"主体与背景可区分"}
  },
  "positiveObservation": "当前照片已经达到本关背景控制目标",
  "confidence": 0.91
}
```

PASS must not include an action.

### Uncertain

```json
{
  "state": "uncertain",
  "criteria": {
    "subjectClear": {"result":"uncertain","observation":"无法可靠确定主要主体"},
    "backgroundDistraction": {"result":"uncertain","observation":"缺少可靠判断基础"},
    "subjectBackgroundSeparation": {"result":"uncertain","observation":"缺少可靠判断基础"}
  },
  "primaryIssue": "还不能可靠确定你主要想拍什么",
  "confidence": 0.43
}
```

UNCERTAIN must not invent an action.

## `POST /api/v1/practices/{practice_id}/complete`

Unchanged from Phase 2.

## Error shape

Keep errors simple and recoverable. FastAPI default `detail` is acceptable, but the frontend service must normalize provider/network errors into user-safe messages.

Never return:

- API keys;
- raw upstream provider bodies containing sensitive metadata;
- raw model chain-of-thought;
- image bytes/base64;
- internal stack traces in production-facing responses.

## Frontend upload contract

The frontend API layer should expose a typed function conceptually like:

```ts
uploadSubmission(
  practiceId: string,
  attempt: Attempt,
  imagePath: string
): Promise<SubmissionApiResponse>
```

Use `Taro.uploadFile` with the configured API base URL.

The local `imagePath` remains in Taro Storage solely for local rendering. It is not treated as a server-readable URL.
