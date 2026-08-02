FROM node:20-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --legacy-peer-deps && chmod -R +x node_modules/.bin/
COPY frontend ./
RUN mkdir -p /backend/frontend
RUN node node_modules/vite/bin/vite.js build

FROM python:3.11-slim
RUN useradd -m appuser
ENV TZ=Asia/Shanghai
RUN apt-get update && apt-get install -y --no-install-recommends tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY backend /app/backend
COPY session-transfer-files /app/session-transfer-files
COPY --from=frontend-build /backend/frontend/dist /app/backend/frontend/dist

WORKDIR /app/backend
RUN mkdir -p /data && chown -R appuser:appuser /data \
    && chmod +x /app/backend/docker-entrypoint.sh
USER appuser

EXPOSE 8080

ENTRYPOINT ["/app/backend/docker-entrypoint.sh"]
