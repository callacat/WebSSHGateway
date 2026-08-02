from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from app.core.db import utc_now
from app.services.terminal_sanitize import sanitize_terminal_output


@dataclass
class SessionOutput:
    data: str
    timestamp: datetime


@dataclass
class PtyInfo:
    term: str
    rows: int
    cols: int


class SessionHandle(Protocol):
    session_id: str

    async def send(self, data: str) -> None:
        ...

    async def resize(self, rows: int, cols: int) -> None:
        ...

    async def close(self) -> None:
        ...


@dataclass
class SessionBuffer:
    max_lines: int = 4000
    max_bytes: int = 8 * 1024 * 1024
    lines: list[SessionOutput] | None = None
    total_bytes: int = 0

    def __post_init__(self) -> None:
        if self.lines is None:
            self.lines = []
        self.total_bytes = sum(len(item.data.encode("utf-8")) for item in self.lines)

    def append(self, data: str) -> None:
        data_size = len(data.encode("utf-8"))
        self.lines.append(SessionOutput(data=data, timestamp=utc_now()))
        self.total_bytes += data_size
        while len(self.lines) > self.max_lines or self.total_bytes > self.max_bytes:
            removed = self.lines.pop(0)
            self.total_bytes -= len(removed.data.encode("utf-8"))

    def dump(self) -> list[SessionOutput]:
        # 清洗"缺 CSI 前缀"的裸控制序列残留（SGR 鼠标事件 / DSR 响应）。
        # 这类数据是 tmux pane 被 TUI 程序污染后写入缓冲的，原样回放会给
        # 用户造成满屏无意义字符（如 "35;82;22M35;81;22M..."）。
        return [
            SessionOutput(data=cleaned, timestamp=item.timestamp)
            for item in (self.lines or [])
            if (cleaned := sanitize_terminal_output(item.data))
        ]
