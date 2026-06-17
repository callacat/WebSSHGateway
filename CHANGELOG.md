# Changelog

## [Unreleased]

## [0.3.0] - 2026-06-17

### Fixed

- **修复终端黑屏 (isDark ReferenceError)**: `TerminalDesktop.tsx:184` 裸 `isDark` 缺少 `state.` 前缀，导致 ReferenceError 使整个组件树崩溃，终端白屏/黑屏
- **修复终端黑屏 (flex 挤压)**: 底部面板（CommandInput/QuickCommands/折叠按钮）在 flex-col 布局中挤压终端容器至零高度，触发 xterm FitAddon 计算出 rows=0/cols=0
  - 桌面端和移动端底部面板包裹在 `flex-shrink-0` 容器中
  - 终端区域设置 `min-h-[120px]` 防挤压

### Added

- **底部命令输入框**: 终端下方独立命令输入框，支持多行编辑、Enter 发送、↑↓ 历史（sessionStorage 持久化 50 条）
- **快捷命令（Quick Commands）**: 服务端存储的快捷命令，分组管理，一键发送（此版本后已移除）

### Removed

- **移除快捷命令功能**: 因 UI 布局和需求变更，移除 QuickCommands 组件及相关 API 调用

### Changed

- **版本号对齐**: 统一 `VERSION` / `package.json` / git tag 为 `v0.3.0`

## [0.2.1] - 2026-06-11

### Fixed

- **增强会话默认不启用**: 修改 `default_enable_enhanced_session` 为 `0`，新建 session 默认不启用
- **TMUX 重连死循环**: `session_order` 为 `null` 不自动赋值 0

## [0.2.0] - 2026-06-09

### Fixed

- **终端非 ASCII 字符显示修复**: 全链路排查并修复中文/特殊字符无法显示的问题
  - 绕过 PAM locale 覆盖、tmux 注入 LANG、xterm unicode 支持
- **修复参数名错误**: `create_session(environ=...)` → `create_session(env=...)`

## [0.1.0] - 初始版本

- 基于 [beibeizi/WebSSHGateway](https://github.com/beibeizi/WebSSHGateway) 社区版 fork
- Web SSH 终端、连接管理、增强持久会话、文件管理、系统监控
