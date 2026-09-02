# Practice AI Backend — Phase 2

Small FastAPI service for the Phase 2 frontend/backend contract. It stores practices and
submissions in memory and returns deterministic mock coaching results. Client image references are
opaque metadata and are never opened by the server.

## Setup and run (PowerShell)

```powershell
uv venv .venv --python 3.13
uv pip install --python .venv/Scripts/python.exe -r requirements.txt
& '.venv/Scripts/python.exe' -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Test

```powershell
$env:PYTHONPATH=(Get-Location).Path
& '.venv/Scripts/python.exe' -m pytest -q
```

Restarting the process clears all practices and submissions by design.
