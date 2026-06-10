# Changelog

## [0.2.0] - 2026-06-09

### Fixed

- **终端非 ASCII 字符显示修复**: 全链路排查并修复中文/特殊字符无法显示的问题
  - **系统层**: 将 `/etc/default/locale` 从 `LANG="C"` 改为 `LANG="C.UTF-8"`，避免 PAM 在 SSH 会话初始化时覆盖 locale（根本原因）
  - **后端 SSH 会话**: 在 `create_session()` 中添加 `env={"LANG": "C.UTF-8"}`，通知 SSH 服务端设置 UTF-8 locale
  - **增强会话 (tmux)**: 在 `tmux new-session` 时添加 `LANG=C.UTF-8` 前缀，绕过 SSH 服务端 AcceptEnv 限制
  - **前端 xterm.js**: 添加 `unicodeVersion: "11"` 启用 CJK 宽字符支持，扩展字体栈包含中文字体回退
  - **SSH 通道编码**: 在 channel 创建后显式调用 `channel.set_encoding('utf-8')`，确保 asyncssh 通道层正确解码非 ASCII 字符
- **修复参数名错误**: `create_session(environ=...)` → `create_session(env=...)`
  asyncssh 2.16.0 中正确的参数名是 `env`，修复后会话创建不再抛出 `TypeError`

### Changed

- 系统设置默认 `JWT_ACCESS_TTL_HOURS` 改为 24 小时

## [0.1.2] - 2026-06-09

### Fixed

- **修复参数名错误**: `client_encoding` → `encoding`
  asyncssh 2.16.0 中正确的参数名是 `encoding`，修正后终端面板连接 SSH 恢复正常

## [0.1.1] - 2026-06-09

### Fixed

- **SSH 通道编码问题**: 添加 `client_encoding='utf-8'` 到 `asyncssh.connect()`
  显式指定 UTF-8 编码，确保终端中文及其他非 ASCII 字符正确显示

### Added

- **GitHub Actions CI/CD**: 自动构建 Docker 镜像并推送至 GitHub Container Registry
  - 触发方式: 推送 `main` 分支或打 `v*` tag
  - 镜像地址: `ghcr.io/callacat/WebSSHGateway`
  - Tags: `latest`, `main`, `sha-<commit>`, semantic version

### Docs

- 更新 README.md: Docker 镜像引用改为 `ghcr.io/callacat/WebSSHGateway`
- 添加 VERSION 版本文件
- 添加 CHANGELOG.md 变更记录

## [0.1.0] - 初始版本

- 基于 [beibeizi/WebSSHGateway](https://github.com/beibeizi/WebSSHGateway) 社区版 fork
- Web SSH 终端、连接管理、增强持久会话、文件管理、系统监控
