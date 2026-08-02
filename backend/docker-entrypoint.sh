#!/bin/sh
set -eu

# 启动 WebSSH Gateway。
# 端口优先取 $PORT 环境变量（默认 8080），使 docker run -e PORT=xxx
# 与 compose 的 environment 配置真正生效，而不是被 CMD 硬编码端口覆盖。

PORT="${PORT:-8080}"

case "$PORT" in
    ''|*[!0-9]*) echo "invalid PORT: $PORT" >&2; exit 1 ;;
esac
if [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
    echo "PORT out of range (1-65535): $PORT" >&2
    exit 1
fi

exec python -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
