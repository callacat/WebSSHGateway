# 开发与部署指南（社区版）

> English version: [DEPLOYMENT.en.md](./DEPLOYMENT.en.md)

## 1. 环境要求

- Python 3.11+
- Node.js 20+
- npm 10+
- Docker 24+（如使用容器部署）

## 2. 环境变量

复制并修改示例配置：

```bash
cp .env.example .env
```

关键变量说明：

- `SECRET_KEY`：必须为 16/24/32 字节长度，推荐 32 字节（即 64 位十六进制字符）。务必修改为你自己的高强度随机值，不可使用示例值。
- `DATABASE_URL`：默认 `sqlite:////data/app.db`。
- `SSH_KNOWN_HOSTS`：已知主机文件路径。
- `SSH_ALLOW_UNKNOWN_HOSTS`：是否允许未知主机。
- `VITE_API_BASE`：前端开发模式下 API 地址。

安全提示：上线前请再次确认 `SECRET_KEY` 已替换，否则会导致鉴权令牌与会话安全风险。

#### 快速生成 32 字节 SECRET_KEY

任选以下一种方式生成一个 32 字节（即 64 位十六进制字符）的高强度随机值，直接填入 `.env` 的 `SECRET_KEY=` 后面：

```bash
# 方式 1：openssl（推荐，几乎所有 Linux/macOS 自带，输出 64 位十六进制 = 32 字节）
openssl rand -hex 32

# 方式 2：读取 /dev/urandom（无 openssl 时可用）
head -c 32 /dev/urandom | xxd -p -c 64
# 或（无 xxd 时）：head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'

# 方式 3：Python（任意平台通用，要求 Python 3.6+）
python3 -c 'import secrets; print(secrets.token_hex(32))'

# 方式 4：uuidgen + 拼接（仅应急，强度弱于上面三种；两个 128 位 UUID 去横杠拼接得到 64 字符 = 32 字节）
echo "$(uuidgen | tr -d '-')$(uuidgen | tr -d '-')"
```

> 说明：`SECRET_KEY` 同时用于 JWT HS256 签名与 AES-GCM 凭据加密，长度必须落在 16 / 24 / 32 字节三种之一，因此上述命令统一生成 32 字节（即 64 位十六进制字符串）的值。生成的值彼此等价可用，任选其一即可。

一键写入 `.env` 的便捷写法：

```bash
# 生成并直接替换 .env 中的 SECRET_KEY 行（若 .env 尚未有该行，请新增）
SECRET_KEY_NEW=$(openssl rand -hex 32)
sed -i "s|^SECRET_KEY=.*|SECRET_KEY=${SECRET_KEY_NEW}|" .env
grep '^SECRET_KEY=' .env  # 确认已写入
```

## 3. 本地开发部署

### 3.1 启动后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 将根目录 .env 注入当前 shell（可按需改为手动 export）
set -a
source ../.env
set +a

uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

后端默认地址：`http://127.0.0.1:8080`

### 3.2 启动前端（开发模式）

新开一个终端：

```bash
cd frontend
npm ci
VITE_API_BASE=http://127.0.0.1:8080 npm run dev -- --host 0.0.0.0 --port 5173
```

前端地址：`http://127.0.0.1:5173`

### 3.3 本地一体化静态托管（可选）

若希望由后端直接托管前端静态文件：

```bash
cd frontend
npm ci
npm run build

cd ../backend
source .venv/bin/activate
set -a
source ../.env
set +a
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

构建结果会输出到 `backend/frontend/dist`，由后端自动挂载。

## 4. Docker 镜像部署

Docker Hub 镜像：`https://hub.docker.com/r/beibeizi/websshgateway`

快速启动示例（注意：`SECRET_KEY` 仅为示例，自行部署必须替换，推荐使用 `openssl rand -hex 32` 生成的 64 位十六进制值）：

```bash
docker run -d -p 8080:8080 -e SECRET_KEY="67e457b4eab14012b34382b3d634f297" beibeizi/websshgateway:latest
```

### 4.1 单容器部署

```bash
docker build -t webssh-gateway:community .
export DOCKER_IMAGE=beibeizi/websshgateway:latest

docker run -d \
  --name webssh-gateway \
  -p 8080:8080 \
  --env-file .env \
  -v webssh-data:/data \
  ${DOCKER_IMAGE:-webssh-gateway:community}
```

访问地址：`http://127.0.0.1:8080`

### 4.2 Docker Compose 部署

```bash
docker compose up -d --build
```

停止：

```bash
docker compose down
```

## 5. 首次登录

- 默认初始化账号：`admin`
- 初始密码会在后端启动日志打印一次（首次建库时）
- 首次登录后会强制修改密码

## 6. 升级与回滚建议

### 6.1 升级

```bash
git pull
docker compose build --pull
docker compose up -d
```

### 6.2 备份数据卷

```bash
docker run --rm \
  -v webssh-data:/data \
  -v "$(pwd)":/backup \
  alpine sh -c "tar -czf /backup/webssh-data-backup.tgz -C /data ."
```

## 7. 常见问题

- 无法登录：检查 `SECRET_KEY` 长度是否满足 16/24/32 字节。
- SSH 连接失败：确认目标主机可达、账号凭据正确、主机 key 策略配置正确。
- 前端请求 401：检查 token 是否过期，或 `VITE_API_BASE` 是否指向正确后端。
