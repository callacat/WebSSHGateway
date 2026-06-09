[根目录](../../CLAUDE.md) > [backend](../CLAUDE.md) > **core**

# Core Layer — Infrastructure

Configuration, database, logging, i18n, application state.

## Modules

| File | Responsibility |
|------|----------------|
| `config.py` | `AppConfig` dataclass + `load_config()` from environment variables |
| `db.py` | SQLAlchemy engine, session factory, `UTCDateTime` type, `Database` class, `Base`, `TimestampMixin` |
| `state.py` | `build_state()` factory - creates all services and background workers |
| `logging.py` | Structured logging with request-id via `contextvars`, `RequestIdFilter`, `StructuredFormatter` |
| `i18n.py` | Message catalog (zh/en) with translation functions for HTTP and WebSocket |
| `errors.py` | `ToolError` exception class and WS helpers |

## Background Workers (state.py)

1. **Enhanced Retry Worker**: Auto-reconnects disconnected enhanced sessions on configurable exponential backoff schedule
2. **Session Sync Worker**: Reconciles DB status with in-memory runtime; handles stale active sessions and reconnected sessions

Both poll every 5 seconds.

## Changelog

| Date | Change |
|------|--------|
| 2026-06-09 | Initial documentation |
