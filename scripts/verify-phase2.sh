#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND="$ROOT/frontend"
BACKEND="$ROOT/backend"

fail() {
  echo "[phase2] ERROR: $1" >&2
  exit 1
}

info() {
  echo "[phase2] $1"
}

info "verifying required Phase 2 structure"
[[ -f "$BACKEND/app/main.py" ]] || fail "backend/app/main.py missing"
[[ -d "$BACKEND/tests" ]] || fail "backend/tests missing"
[[ -f "$BACKEND/requirements.txt" || -f "$BACKEND/pyproject.toml" ]] || fail "backend dependency manifest missing"
[[ -f "$FRONTEND/src/services/api.ts" ]] || fail "frontend/src/services/api.ts missing"
[[ -f "$FRONTEND/src/pages/coach/index.tsx" ]] || fail "Coach page missing"

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

info "running backend tests"
PYTHONPATH="$BACKEND" "$PYTHON" -m pytest -q

info "checking forbidden Phase 2 infrastructure"
SCOPE_FILES=("$BACKEND/app" "$FRONTEND/src")
[[ -f "$BACKEND/requirements.txt" ]] && SCOPE_FILES+=("$BACKEND/requirements.txt")
[[ -f "$BACKEND/pyproject.toml" ]] && SCOPE_FILES+=("$BACKEND/pyproject.toml")
SCOPE_FILES+=("$FRONTEND/package.json")

if grep -RIl \
  --exclude-dir=__pycache__ \
  -E 'langgraph|langchain|openai|qwen|gemini|deepseek|redis|bullmq|websocket|chroma|pinecone|milvus|qdrant|sqlalchemy|pymysql|mysqlclient|psycopg' \
  "${SCOPE_FILES[@]}" >/tmp/practice_ai_phase2_scope_hits 2>/dev/null; then
  cat /tmp/practice_ai_phase2_scope_hits
  fail "Found dependencies/concepts forbidden in Phase 2 implementation scope"
fi

if grep -q 'retryResult' "$FRONTEND/src/pages/coach/index.tsx"; then
  fail "CoachPage still references local retryResult; Phase 2 result must come from API"
fi

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

info "frontend package manager: $PM"
info "running frontend typecheck"
"$PM" run typecheck

info "building WeChat Mini Program"
"$PM" run build:weapp
[[ -d "$FRONTEND/dist" ]] || fail "frontend/dist not generated"

if grep -RIl --exclude='*.map' -F 'process.env.TARO_APP_API_BASE_URL' "$FRONTEND/dist" >/tmp/practice_ai_phase2_runtime_env_hits 2>/dev/null; then
  cat /tmp/practice_ai_phase2_runtime_env_hits
  fail "WeChat bundle still references Node process.env at runtime"
fi

info "automated Phase 2 checks passed"
echo "[phase2] Manual acceptance still required with FastAPI running: Practice → Capture → API Retry → Capture → API Compare → Complete, plus recoverable network failure."
