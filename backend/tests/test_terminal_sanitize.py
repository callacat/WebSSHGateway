"""终端输出清洗的单元测试（裸控制序列残留过滤）。"""

from __future__ import annotations

from app.services.terminal_sanitize import sanitize_terminal_output


class TestSanitizeTerminalOutput:
    def test_strips_bare_sgr_mouse_event_run(self) -> None:
        polluted = (
            "root@arm:/home/warp-go# 35;178;1M35;178;2M35;177;3M"
            "997;2n997;2n35;158;24M35;157;24M"
        )
        cleaned = sanitize_terminal_output(polluted)
        assert cleaned == "root@arm:/home/warp-go# "
        assert "35;" not in cleaned
        assert "997" not in cleaned

    def test_strips_user_reported_garbage(self) -> None:
        # 用户报告的真实刷屏片段
        garbage = (
            "3M35;82;22M35;81;22M35;82;22M35;82;23M35;83;23M35;84;23M"
            "35;84;24M35;84;25M35;84;26M35;85;26M35;86;26M35;87;26M"
            "35;88;26M35;89;26M35;91;26M35;93;26M"
        )
        cleaned = sanitize_terminal_output(garbage)
        # 主体垃圾（多段 SGR 鼠标事件）全部清除；开头 "3M" 是前一条消息
        # 截断残留的单段，保守保留（避免误删正常文本），不构成刷屏。
        assert "35;" not in cleaned

    def test_strips_bare_dsr_run(self) -> None:
        assert sanitize_terminal_output("997;2n997;2n997;2n") == ""

    def test_preserves_full_csi_sequences(self) -> None:
        full = "\x1b[1;24r\x1b[?1;2c\x1b[>0;276;0c\x1b[1;1H\x1b[2Jroot@arm:~# "
        assert sanitize_terminal_output(full) == full

    def test_preserves_full_sgr_mouse_sequence(self) -> None:
        sgr = "\x1b[<35;82;22M"
        assert sanitize_terminal_output(sgr) == sgr

    def test_preserves_normal_text_and_dates(self) -> None:
        text = "echo TERMTEST_123\nKilled\n2026-08-02 16:42:01 [INFO] version 1.0.0\n"
        assert sanitize_terminal_output(text) == text

    def test_preserves_editor_content(self) -> None:
        text = "vim 3M mode\n"
        assert sanitize_terminal_output(text) == text

    def test_removes_garbage_mixed_with_prompt(self) -> None:
        mixed = "root@arm:~# ls -la\n35;82;22M35;81;22M35;80;22Mroot@arm:~# "
        assert sanitize_terminal_output(mixed) == "root@arm:~# ls -la\nroot@arm:~# "

    def test_empty_input(self) -> None:
        assert sanitize_terminal_output("") == ""
