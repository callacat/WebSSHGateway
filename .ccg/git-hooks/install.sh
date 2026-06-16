#!/usr/bin/env bash
# 安装 Git hooks 到 .git/hooks/
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cp "$SCRIPT_DIR/pre-commit" "$SCRIPT_DIR/../../.git/hooks/pre-commit"
cp "$SCRIPT_DIR/commit-msg" "$SCRIPT_DIR/../../.git/hooks/commit-msg"
chmod +x "$SCRIPT_DIR/../../.git/hooks/pre-commit" "$SCRIPT_DIR/../../.git/hooks/commit-msg"

echo "✅ Git hooks installed"
