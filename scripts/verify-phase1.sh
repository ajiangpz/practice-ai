#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND="$ROOT/frontend"

fail() {
  echo "[phase1] ERROR: $1" >&2
  exit 1
}

info() {
  echo "[phase1] $1"
}

info "verifying required Phase 1 files"

[[ -f "$FRONTEND/package.json" ]] || fail "frontend/package.json not found"
[[ -f "$FRONTEND/src/pages/practice/index.tsx" ]] || fail "Practice page missing"
[[ -f "$FRONTEND/src/pages/capture/index.tsx" ]] || fail "Capture page missing"
[[ -f "$FRONTEND/src/pages/coach/index.tsx" ]] || fail "Coach page missing"
[[ -d "$FRONTEND/src/types" ]] || fail "frontend/src/types directory missing"

cd "$FRONTEND"

if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null 2>&1; then
  PM=pnpm
elif [[ -f yarn.lock ]] && command -v yarn >/dev/null 2>&1; then
  PM=yarn
elif command -v npm >/dev/null 2>&1; then
  PM=npm
else
  fail "No supported package manager found"
fi

info "package manager: $PM"

if node -e 'const p=require("./package.json"); process.exit(p.scripts && p.scripts.typecheck ? 0 : 1)' >/dev/null 2>&1; then
  info "running typecheck"
  "$PM" run typecheck
else
  info "no typecheck script; running TypeScript compiler when available"
  if [[ -x node_modules/.bin/tsc ]]; then
    node_modules/.bin/tsc --noEmit
  else
    fail "No typecheck script and local tsc not found"
  fi
fi

info "building WeChat Mini Program"
if node -e 'const p=require("./package.json"); process.exit(p.scripts && p.scripts["build:weapp"] ? 0 : 1)' >/dev/null 2>&1; then
  "$PM" run build:weapp
else
  fail "package.json must define build:weapp"
fi

[[ -d "$FRONTEND/dist" ]] || fail "frontend/dist not generated"

info "checking Phase 1 scope guard"
if grep -RIl --exclude-dir=node_modules --exclude-dir=dist \
  --exclude=package-lock.json --exclude=pnpm-lock.yaml --exclude=yarn.lock \
  -E 'langgraph|bullmq|redis|websocket|chroma|vector[ _-]?db' "$FRONTEND" >/tmp/practice_ai_scope_hits 2>/dev/null; then
  cat /tmp/practice_ai_scope_hits
  fail "Found dependencies/concepts forbidden in Phase 1"
fi

info "automated Phase 1 checks passed"
echo "[phase1] Manual acceptance is still required: Practice → Capture → Retry → Capture → Compare → Complete"
