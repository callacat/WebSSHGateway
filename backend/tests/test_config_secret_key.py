"""SECRET_KEY 解析与校验的单元测试。

覆盖 ``_decode_secret_key`` 对 hex 字符串与原始字符串两种形式的兼容，
以及非法长度（非 16/24/32 字节）的正确拒绝。

关键设计：32 字符的字符串一律按原始 UTF-8 字节处理（不做 hex 解码），
以兼容既有部署中直接使用 32 字符随机串作为 SECRET_KEY 的场景。
仅 48/64 字符的全 hex 字符串才做 hex 解码。
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

    def test_hex_24_bytes(self) -> None:
        # openssl rand -hex 24 -> 48 hex 字符 = 24 字节
        value = "ab" * 24
        key = _decode_secret_key(value)
        assert len(key) == 24

    def test_raw_32_chars(self) -> None:
        value = "abcdefghijklmnopqrstuvwxyz123456"
        key = _decode_secret_key(value)
        assert len(key) == 32
        assert key == value.encode("utf-8")

    def test_raw_32_hex_chars_as_raw(self) -> None:
        # 32 字符 hex 串按原始字节处理，不做 hex 解码（向后兼容）
        value = "08e7550a0784d000aca63d99dca08962"
        key = _decode_secret_key(value)
        assert len(key) == 32
        assert key == value.encode("utf-8")
        # 不应被 hex 解码为 16 字节
        assert key != bytes.fromhex(value)

    def test_raw_16_chars(self) -> None:
        value = "abcdefghijklmnop"
        key = _decode_secret_key(value)
        assert len(key) == 16
        assert key == value.encode("utf-8")

    def test_rejects_34_char_example(self) -> None:
        # 旧文档示例值：34 字符，既不是合法 hex 也不是合法长度
        value = "replace-with-32-char-secret-123456"
        with pytest.raises(RuntimeError, match="16/24/32 bytes"):
            _decode_secret_key(value)

    def test_rejects_too_short(self) -> None:
        with pytest.raises(RuntimeError, match="16/24/32 bytes"):
            _decode_secret_key("short")

    def test_rejects_too_long_raw(self) -> None:
        # 64 个非 hex 字符（如随机 ASCII），解码失败 → 64 字节 > 32，拒绝
        value = "x" * 64
        with pytest.raises(RuntimeError, match="16/24/32 bytes"):
            _decode_secret_key(value)

    def test_rejects_odd_length_hex(self) -> None:
        # 63 个 hex 字符，bytes.fromhex 会抛 ValueError -> 走原始串分支
        value = "a" * 63
        with pytest.raises(RuntimeError, match="16/24/32 bytes"):
            _decode_secret_key(value)

    def test_whitespace_stripped(self) -> None:
        value = "  abcdefghijklmnop  "
        key = _decode_secret_key(value)
        assert len(key) == 16
        assert key == "abcdefghijklmnop".encode("utf-8")
