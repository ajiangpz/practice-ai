# Phase 2 API Contract

Base path: `/api/v1`

All JSON uses camelCase externally. Backend internals may use snake_case.

## Error shape

FastAPI's standard validation detail is acceptable for request validation. For domain errors, return a stable JSON body with a concise `detail` message.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | service health |
| POST | `/api/v1/practices` | create BG-01 practice |
| GET | `/api/v1/practices/{practiceId}` | get practice state |
| POST | `/api/v1/practices/{practiceId}/submissions` | register attempt |
| GET | `/api/v1/submissions/{submissionId}/result` | get deterministic mock coaching result |
| POST | `/api/v1/practices/{practiceId}/complete` | complete practice |

## Status codes

Use:

- `200` for successful reads/complete;
- `201` for create practice/submission if convenient; `200` is also acceptable if kept consistent and tested;
- `404` for unknown practice/submission;
- `422` for schema validation;
- `400` or `409` for domain-invalid state/attempt, chosen consistently.

## Practice

```ts
interface PracticeResponse {
  id: string
  templateId: 'BG-01'
  skill: 'background_control'
  title: '背景做减法'
  maxAttempts: 3
  attemptCount: number
  status:
    | 'ready'
    | 'in_progress'
    | 'analyzing'
    | 'retry'
    | 'passed'
    | 'needs_practice'
    | 'completed'
}
```

## Submission

```ts
interface SubmissionCreateRequest {
  attempt: 1 | 2
  imageClientRef: string
}

interface SubmissionResponse {
  submissionId: string
  practiceId: string
  attempt: 1 | 2
  status: 'completed'
}
```

`imageClientRef` is an opaque client reference. Phase 2 backend must never claim to inspect its image contents.

## Retry result

```ts
interface RetryCoachResult {
  state: 'retry'
  positiveObservation: string
  primaryIssue: {
    type: 'background_distraction'
    description: string
  }
  action: {
    type: 'move_left'
    instruction: string
  }
}
```

## Compare result

```ts
interface CompareCoachResult {
  state: 'compare'
  comparison: {
    summary: string
  }
}
```

The frontend combines the API summary with its locally persisted real Before/After image paths.

## Complete

```ts
interface PracticeCompleteResponse {
  practiceId: string
  status: 'completed'
}
```

## Contract rule for Phase 3

Do not prematurely redesign these endpoints for a guessed AI implementation. Phase 3 may extend submission/image transport and result fields after the Vision provider contract is specified.
