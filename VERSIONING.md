# CLI 版本管理规范

本项目遵循 **SemVer 2.0** + **Conventional Commits 1.0** + **Keep a Changelog 1.1** 行业标准。以下为各 CLI 必须遵守的执行细则。

---

## 1. 版本号规则 (SemVer)

格式：`MAJOR.MINOR.PATCH`

| 版本位 | 触发条件 | 示例 |
|--------|---------|------|
| **MAJOR** | 破坏性 API 变更 | `feat!:` 或 `BREAKING CHANGE` footer |
| **MINOR** | 新增功能（向下兼容） | `feat:` |
| **PATCH** | Bug 修复（向下兼容） | `fix:` |
| **+0** | 文档/重构/测试/工具 | `docs:`, `refactor:`, `test:`, `chore:` |

- **0.y.z** — 初始开发阶段，API 不稳定
- **1.0.0** — 首次对外发布
- **预发布** — `1.0.0-alpha.1`, `1.0.0-beta.1`
- 已发布版本的内容 **严禁修改**，任何变更必须发布新版本

> 权威来源：[semver.org](https://semver.org/)

---

## 2. 提交信息规范 (Conventional Commits)

### 格式

```
<type>(<scope>): <subject>

[body]

[footer(s)]
```

### 类型

| Type | 含义 | 版本影响 |
|------|------|---------|
| `feat` | 新功能 | MINOR |
| `fix` | Bug 修复 | PATCH |
| `docs` | 文档变更 | 不递进 |
| `style` | 代码格式（不影响逻辑） | 不递进 |
| `refactor` | 重构（非功能、非修复） | 不递进 |
| `perf` | 性能优化 | 不递进 |
| `test` | 测试相关 | 不递进 |
| `chore` | 构建/工具/依赖 | 不递进 |
| `ci` | CI 配置变更 | 不递进 |
| `build` | 构建系统或外部依赖 | 不递进 |

### 破坏性变更

两种标记均可，二选一：

```
feat(api): remove deprecated endpoint
BREAKING CHANGE: endpoint /v1/users/list removed
# 或
feat(api)!: remove deprecated endpoint
```

### 规范

- 首行 ≤ **72 字符**
- 使用 **祈使语气**（"add" 而非 "added" 或 "adds"）
- scope 用小写 + 连字符，如 `cli-a`, `cli-b`

> 权威来源：[conventionalcommits.org](https://www.conventionalcommits.org/)

---

## 3. 变更记录规范 (Keep a Changelog)

### 文件要求

- 每个 CLI 根目录必须包含 **`CHANGELOG.md`**
- 格式：**逆向时间排序**（最新版本在最前）

### 模板

```markdown
# Changelog

## [Unreleased]

### Added
- 新功能说明

### Changed
- 现有功能变更

### Deprecated
- 即将移除的功能

### Removed
- 已移除的功能

### Fixed
- Bug 修复

### Security
- 安全修复

## [1.2.3] - 2026-06-08

### Fixed
- 修复 xxx 导致的崩溃 (#42)
```

### 分类说明

| 分类 | 何时用 |
|------|--------|
| **Added** | 新功能、新命令、新选项 |
| **Changed** | 功能调整、行为变更、性能优化 |
| **Deprecated** | 标记即将废弃的功能 |
| **Removed** | 实际移除废弃功能 |
| **Fixed** | Bug 修复 |
| **Security** | 安全漏洞修复 |

### 规则

- Unreleased 节始终保留在顶部，累积未发布变更
- 每个版本标注发布日期（ISO 8601：`YYYY-MM-DD`）
- 严重问题导致撤回的版本标记为 `[YANKED]`
- **禁止** 直接粘贴 git log — 必须人工精选有意义的内容

> 权威来源：[keepachangelog.com](https://keepachangelog.com/)

---

## 4. 多 CLI 场景特有规则

### 4.1 仓库布局

三选一，推荐选项 A：

| 选项 | 适用场景 | 说明 |
|------|---------|------|
| **A) 独立仓库** ✅ | CLI 间无代码共享 | 每个 CLI 独立 `v1.0.0`，独立 CHANGELOG |
| B) 单仓独立目录 | CLI 间有共享代码 | 每个 CLI 有自己的 `VERSION` + `CHANGELOG.md` |
| C) 单仓单版本 | CLI 作为统一包发布 | 整个仓库一个版本号 |

**推荐选项 A**（独立仓库），除非有明确理由才选 B。

### 4.2 Tag 命名

- **独立仓库**：标准 tag，`v1.0.0`
- **单仓独立目录**：带前缀 tag，`cli-a/v1.0.0`，`cli-b/v2.1.0`

### 4.3 回退操作

```bash
# 查看历史版本
git tag -l 'v*'

# 回退某个 CLI 到指定版本（独立仓库）
git checkout v1.2.2

# 回退某个 CLI（单仓多 CLI）
git checkout cli-a/v1.2.2 -- cli-a/
git tag -d cli-a/v1.2.3
```

---

## 5. 推荐工具链

### 方案对比

| 维度 | 方案 A：semantic-release | 方案 B：commit-and-tag-version | 方案 C：纯手动 |
|------|------------------------|-------------------------------|--------------|
| **自动化程度** | 全自动（CI 触发） | 半自动（CLI 命令触发） | 手动 |
| **版本号** | 自动分析 commits 计算 | 自动分析 commits 计算 | 手动修改 |
| **CHANGELOG** | 自动生成 | 自动生成 | 手动编写 |
| **Git Tag** | 自动创建 | 自动创建 | 手动打 tag |
| **CI 依赖** | 必须 | 可选 | 无 |
| **学习成本** | 中 | 低 | 低 |
| **稳定度** | 极高，业界第一 | 高 | — |

**推荐**：日常开发用方案 B，上线用方案 A。

### 方案 A：semantic-release（全自动）

在 CI 中配置（GitHub Actions / GitLab CI）：

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx semantic-release
```

配置见项目根 `package.json`：

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/git"
  ]
}
```

> 项目地址：[semantic-release](https://github.com/semantic-release/semantic-release)

### 方案 B：commit-and-tag-version（半自动）

提交完代码后手动执行：

```bash
# 安装
npm install --save-dev commit-and-tag-version

# 发布新版（自动分析 commits → 推进版本号 + 生成 CHANGELOG + 打 tag）
npx commit-and-tag-version

# 指定预发布版本
npx commit-and-tag-version --prerelease alpha

# 首次发布
npx commit-and-tag-version --first-release
```

> commit-and-tag-version 是 `standard-version` 的继任者，[GitHub 地址](https://github.com/absolute-version/commit-and-tag-version)

### 辅助工具

| 工具 | 用途 | 安装 |
|------|------|------|
| **commitizen** | 交互式引导写 Conventional Commit | `npm install -g commitizen` → `git cz` 替代 `git commit` |
| **commitlint** | Git 钩子校验提交信息格式 | 自动拦截不合规提交 |
| **husky** | Git 钩子管理器 | 配置 commit-msg 钩子自动跑 commitlint |

---

## 6. 发布流程

### 日常开发

```
1. git checkout -b feat/xxx
2. 开发 → git commit（Conventional Commits 格式）
3. git push → PR → merge to main
```

### 发布新版本

```
1. git checkout main && git pull
2. npx commit-and-tag-version          # 自动推进版本号 + CHANGELOG + tag
3. git push --follow-tags origin main  # 推送代码和 tag
4. 可选：自动触发 CI 部署
```

### 紧急修复

```
1. 从上一个版本 tag 开分支： git checkout -b hotfix v1.2.2
2. 修复 → git commit -m "fix: ..."
3. PR → merge to main
4. npx commit-and-tag-version          # 自动识别为 PATCH 递进
```

---

## 7. 强制校验

每个 CLI 项目根目录配置：

```json
// package.json
{
  "scripts": {
    "commit": "git cz",
    "release": "commit-and-tag-version",
    "release:first": "commit-and-tag-version --first-release",
    "lint-commits": "commitlint --from HEAD~10"
  },
  "commitlint": {
    "extends": ["@commitlint/config-conventional"]
  }
}
```

```bash
# .husky/commit-msg
npx --no-install commitlint --edit $1
```

---

## 附录：引用标准

| 标准 | 版本 | 链接 |
|------|------|------|
| Semantic Versioning | 2.0.0 | https://semver.org/ |
| Conventional Commits | 1.0.0 | https://www.conventionalcommits.org/ |
| Keep a Changelog | 1.1.0 | https://keepachangelog.com/ |
| semantic-release | latest | https://semantic-release.gitbook.io/ |
| commit-and-tag-version | latest | https://github.com/absolute-version/commit-and-tag-version |
