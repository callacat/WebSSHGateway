# Quality Checklist — WebSSH Gateway

> 此文件是每次代码变更必须通过的强制质量清单。
> 任务启动前输出 Phase A，交付前输出 Phase A+B 做最终确认。

## Phase A: 任务启动前

| # | 项目 | 状态 | 备注 |
|---|------|------|------|
| 1 | **执行模式选择** — Claude solo / Codex+Gemini / Team | □ | 必须你选，我不默认 |
| 2 | **任务范围确认** — 改什么 | □ | 一句话描述 |
| 3 | **任务范围确认** — 不改什么 | □ | 边界划定 |
| 4 | **复杂度评估** — S / M / L / XL | □ | 不确定时选高一级 |
| 5 | **安全敏感变更** — auth/crypto/输入校验 | □ | 是→必须 verify-security |

## Phase B: 代码交付前

| # | 项目 | 状态 | 备注 |
|---|------|------|------|
| 6 | verify-change | □ | 影响分析 + 文档同步 |
| 7 | verify-quality | □ | 复杂度/重复/命名 |
| 8 | verify-security (如适用) | □ | 安全扫描 |
| 9 | 交叉审查 (改动 > 30 行) | □ | Gemini/Codex 双视角 |
| 10 | CHANGELOG [Unreleased] 更新 | □ | |
| 11 | VERSION 推进 | □ | feat→MINOR, fix→PATCH |
| 12 | Conventional Commits 格式提交 | □ | |
| 13 | 真实验证 (运行时变更) | □ | curl/grep 确认 |

**规则**: Phase A 的 1-5 必须全 ✅ 才能写代码。Phase B 的 6-13 必须全 ✅ 才能交付。任一 ❌ 先修复。
