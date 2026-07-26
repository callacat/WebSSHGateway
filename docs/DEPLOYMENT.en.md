# Development and Deployment Guide (Community Edition)

> 中文版请见：[DEPLOYMENT.md](./DEPLOYMENT.md)

## 1. Prerequisites

- Python 3.11+
- Node.js 20+
- npm 10+
- Docker 24+ (for container deployment)

## 2. Environment Variables

```bash
cp .env.example .env
```

Important variables:

- `SECRET_KEY`: must be 16/24/32 bytes (32 chars recommended). You must replace it with your own strong random value and never keep example/default values.
- `DATABASE_URL`: default `sqlite:////data/app.db`
- `SSH_KNOWN_HOSTS`: known hosts path
- `SSH_ALLOW_UNKNOWN_HOSTS`: allow unknown host keys or not
- `VITE_API_BASE`: frontend API base in development mode

Security reminder: verify `SECRET_KEY` is replaced before going live, otherwise authentication/session security is at risk.

#### Quickly generate a 32-byte SECRET_KEY

Pick any one of the commands below to generate a strong 32-byte (i.e. 64 hex chars) random value, then paste it after `SECRET_KEY=` in your `.env`:

```bash
# Option 1: openssl (recommended; bundled on almost all Linux/macOS; outputs 64 hex chars = 32 bytes)
openssl rand -hex 32

# Option 2: read /dev/urandom (when openssl is unavailable)
head -c 32 /dev/urandom | xxd -p -c 64
# or, without xxd:   head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'

# Option 3: Python (works on any platform; needs Python 3.6+)
python3 -c 'import secrets; print(secrets.token_hex(32))'

# Option 4: uuidgen + concat (fallback only; weaker than the options above; two 128-bit UUIDs stripped of dashes yield 32 chars)
echo "$(uuidgen | tr -d '-')$(uuidgen | tr -d '-')"
```

> Note: `SECRET_KEY` is used for both JWT HS256 signing and AES-GCM credential encryption, so its length must be exactly 16, 24, or 32 bytes. The commands above therefore produce a 32-byte value (a 64-character hex string). All of them are equivalent and interchangeable — pick whichever is available on your system.

Convenience one-liner to write it straight into `.env`:

```bash
# Generate and replace the SECRET_KEY line in .env (add the line first if it does not exist)
SECRET_KEY_NEW=$(openssl rand -hex 32)
sed -i "s|^SECRET_KEY=.*|SECRET_KEY=${SECRET_KEY_NEW}|" .env
grep '^SECRET_KEY=' .env  # confirm it was written
```

## 3. Local Development

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
set -a
source ../.env
set +a
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### Frontend

```bash
cd frontend
npm ci
VITE_API_BASE=http://127.0.0.1:8080 npm run dev -- --host 0.0.0.0 --port 5173
```

## 4. Docker Deployment

Docker Hub image: `https://hub.docker.com/r/beibeizi/websshgateway`

Quick start example (note: `SECRET_KEY` is an example, replace it in your own deployment; a 32‑char UUID is enough):

```bash
docker run -d -p 8080:8080 -e SECRET_KEY="67e457b4eab14012b34382b3d634f297" beibeizi/websshgateway:latest
```

### Single Container

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

### Docker Compose

```bash
docker compose up -d --build
```

## 5. First Login

- Default user: `admin`
- Initial password is printed in backend logs at first startup
- Password change is required after first login
