[根目录](../../CLAUDE.md) > [frontend](../CLAUDE.md) > **lib**

# Library — Utilities and API Client

API client, auth utilities, i18n, config, file upload helpers, hooks.

## Modules

| File | Description |
|------|-------------|
| `api.ts` | Full REST API client + WebSocket connection helpers + error types (NetworkError, AuthError, BusinessError) |
| `auth.ts` | JWT parse and expiry check (client-side) |
| `config.ts` | `VITE_API_BASE` from env |
| `i18n.ts` | Language storage and normalization |
| `utils.ts` | `cn()` utility (clsx + tailwind-merge) |
| `upload.ts` | Client-side tar.gz creation from dropped files/folders |

## Hooks

| File | Description |
|------|-------------|
| `hooks/useIsMobile.ts` | Responsive breakpoint detection (default: 768px) |

## API Client Architecture

- Unified `request<T>()` function with auth header injection, i18n error handling
- Separate `login()` bypasses auth header (no token yet)
- WebSocket connections via `openSessionSocket()` and `openTerminalSocket()`
- File uploads use XHR for progress tracking
- All errors localized via `CLIENT_TEXT_MAP`
- Auth storage supports both localStorage (remember) and sessionStorage

## Changelog

| Date | Change |
|------|--------|
| 2026-06-09 | Initial documentation |
