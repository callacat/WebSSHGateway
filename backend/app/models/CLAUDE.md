[根目录](../../CLAUDE.md) > [backend](../CLAUDE.md) > **models**

# Data Models — SQLAlchemy ORM

SQLAlchemy 2.0 declarative models in `app/models/`.

## Models

| File | Table | Description |
|------|-------|-------------|
| `user.py` | `users` | User accounts with auth fields |
| `connection.py` | `connections` | Saved SSH connections with encrypted auth data |
| `session.py` | `sessions` | SSH session records with enhanced persistence metadata |
| `system_setting.py` | `system_settings` | Singleton (id=1) global settings row |

All models inherit `Base` and `TimestampMixin` from `core/db.py`.

## Key Design Decisions

- SQLite by default, PostgreSQL supported via connection string
- Auth data encrypted with AES-GCM before storage (`auth_data` TEXT column)
- Session ID is a string (UUID) primary key
- System settings use a singleton pattern with fixed id=1
- Migration strategy: ALTER TABLE in `bootstrap.py` for incremental column additions (no Alembic)

## Changelog

| Date | Change |
|------|--------|
| 2026-06-09 | Initial documentation |
