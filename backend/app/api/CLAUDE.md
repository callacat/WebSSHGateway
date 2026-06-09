[根目录](../../CLAUDE.md) > [backend](../CLAUDE.md) > **api**

# API Layer — Route Handlers

FastAPI route definitions for all HTTP and WebSocket endpoints.

## Modules

| File | Prefix | Description |
|------|--------|-------------|
| `auth.py` | `/auth` | Login, password change, password reset |
| `connections.py` | `/connections` | SSH connection CRUD |
| `sessions.py` | `/sessions` | Session lifecycle + WebSocket terminal |
| `ws_sessions.py` | `/sessions` | WebSocket session status broadcast |
| `health.py` | `/health` | Simple health check |
| `system.py` | `/system` | Remote system stats, file operations, upload/download |
| `system_settings.py` | `/system` | Global settings CRUD |
| `session_status.py` | `/system` | Lightweight status for session cards |
| `middleware.py` | - | Request logging middleware |
| `dependencies.py` | - | DI: AppState, DB session, auth guards |

## Key Patterns

- All authenticated endpoints use `get_current_user` dependency
- Database sessions use `get_db` dependency (auto-commit/rollback)
- State accessed via `get_state` -> `AppState` dataclass
- Error responses use i18n through `HTTPException` with string detail keys
- WebSocket auth via `get_current_user_from_ws` (token in query param or protocol header)

## Changelog

| Date | Change |
|------|--------|
| 2026-06-09 | Initial documentation |
