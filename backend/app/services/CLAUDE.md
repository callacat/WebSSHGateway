[根目录](../../CLAUDE.md) > [backend](../CLAUDE.md) > **services**

# Services Layer — Business Logic

Core business logic services for authentication, encryption, SSH management, and system configuration.

## Services

| Service | File | Description |
|---------|------|-------------|
| AuthService | `auth.py` | bcrypt hashing, JWT issue/verify, password policies, login lockout, password reset challenges |
| CryptoService | `crypto.py` | AES-GCM encryption/decryption with multi-key rotation support |
| SessionManager | `ssh_manager.py` | SSH client management, session lifecycle, tmux-enhanced persistence, keepalive probing, target RTT monitoring |
| SessionBroadcaster | `session_updates.py` | WebSocket pub/sub for real-time session status |
| SystemSettings | `system_settings.py` | Load/validate/parse global runtime settings with sanitization |
| Bootstrap | `bootstrap.py` | Admin user creation, DB migration column additions |
| Types | `types.py` | `SessionOutput`, `PtyInfo`, `SessionHandle` protocol, `SessionBuffer` |

## Key Patterns

- AuthService is stateless except for in-memory password reset challenges (in-process only)
- CryptoService rotates through multiple keys for decryption (backward compatibility)
- SessionManager holds in-memory `ManagedSession` dict keyed by session ID
- SessionBroadcaster maintains per-user WebSocket subscriptions

## Changelog

| Date | Change |
|------|--------|
| 2026-06-09 | Initial documentation |
