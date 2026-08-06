# Changelog

## [Unreleased]

### Fixed

- **修复添加连接后连接失败返回 500 而非清晰错误**: `prepare_session` / `create_session` / `retry_enhanced_session` 中凭据解密失败或 SSH 连接失败（认证失败、私钥格式错误、主机指纹不匹配、连接超时、网络不可达）时，原先未捕获异常直接返回 500 + 原始堆栈。现在统一转换为 400 并返回本地化错误提示（zh/en），前端 toast 直接展示可操作的错误信息
- **修复 SECRET_KEY 向后兼容回归**: `_decode_secret_key` 原先会把 32 字符 hex 字符串（如 `08e7550a0784d000aca63d99dca08962`）hex 解码为 16 字节密钥，导致既有部署升级后无法解密已保存的连接凭据（AES-GCM）。现仅对 48/64 字符 hex 字符串做解码，32 字符一律按原始 UTF-8 字节处理，保证升级后旧数据仍可解密
    - 新增 `test_raw_32_hex_chars_as_raw` 等测试用例（`backend/tests/test_config_secret_key.py`），当前共 19 个用例
- **修复终端回放乱码（裸 SGR 鼠标事件刷屏）**: 增强会话创建时 `tmux` 的 `mouse on` 会把 TUI 程序（vim/htop/opencode 等）的 SGR 鼠标事件序列在重绘/resize 时以字面文本写入 pane，污染回放缓冲，重连后满屏 `35;X;YM` 无意义字符。改为 `mouse off`，并对回放缓冲新增裸控制序列清洗（`terminal_sanitize`），过滤缺 CSI 前缀的 SGR 鼠标事件 / DSR 响应残留，正常控制序列与文本不受影响
- **修复 Docker 镜像 PORT 环境变量无效**: 镜像 `CMD` 硬编码 `--port 8080` 导致 `PORT` 环境变量被忽略。改为入口脚本 `docker-entrypoint.sh` 读取 `$PORT`（默认 8080），支持 `docker run -e PORT=...`
- **修复 SECRET_KEY 生成命令与校验不符**: 文档推荐 `openssl rand -hex 32` 生成 64 位 hex 字符，但 `config.py` 按字符串字节数校验（拒绝 64 字节）。新增 `_decode_secret_key`：合法 hex 字符串自动解码后校验字节长度（64 hex = 32 字节），并保留原始字符串（16/24/32 字节）兼容；同步修正各文档/示例的 SECRET_KEY 长度措辞
    - 新增 `backend/tests/`（`test_terminal_sanitize.py`、`test_config_secret_key.py`）共 17 个用例

### Added

- **SECRET_KEY 生成指引**: 在部署文档（`docs/DEPLOYMENT.md`、`docs/DEPLOYMENT.en.md`）新增「快速生成 32 位 SECRET_KEY」小节，提供 `openssl` / `/dev/urandom` / `python secrets` / `uuidgen` 四种生成命令及一键写回 `.env` 的便捷写法，并说明 `SECRET_KEY` 同时用于 JWT HS256 签名与 AES-GCM 凭据加密、长度必须为 16/24/32 字节的约束
- **配置模板生成提示**: 在 `.env.example` 与 `docker-compose.yml` 的 `SECRET_KEY` 占位值上方补充生成命令注释，避免沿用示例值

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
