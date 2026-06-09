[根目录](../../CLAUDE.md) > [frontend](../CLAUDE.md) > **components**

# Components — Shared UI Components

Reusable UI components used across pages.

## Components

| File | Description |
|------|-------------|
| `Button.tsx` | Button with variants (primary/secondary/ghost/danger), loading spinner, ThemeAwareButton |
| `Card.tsx` | Container with title, description, and content |
| `Input.tsx` | Themed text input |
| `Toast.tsx` | Toast notification system with auto-dismiss |
| `ConfirmDialog.tsx` | Modal confirm dialog with ESC support |
| `RouteGuard.tsx` | ProtectedRoute (auth required) and PublicRoute (redirect if authed) |
| `FileBrowser.tsx` | Remote file tree browser with CRUD operations |
| `SystemMonitor.tsx` | Real-time system monitoring panel |

## Design System

- Dark theme (default): slate-950 background with slate-100 text
- Light theme: white background with slate-700 text
- Variant system for buttons with shared `cn()` utility (clsx + tailwind-merge)
- Consistent border radius (rounded-md, rounded-lg, rounded-xl)
- Indigo accent color for focus ring and primary buttons

## Changelog

| Date | Change |
|------|--------|
| 2026-06-09 | Initial documentation |
