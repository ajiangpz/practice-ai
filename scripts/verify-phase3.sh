#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND="$ROOT/frontend"
BACKEND="$ROOT/backend"

fail() {
  echo "[phase3] ERROR: $1" >&2
  exit 1
}

info() {
  echo "[phase3] $1"
}

info "verifying required Phase 3 structure"
[[ -f "$BACKEND/app/main.py" ]] || fail "backend/app/main.py missing"
[[ -d "$BACKEND/app/vision" ]] || fail "backend/app/vision provider boundary missing"
[[ -d "$BACKEND/tests" ]] || fail "backend/tests missing"
[[ -f "$FRONTEND/src/services/api.ts" ]] || fail "frontend API service missing"
[[ -f "$FRONTEND/src/pages/coach/index.tsx" ]] || fail "Coach page missing"
[[ -f "$ROOT/docs/rubrics/bg01-background-control.md" ]] || fail "BG-01 rubric missing"

if [[ -x "$BACKEND/.venv/Scripts/python.exe" ]]; then
  PYTHON="$BACKEND/.venv/Scripts/python.exe"
elif [[ -x "$BACKEND/.venv/bin/python" ]]; then
  PYTHON="$BACKEND/.venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON=python3
elif command -v python >/dev/null 2>&1; then
  PYTHON=python
else
  fail "Python not found"
fi

info "running backend import check"
cd "$BACKEND"
PYTHONPATH="$BACKEND" "$PYTHON" -c 'from app.main import app; assert app is not None'

info "running backend tests (must not require live provider credentials)"
PYTHONPATH="$BACKEND" "$PYTHON" -m pytest -q

info "checking Phase 3 scope"
SCOPE_FILES=("$BACKEND/app" "$FRONTEND/src")
[[ -f "$BACKEND/requirements.txt" ]] && SCOPE_FILES+=("$BACKEND/requirements.txt")
[[ -f "$BACKEND/pyproject.toml" ]] && SCOPE_FILES+=("$BACKEND/pyproject.toml")
SCOPE_FILES+=("$FRONTEND/package.json")

if grep -RIl \
  --exclude-dir=__pycache__ \
  -E 'langgraph|langchain|redis|bullmq|websocket|chroma|pinecone|milvus|qdrant|sqlalchemy|pymysql|mysqlclient|psycopg|cos-python-sdk|boto3' \
  "${SCOPE_FILES[@]}" >/tmp/practice_ai_phase3_scope_hits 2>/dev/null; then
  cat /tmp/practice_ai_phase3_scope_hits
  fail "Found infrastructure forbidden in Phase 3"
fi

if grep -RIl --exclude-dir=__pycache__ -E 'get_mock_coach_result|deterministic mock|imageClientRef' "$BACKEND/app" "$FRONTEND/src" >/tmp/practice_ai_phase3_mock_hits 2>/dev/null; then
  cat /tmp/practice_ai_phase3_mock_hits
  fail "Phase 2 mock/imageClientRef implementation still exists in active code"
fi

if ! grep -RIl --exclude-dir=dist -E 'uploadFile|multipart/form-data' "$FRONTEND/src" >/dev/null 2>&1; then
  fail "Frontend does not appear to upload real image data"
fi

if ! grep -RIl --exclude-dir=__pycache__ -E 'VisionProvider' "$BACKEND/app/vision" >/dev/null 2>&1; then
  fail "VisionProvider abstraction not found"
fi

info "checking frontend"
cd "$FRONTEND"
if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null 2>&1; then
  PM=pnpm
elif [[ -f yarn.lock ]] && command -v yarn >/dev/null 2>&1; then
  PM=yarn
elif command -v npm >/dev/null 2>&1; then
  PM=npm
else
  fail "No supported frontend package manager found"
fi

"$PM" run typecheck
"$PM" run build:weapp
[[ -d "$FRONTEND/dist" ]] || fail "frontend/dist not generated"

if grep -RIl --exclude='*.map' -F 'process.env.TARO_APP_API_BASE_URL' "$FRONTEND/dist" >/tmp/practice_ai_phase3_runtime_env_hits 2>/dev/null; then
  cat /tmp/practice_ai_phase3_runtime_env_hits
  fail "WeChat bundle still references Node process.env at runtime"
fi

info "automated Phase 3 checks passed"
echo "[phase3] Manual live acceptance still required with a configured real vision provider and real BG-01 photos."
