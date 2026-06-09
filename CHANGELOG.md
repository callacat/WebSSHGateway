# Changelog

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
