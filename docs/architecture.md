# Architecture

## Current architecture — Phase 1

Phase 1 is intentionally frontend-only.

```text
Taro Mini Program
│
├── Practice page
├── Capture page
├── Coach page
│
├── Domain types
├── Mock practice data
└── Taro Storage
```

No backend, AI provider, agent runtime or database should exist yet.

## Planned architecture

```text
WeChat Mini Program
Taro + React + TypeScript
        │
        ▼
FastAPI
        │
        ▼
Coaching Workflow
        │
   ┌────┴─────────────┐
   ▼                  ▼
Vision Provider     Deterministic Rules
   │                  │
   └────────┬─────────┘
            ▼
Rubric Evaluation / Compare
            │
            ▼
Skill State
            │
      ┌─────┴─────┐
      ▼           ▼
    MySQL        COS
```

LangGraph is a later orchestration layer, not a prerequisite for proving the product loop.

## Boundary rules

### UI boundary

Frontend renders structured business state such as:

```ts
state: 'retry' | 'pass' | 'compare' | 'uncertain'
```

Frontend must not inspect model prose to infer workflow state.

### AI boundary

When real AI is introduced, model output must be validated through Pydantic/structured schemas before business logic or UI receives it.

### Agent boundary

Deterministic responsibilities stay in ordinary code:

- attempt count;
- persistence;
- skill update rules;
- template selection constraints;
- authorization/data access.

Model responsibilities later include:

- visual observations;
- rubric-grounded diagnosis;
- one concrete coaching action.

## Future wait/resume design

When LangGraph is introduced, `WAIT_USER` must persist/checkpoint and end the HTTP request. A later user submission resumes the workflow. Do not hold long-lived HTTP requests waiting for a human action.
