[根目录](../CLAUDE.md) > **backend**

# Backend — WebSSH Gateway API Server

Python 3.11 FastAPI server providing SSH gateway, session management, authentication, file management, and remote system monitoring.

## Module Responsibility

The backend is the core of the system. It handles:
- SSH connection lifecycle (establish, manage, reconnect, terminate)
- Authentication (JWT-based login, password change/reset, brute-force lockout)
- Session management with enhanced persistence (tmux-based auto-reconnect)
- Remote system monitoring (CPU, memory, network, processes, disks)
- Remote file operations (browse, read, write, upload, download, batch operations)
- Global system settings management
- WebSocket-based real-time communication (terminal I/O, session status push)

## Entry and Startup

**Entry point**: `app/main.py` -- `create_app()` factory function created at module level as `app = create_app()`

Startup sequence:
1. `build_state()` (in `core/state.py`) loads config, creates DB, AuthService, SessionManager, SessionBroadcaster
2. Database tables created and migration columns ensured via `bootstrap.py`
3. Default admin user created if not exists (password printed to logs)
4. Stale active sessions marked as disconnected
5. Background workers started: enhanced retry worker, session sync worker
6. FastAPI app configured with CORS, request logging, SPA fallback middleware
7. All API routers registered

## API Routes

All routes defined in `app/api/`:

| File | Prefix | Key Endpoints |
|------|--------|---------------|
| `auth.py` | `/auth` | login, change-password, reset-password/request, reset-password/confirm |
| `connections.py` | `/connections` | CRUD for SSH connection records |
| `sessions.py` | `/sessions` | List, create, disconnect, delete, retry, reorder, update note; WebSocket terminal |
| `ws_sessions.py` | `/sessions` | WebSocket for session status broadcasting |
| `health.py` | `/health` | Health check endpoint |
| `system.py` | `/system` | Remote system stats, file operations, upload/download |
| `system_settings.py` | `/system` | Global system settings CRUD |
| `session_status.py` | `/system` | Lightweight session status summary |
| `middleware.py` | - | Request logging middleware |
| `dependencies.py` | - | AppState DI, DB session DI, auth guards |

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.115.0 | Web framework |
| uvicorn | 0.30.6 | ASGI server |
| SQLAlchemy | 2.0.34 | ORM |
| PyJWT | 2.9.0 | JWT encode/decode |
| bcrypt | 4.2.0 | Password hashing |
| cryptography | 43.0.1 | AES-GCM encryption for SSH credentials |
| asyncssh | 2.16.0 | SSH client library |
| pydantic | 2.8.2 | Schema validation |
| python-multipart | 0.0.9 | File upload support |

## Data Models (SQLAlchemy)

| Model | Table | Key Fields |
|-------|-------|------------|
| `User` | `users` | id, username, password_hash, must_change_password, failed_login_count, locked_until |
| `Connection` | `connections` | id, user_id, name, host, port, username, auth_type, auth_data (encrypted), remote_arch, remote_os, enhance_prompt_shown |
| `SessionRecord` | `sessions` | id (UUID), connection_id, user_id, status, pty_info, enhanced_enabled, enhanced_fingerprint, tmux_binary_path, disconnected_at, auto_retry_count, retry_cycle_count, allow_auto_retry, note, session_order |
| `SystemSetting` | `system_settings` | id (fixed=1), enhanced_retry_max_attempts, enhanced_retry_schedule, session_status_refresh_interval_seconds, default_enable_enhanced_session, show_session_status_summary |

All models inherit `TimestampMixin` (created_at, updated_at) from `core/db.py`.

## Services Architecture

| Service | File | Responsibility |
|---------|------|----------------|
| AuthService | `services/auth.py` | Password hashing (bcrypt), JWT token issue/verify, login lockout, password reset challenges |
| CryptoService | `services/crypto.py` | AES-GCM encryption/decryption for stored SSH credentials |
| SessionManager | `services/ssh_manager.py` | SSH connection lifecycle, session multiplexing, keepalive probe, tmux-enhanced persistence |
| SessionBroadcaster | `services/session_updates.py` | WebSocket pub/sub for real-time session status updates |
| System Settings | `services/system_settings.py` | Load/sanitize global runtime system settings |
| Bootstrap | `services/bootstrap.py` | Admin user creation, migration column additions |

## Background Workers

Defined in `core/state.py`:

- **Enhanced Retry Worker**: Polls every 5 seconds for disconnected enhanced sessions, retries connection according to configurable schedule (exponential backoff: 2s, 4s, 8s, 16s, 32s by default)
- **Session Sync Worker**: Polls every 5 seconds to reconcile DB session status with in-memory runtime state; handles stale active sessions and reconnected sessions

## Security Architecture

1. **JWT Authentication**: HS256 tokens with multiple rotating secret keys; support for access (short TTL) and remember-me (long TTL)
2. **Credential Encryption**: SSH passwords and private keys encrypted with AES-GCM before storage; decrypted only at session creation time
3. **Password Policy**: 8+ characters with upper/lowercase letters and digits; cannot contain username
4. **Brute Force Protection**: Account lockout after configurable failed login attempts (default: 5)
5. **Path Sanitization**: Shell command injection protection via `sanitize_shell_path()` for all file operations
6. **CORS**: Configurable origins via environment variable

## Testing and Quality

- **No test files found in this module**.
- Recommended: pytest, httpx (async), pytest-asyncio
- Key areas to test: auth flows, session lifecycle, credential encryption/decryption, file operations, SSH command execution

## FAQ

- **Q: How do I reset the admin password?** A: Delete the database file and restart. A new admin password will be generated and printed in the logs.
- **Q: How do enhanced sessions work?** A: Enhanced sessions use tmux on the remote host. When disconnected, the tmux session persists and a background worker retries the SSH connection automatically.
- **Q: Can I use PostgreSQL instead of SQLite?** A: Yes, set `DATABASE_URL` to a PostgreSQL connection string. SQLAlchemy 2.0 supports multiple backends.

## Related Files

- `/tmp/WebSSHGateway/backend/requirements.txt` - Python dependencies
- `/tmp/WebSSHGateway/backend/pyproject.toml` - Uvicorn configuration
- `/tmp/WebSSHGateway/backend/app/main.py` - Application factory and entry point
- `/tmp/WebSSHGateway/backend/app/core/config.py` - Environment configuration
- `/tmp/WebSSHGateway/backend/app/core/db.py` - Database abstraction layer
- `/tmp/WebSSHGateway/backend/app/core/state.py` - Application state and background workers

## Changelog

| Date | Change |
|------|--------|
| 2026-06-09 | Initial module documentation from codebase scan |
