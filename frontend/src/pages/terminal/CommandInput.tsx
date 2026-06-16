import React from "react";

const MAX_HISTORY = 50;

type CommandInputProps = {
  onSend: (command: string) => void;
  disabled?: boolean;
  isDark: boolean;
  t: (zh: string, en: string) => string;
};

export function CommandInput({ onSend, disabled = false, isDark, t }: CommandInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = React.useState("");
  const [history, setHistory] = React.useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem("terminal-command-history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const historyIndexRef = React.useRef(-1); // -1 = fresh input, 0..n = stepping back

  // 持久化历史
  React.useEffect(() => {
    try {
      sessionStorage.setItem("terminal-command-history", JSON.stringify(history));
    } catch {
      // sessionStorage 容量不足时静默失败
    }
  }, [history]);

  const adjustHeight = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 150;
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  // value 变化时自动调整高度
  React.useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const appendHistory = React.useCallback((cmd: string) => {
    setHistory((prev) => {
      // 去重：如果最后一条相同则不重复添加
      if (prev.length > 0 && prev[prev.length - 1] === cmd) {
        return prev;
      }
      const next = [...prev, cmd];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    });
  }, []);

  const handleSend = React.useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed + "\r");
    appendHistory(trimmed);
    setValue("");
    historyIndexRef.current = -1;
  }, [value, disabled, onSend, appendHistory]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;
        const idx = historyIndexRef.current;
        if (idx === -1) {
          // 从最新一条开始
          historyIndexRef.current = history.length - 1;
          setValue(history[history.length - 1]);
        } else if (idx > 0) {
          historyIndexRef.current = idx - 1;
          setValue(history[idx - 1]);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const idx = historyIndexRef.current;
        if (idx === -1) return;
        if (idx < history.length - 1) {
          historyIndexRef.current = idx + 1;
          setValue(history[idx + 1]);
        } else {
          // 回到新输入
          historyIndexRef.current = -1;
          setValue("");
        }
        return;
      }
    },
    [history, handleSend]
  );

  return (
    <div
      className={`flex items-end gap-2 px-3 py-2 border-t ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-gray-50"
      }`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          historyIndexRef.current = -1;
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={4096}
        placeholder={t("输入命令，Enter 发送 · Shift+Enter 换行 · ↑↓ 历史", "Type command, Enter to send · Shift+Enter for new line · ↑↓ for history")}
        className={`flex-1 resize-none rounded-lg border px-3 py-2 text-sm leading-5 outline-none transition-colors ${
          isDark
            ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500"
            : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label={t("命令输入框", "Command input")}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          disabled || !value.trim()
            ? isDark
              ? "bg-slate-800 text-slate-600 cursor-not-allowed"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
            : isDark
              ? "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700"
              : "bg-indigo-500 text-white hover:bg-indigo-400 active:bg-indigo-600"
        }`}
        aria-label={t("发送", "Send")}
      >
        {t("发送", "Send")}
      </button>
    </div>
  );
}
