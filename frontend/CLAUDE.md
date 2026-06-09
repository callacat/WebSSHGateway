[根目录](../CLAUDE.md) > **frontend**

# Frontend — WebSSH Gateway SPA

React 18 TypeScript single-page application with xterm.js terminal emulator, session management dashboard, remote file browser, and system monitoring.

## Module Responsibility

Provides the browser UI for the WebSSH Gateway. Key responsibilities:
- User authentication (login, password change/reset, force password change on first login)
- SSH session management (create, list, reorder, add notes, disconnect, delete)
- Terminal emulation over WebSocket using xterm.js
- Real-time session status updates via WebSocket push
- Remote file browsing and management (view, create, edit, upload, download, batch upload)
- Remote system monitoring (CPU, memory, network, processes, disks)
- System settings management (enhanced session retry policy, polling intervals)
- Dark/light theme support and Chinese/English i18n

## Entry and Startup

**Entry point**: `src/main.tsx`

Route structure:
| Path | Page | Requires Auth |
|------|------|---------------|
| `/` | Login | No |
| `/force-password` | ForcePasswordChange | Yes |
| `/sessions` | Sessions (dashboard) | Yes |
| `/settings` | SystemSettings | Yes |
| `/terminal/:sessionId` | Terminal | Yes |

Global providers wrap the app: `AppProvider` (theme, language, auth, network, system settings) + `ToastProvider` + `BrowserRouter`.

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.3.1 | UI framework |
| react-dom | 18.3.1 | DOM renderer |
| react-router-dom | 6.26.2 | SPA routing |
| xterm | 5.0.0 | Terminal emulator |
| xterm-addon-fit | 0.8.0 | Terminal auto-fit |
| tailwindcss | 3.4.10 | CSS framework |
| clsx + tailwind-merge | - | Class composition |
| lucide-react | 0.452.0 | Icons |
| @radix-ui/react-toast | 1.2.2 | Toast notifications (unused, custom Toast used instead) |
| fflate | 0.8.2 | gzip compression (client-side tar.gz for uploads) |
| jszip | 3.10.1 | Client-side zip handling |
| class-variance-authority | 0.7.0 | Component variants |
| vite | 5.4.2 | Build tool |

## Page Components

### Login (`src/pages/Login.tsx`)
- Login form with username/password and remember-me
- Password reset flow (request verification code + confirm)
- Redirects to `/sessions` if already authenticated
- Handles `force_password_change` response

### Sessions (`src/pages/Sessions.tsx`)
- Main dashboard with responsive layout (Desktop/Mobile variants)
- Subcomponents: `SessionsDesktop`, `SessionsMobile`, `SessionsConnectionsPanel`, `SessionsDialogs`
- Custom hooks: `useSessionsState`, `useSessionsPolling`, `useSessionsOrdering`, `usePasswordDialog`, `useSessionStatusSummary`
- Features: connection CRUD, session management, enhanced session prompt, sorting/dragging, status polling, WebSocket push

### Terminal (`src/pages/Terminal.tsx`)
- Desktop/Mobile responsive variants
- Custom hooks: `useTerminalSession`, `useTerminalSocket`, `useTerminalSessionInfo`
- xterm.js integration with dark/light theme
- WebSocket-based terminal I/O with automatic reconnection
- Integrated system monitoring panel and file browser
- Server selection and upload capabilities

### SystemSettings (`src/pages/SystemSettings.tsx`)
- Global settings: enhanced retry count, retry schedule, session status refresh interval
- Toggle: default enhanced sessions, status summary visibility
- Theme and language toggles

### ForcePasswordChange (`src/pages/ForcePasswordChange.tsx`)
- First-login password change form
- Validates current password and new password confirmation

## Shared Components

| Component | File | Description |
|-----------|------|-------------|
| Button | `components/Button.tsx` | Variants: primary, secondary, ghost, danger; loading state; ThemeAwareButton variant |
| Card | `components/Card.tsx` | Title + description + content wrapper |
| Input | `components/Input.tsx` | Themed input with focus ring |
| ConfirmDialog | `components/ConfirmDialog.tsx` | Modal confirm dialog with ESC handling |
| Toast | `components/Toast.tsx` | Toast notification system with auto-dismiss |
| RouteGuard | `components/RouteGuard.tsx` | ProtectedRoute and PublicRoute wrappers |
| FileBrowser | `components/FileBrowser.tsx` | Tree view, file listing, CRUD operations |
| SystemMonitor | `components/SystemMonitor.tsx` | Real-time CPU/memory/network/process/disk display |

## State Management

All global state lives in `AppContext` (`context/AppContext.tsx`):

- **Theme**: dark/light toggle, persisted to localStorage
- **Language**: zh-CN / en-US toggle, persisted to localStorage
- **Auth**: user info (id + token), login/logout, automatic token expiry detection
- **Network profiling**: Periodic server ping (every 10-25s depending on profile), detects degraded/poor network conditions, reports latency/jitter/error streaks
- **System settings**: Loaded on auth, refreshable, passed down via context

## i18n

- Backend i18n: `backend/app/core/i18n.py` (message catalog with zh/en keys)
- Frontend i18n: Client-side translations in `lib/api.ts` (`CLIENT_TEXT_MAP`)
- Language detected from `X-Language` header on requests
- WebSocket language sent as query parameter `lang`

## Network Architecture

- REST API calls through `lib/api.ts` with unified error handling (NetworkError, AuthError, BusinessError)
- WebSocket connections for real-time: terminal I/O (`/sessions/ws/terminal/{id}`) and session status push (`/sessions/ws/sessions/{userId}`)
- XHR fallback for file uploads with progress tracking
- Download via XHR with blob response

## Testing and Quality

- **No test files found in this module**.
- ESLint configured (`.eslintrc.json`) with TypeScript and React hooks plugins
- PostCSS with Tailwind CSS and autoprefixer
- Recommended: vitest + @testing-library/react + @testing-library/jest-dom

## Related Files

- `/tmp/WebSSHGateway/frontend/package.json` - NPM dependencies and scripts
- `/tmp/WebSSHGateway/frontend/index.html` - HTML entry point
- `/tmp/WebSSHGateway/frontend/vite.config.ts` - Vite build configuration (references in package.json scripts)
- `/tmp/WebSSHGateway/frontend/.eslintrc.json` - Linter configuration
- `/tmp/WebSSHGateway/frontend/postcss.config.js` - PostCSS configuration

## Changelog

| Date | Change |
|------|--------|
| 2026-06-09 | Initial module documentation from codebase scan |
