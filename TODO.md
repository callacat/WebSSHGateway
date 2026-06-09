# WebSSHGateway — 待办清单

> 初始化扫描发现的缺口，按优先级排序

## 🔴 高优先级

### 补充 session-transfer-files 目录

Dockerfile 引用的 `session-transfer-files/` 目录不存在，该目录包含增强会话（tmux keepalive）所需的远程二进制文件。需从上游 [beibeizi/WebSSHGateway](https://github.com/beibeizi/WebSSHGateway) 拉取或自行编译。

**涉及文件**: `Dockerfile`, `backend/app/core/config.py`
**影响**: 增强持久化会话（断线重连）无法正常工作

---

## 🟡 中优先级

### 添加前后端测试基础设施

前后端均无测试文件：
- **Backend**: 用 pytest，至少覆盖 SSH 连接逻辑和 API 端点
- **Frontend**: 用 vitest，至少覆盖页面渲染和 WebSocket 交互

### 集成 Alembic 数据库迁移

当前 schema 变更靠 `bootstrap.py` 手写 ALTER TABLE：
- 引入 Alembic 管理版本化迁移
- 支持前向迁移和回滚
- 将 bootstrap.py 中的历史 ALTER TABLE 整合为初始迁移

---

## ⚪ 低优先级

### 深度补扫 ssh_manager.py 增强持久化逻辑

`ssh_manager.py`（400+ 行）在初始化时只扫了前 150 行。剩余部分含：
- tmux 持久会话管理（`_collect_tmux_metrics`, `_terminate_enhanced_tmux`）
- 增强保活与自动重连
- 目标网络探测循环（`_probe_target_network_once`, `_run_target_network_probe_loop`）
- 会话状态同步

需补扫以完善 `CLAUDE.md`。

---

*生成日期: 2026-06-09 · 来源: CCG init scan*
