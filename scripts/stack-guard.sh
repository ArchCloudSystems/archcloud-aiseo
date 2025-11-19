#!/usr/bin/env bash
set -e

if grep -Riq "supabase" . \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=.git \
  --exclude='*.zip' \
  --exclude='stack-guard.sh'; then
  echo "❌ Supabase reference found in the project source (excluding node_modules/.next/.git). This project does not use Supabase."
  exit 1
else
  echo "✅ No Supabase detected in project source."
fi

