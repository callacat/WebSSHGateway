[根目录](../../CLAUDE.md) > [frontend](../CLAUDE.md) > **pages**

# Pages — Route-level Components

Top-level page components, each corresponding to a route in the SPA.

## Pages

| File | Route | Description |
|------|-------|-------------|
| `Login.tsx` | `/` | Login form + password reset flow |
| `ForcePasswordChange.tsx` | `/force-password` | First-login password change |
| `Sessions.tsx` | `/sessions` | Session dashboard (desktop/mobile responsive) |
| `Terminal.tsx` | `/terminal/:sessionId` | Terminal with system monitor and file browser |
| `SystemSettings.tsx` | `/settings` | Global system settings management |

## Sessions Sub-pages (`sessions/`)

- `SessionsDesktop.tsx` - Desktop layout
- `SessionsMobile.tsx` - Mobile responsive layout  
- `SessionsConnectionsPanel.tsx` - Connection management panel
- `SessionsDialogs.tsx` - Dialog components
- `SessionStatusSummary.tsx` - Status card with CPU/memory/network
- `useSessionsState.ts` - Main state management hook
- `useSessionsPolling.ts` - Polling logic for session updates
- `useSessionsOrdering.ts` - Drag-to-reorder logic
- `useSessionStatusSummary.ts` - Status summary polling
- `usePasswordDialog.ts` - Password prompt dialog state
- `sessionsUtils.ts` - Utility functions

## Terminal Sub-pages (`terminal/`)

- `TerminalDesktop.tsx` - Desktop layout
- `TerminalMobile.tsx` - Mobile layout
- `useTerminalSession.ts` - Main terminal hook
- `useTerminalSocket.ts` - WebSocket connection management
- `useTerminalSessionInfo.ts` - Session info and reconnection
- `terminalUtils.ts` - Utility functions and themes

## Changelog

| Date | Change |
|------|--------|
| 2026-06-09 | Initial documentation |
