"""SECRET_KEY 解析与校验的单元测试。

覆盖 ``_decode_secret_key`` 对 hex 字符串与原始字符串两种形式的兼容，
以及非法长度（非 16/24/32 字节）的正确拒绝。
"""

from __future__ import annotations

import pytest

from app.core.config import _decode_secret_key


class TestDecodeSecretKey:
    def test_hex_32_bytes(self) -> None:
        # openssl rand -hex 32 -> 64 hex 字符 = 32 字节
        value = "c8ab6d4eb00de6a5597f8f7423a6cfff2bcfc5d992a06957df3aab23ea2abcf7"
        key = _decode_secret_key(value)
        assert len(key) == 32

    def test_hex_16_bytes(self) -> None:
        # openssl rand -hex 16 -> 32 hex 字符 = 16 字节
        value = "ab" * 16
        key = _decode_secret_key(value)
        assert len(key) == 16

    def test_raw_32_chars(self) -> None:
        value = "abcdefghijklmnopqrstuvwxyz123456"
        key = _decode_secret_key(value)
        assert len(key) == 32

    def test_raw_16_chars(self) -> None:
        value = "abcdefghijklmnop"
        key = _decode_secret_key(value)
        assert len(key) == 16

    def test_rejects_34_char_example(self) -> None:
        # 旧文档示例值：34 字符，既不是合法 hex 也不是合法长度
        value = "replace-with-32-char-secret-123456"
        with pytest.raises(RuntimeError, match="16/24/32 bytes"):
            _decode_secret_key(value)

    def test_rejects_too_short(self) -> None:
        with pytest.raises(RuntimeError, match="16/24/32 bytes"):
            _decode_secret_key("short")

    def test_rejects_too_long_raw(self) -> None:
        # 64 个非 hex 字符（如随机 ASCII），解码失败
        value = "x" * 64
        with pytest.raises(RuntimeError, match="16/24/32 bytes"):
            _decode_secret_key(value)

    def test_rejects_odd_length_hex(self) -> None:
        # 63 个 hex 字符，bytes.fromhex 会抛 ValueError -> 走原始串分支
        value = "a" * 63
        with pytest.raises(RuntimeError, match="16/24/32 bytes"):
            _decode_secret_key(value)
