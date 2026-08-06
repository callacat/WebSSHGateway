from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from pathlib import Path
import os


@dataclass(frozen=True)
class AppConfig:
    secret_keys: list[bytes]
    database_url: str
    jwt_issuer: str
    jwt_access_ttl: timedelta
    jwt_remember_ttl: timedelta
    login_lock_minutes: int
    login_lock_threshold: int
    session_keepalive_interval: int
    log_level: str
    port: int
    ssh_known_hosts: str | None
    ssh_allow_unknown_hosts: bool
    ssh_auto_add_known_hosts: bool
    cors_allow_origins: list[str]
    keepalive_binary_dir: str


def _decode_secret_key(value: str) -> bytes:
    """把 SECRET_KEY 环境变量值规范化为密钥字节。

    兼容三种形式：
    1. 64 字符 hex 字符串（``openssl rand -hex 32`` 输出）→ 解码为 32 字节；
    2. 48 字符 hex 字符串（``openssl rand -hex 24`` 输出）→ 解码为 24 字节；
    3. 原始字符串（任意 16/24/32 字符，如旧文档的 32 字符随机串）→ 按 UTF-8
       编码后长度需为 16/24/32 字节。

    关键约束：32 字符的字符串**一律按原始字节处理，不做 hex 解码**。历史上
    SECRET_KEY 直接按字符串 UTF-8 编码作为密钥，32 字符随机串（如
    ``08e7550a0784d000aca63d99dca08962``）是既有部署的常见配置；若把它当
    16 字节 hex 解码，会让旧数据的 AES-GCM 凭据无法解密，导致已保存的连接
    全部失效。要生成 16 字节密钥请使用 ``openssl rand -hex 16``（输出 32 字符
    hex，但那是新部署的选择；对既有部署保持原样最安全）。
    """
    candidate = value.strip()
    if len(candidate) in {48, 64}:
        try:
            decoded = bytes.fromhex(candidate)
        except ValueError:
            decoded = None
        if decoded is not None and len(decoded) in {24, 32}:
            return decoded
    encoded = candidate.encode("utf-8")
    if len(encoded) not in {16, 24, 32}:
        raise RuntimeError(
            "SECRET_KEY must be 16/24/32 bytes; suggest using `openssl rand -hex 32` "
            "(64 hex chars = 32 bytes)"
        )
    return encoded


def load_config() -> AppConfig:
    secret_value = os.getenv("SECRET_KEY", "")
    if not secret_value.strip():
        raise RuntimeError("SECRET_KEY is required")
    secret_keys = [_decode_secret_key(key) for key in secret_value.split(",") if key.strip()]

    database_url = os.getenv("DATABASE_URL", "sqlite:////data/app.db")
    jwt_issuer = os.getenv("JWT_ISSUER", "webssh-gateway")
    jwt_access_ttl = timedelta(hours=int(os.getenv("JWT_ACCESS_TTL_HOURS", "12")))
    jwt_remember_ttl = timedelta(days=int(os.getenv("JWT_REMEMBER_TTL_DAYS", "7")))
    login_lock_minutes = int(os.getenv("LOGIN_LOCK_MINUTES", "15"))
    login_lock_threshold = int(os.getenv("LOGIN_LOCK_THRESHOLD", "5"))
    session_keepalive_interval = int(os.getenv("SESSION_KEEPALIVE_INTERVAL", "60"))
    log_level = os.getenv("LOG_LEVEL", "INFO")
    port = int(os.getenv("PORT", "8080"))
    ssh_known_hosts = os.getenv("SSH_KNOWN_HOSTS")
    ssh_allow_unknown_hosts = os.getenv("SSH_ALLOW_UNKNOWN_HOSTS", "false").lower() == "true"
    ssh_auto_add_known_hosts = os.getenv("SSH_AUTO_ADD_KNOWN_HOSTS", "true").lower() == "true"
    cors_allow_origins = [origin.strip() for origin in os.getenv("CORS_ALLOW_ORIGINS", "").split(",") if origin.strip()]
    keepalive_binary_dir = os.getenv(
        "KEEPALIVE_BINARY_DIR",
        str((Path(__file__).resolve().parents[3] / "session-transfer-files" / "tmux").resolve()),
    )

    return AppConfig(
        secret_keys=secret_keys,
        database_url=database_url,
        jwt_issuer=jwt_issuer,
        jwt_access_ttl=jwt_access_ttl,
        jwt_remember_ttl=jwt_remember_ttl,
        login_lock_minutes=login_lock_minutes,
        login_lock_threshold=login_lock_threshold,
        session_keepalive_interval=session_keepalive_interval,
        log_level=log_level,
        port=port,
        ssh_known_hosts=ssh_known_hosts,
        ssh_allow_unknown_hosts=ssh_allow_unknown_hosts,
        ssh_auto_add_known_hosts=ssh_auto_add_known_hosts,
        cors_allow_origins=cors_allow_origins,
        keepalive_binary_dir=keepalive_binary_dir,
    )
