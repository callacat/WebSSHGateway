import React from "react";
import type { QuickCommandItem, QuickCommandCreate, QuickCommandUpdate } from "../../lib/api";
import { listQuickCommands, createQuickCommand, updateQuickCommand, deleteQuickCommand } from "../../lib/api";

type QuickCommandsProps = {
  onSend: (command: string) => void;
  disabled?: boolean;
  isDark: boolean;
  t: (zh: string, en: string) => string;
  initiallyCollapsed?: boolean;
};

function localizeError(t: (zh: string, en: string) => string, err: unknown): string {
  if (err instanceof Error) return err.message;
  return t("操作失败", "Operation failed");
}

export function QuickCommands({
  onSend,
  disabled = false,
  isDark,
  t,
  initiallyCollapsed = false,
}: QuickCommandsProps) {
  const [commands, setCommands] = React.useState<QuickCommandItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(initiallyCollapsed);

  // ── Load data ──────────────────────────────────────
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listQuickCommands()
      .then((data) => {
        if (!cancelled) setCommands(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Group by group_name ────────────────────────────
  const groups = React.useMemo(() => {
    const map = new Map<string, QuickCommandItem[]>();
    for (const cmd of commands) {
      const g = cmd.group_name || t("未分组", "Ungrouped");
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(cmd);
    }
    return Array.from(map.entries());
  }, [commands, t]);

  // ── Handle click ───────────────────────────────────
  const handleClick = React.useCallback(
    (command: string) => {
      if (disabled) return;
      onSend(command + "\r");
    },
    [disabled, onSend]
  );

  if (loading) {
    return (
      <div className={`px-3 py-1.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        {t("加载中...", "Loading...")}
      </div>
    );
  }

  if (commands.length === 0) {
    return (
      <div className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <div className={`flex items-center justify-between px-3 py-1.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`} role="status" aria-label={t("无快捷命令", "No quick commands")}>
          <span>{t("快捷命令", "Quick Commands")}</span>
          <span className="text-[10px] opacity-60">{t("暂无", "Empty")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
      {/* 折叠/展开控制行 */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className={`flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
          isDark
            ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        }`}
      >
        <span>{t("快捷命令", "Quick Commands")}</span>
        <div className="flex items-center gap-2">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setManageOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                setManageOpen(true);
              }
            }}
            className={`text-xs underline-offset-2 hover:underline ${
              isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-500 hover:text-indigo-600"
            }`}
            aria-label={t("管理快捷命令", "Manage quick commands")}
          >
            {t("管理", "Manage")}
          </span>
          <span className={`transition-transform ${collapsed ? "" : "rotate-180"}`}>▾</span>
        </div>
      </button>

      {/* 命令按钮列表 */}
      {!collapsed && (
        <div className={`max-h-48 overflow-y-auto px-3 pb-2 ${isDark ? "dark-scrollbar" : "light-scrollbar"}`}>
          {groups.map(([groupName, items]) => (
            <div key={groupName} className="mt-1">
              {groupName && (
                <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {groupName}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {items.map((cmd) => (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => handleClick(cmd.command)}
                    disabled={disabled}
                    title={`${cmd.name}: ${cmd.command}`}
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      disabled
                        ? isDark
                          ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                          : "bg-slate-100 text-slate-300 cursor-not-allowed"
                        : isDark
                          ? "bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-700 hover:border-indigo-500"
                          : "bg-white text-slate-700 hover:bg-indigo-500 hover:text-white border border-slate-200 hover:border-indigo-400 shadow-sm"
                    }`}
                  >
                    <span className="truncate max-w-32">{cmd.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 管理弹窗 */}
      {manageOpen && (
        <QuickCommandManager
          commands={commands}
          setCommands={setCommands}
          onClose={() => setManageOpen(false)}
          isDark={isDark}
          t={t}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Manager Dialog
// ══════════════════════════════════════════════════════════════

type ManagerProps = {
  commands: QuickCommandItem[];
  setCommands: React.Dispatch<React.SetStateAction<QuickCommandItem[]>>;
  onClose: () => void;
  isDark: boolean;
  t: (zh: string, en: string) => string;
};

function dialogBg(isDark: boolean): string {
  return isDark ? "bg-slate-900" : "bg-white";
}

function inputClass(isDark: boolean): string {
  return `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${
    isDark
      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-400"
  }`;
}

function QuickCommandManager({ commands, setCommands, onClose, isDark, t }: ManagerProps) {
  const [editId, setEditId] = React.useState<number | null>(null);
  const [name, setName] = React.useState("");
  const [groupName, setGroupName] = React.useState("");
  const [command, setCommand] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = React.useCallback(() => {
    setEditId(null);
    setName("");
    setGroupName("");
    setCommand("");
    setError(null);
  }, []);

  const handleSave = React.useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedCommand = command.trim();
    if (!trimmedName || !trimmedCommand) {
      setError(t("名称和命令不能为空", "Name and command are required"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: QuickCommandCreate = {
        name: trimmedName,
        group_name: groupName.trim() || "",
        command: trimmedCommand,
      };
      if (editId !== null) {
        const updated = await updateQuickCommand(editId, payload as QuickCommandUpdate);
        setCommands((prev) => prev.map((c) => (c.id === editId ? updated : c)));
      } else {
        const created = await createQuickCommand(payload);
        setCommands((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(localizeError(t, err));
    } finally {
      setSaving(false);
    }
  }, [name, command, groupName, editId, setCommands, t, resetForm]);

  const handleEdit = React.useCallback((cmd: QuickCommandItem) => {
    setEditId(cmd.id);
    setName(cmd.name);
    setGroupName(cmd.group_name);
    setCommand(cmd.command);
    setError(null);
  }, []);

  const handleDelete = React.useCallback(
    async (id: number) => {
      const cmd = commands.find((c) => c.id === id);
      if (!cmd) return;
      // eslint-disable-next-line no-alert
      if (!window.confirm(t(`确定删除「${cmd.name}」？`, `Delete「${cmd.name}」?`))) return;
      try {
        await deleteQuickCommand(id);
        setCommands((prev) => prev.filter((c) => c.id !== id));
        if (editId === id) resetForm();
      } catch (err) {
        setError(localizeError(t, err));
      }
    },
    [commands, editId, setCommands, t, resetForm]
  );

  // 收集已有的分组名作为快捷输入
  const existingGroups = React.useMemo(() => {
    const set = new Set(commands.map((c) => c.group_name).filter(Boolean));
    return Array.from(set).sort();
  }, [commands]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-lg rounded-xl shadow-2xl border overflow-hidden ${
          isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        {/* 标题 */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <h2 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            {t("管理快捷命令", "Manage Quick Commands")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-md transition-colors ${
              isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"
            }`}
            aria-label={t("关闭", "Close")}
          >
            ✕
          </button>
        </div>

        {/* 表单 */}
        <div className={`px-4 py-3 space-y-2 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          {error && (
            <div className={`text-xs text-red-400 ${isDark ? "" : "text-red-600"}`}>{error}</div>
          )}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("命令名称", "Command name")}
            className={inputClass(isDark)}
            maxLength={128}
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t("分组名（可选）", "Group (optional)")}
              className={inputClass(isDark)}
              list="existing-groups"
              maxLength={64}
            />
            <datalist id="existing-groups">
              {existingGroups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={t("命令内容", "Command")}
            className={`${inputClass(isDark)} resize-none`}
            rows={2}
            maxLength={1024}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                saving
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : isDark
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "bg-indigo-500 text-white hover:bg-indigo-400"
              }`}
            >
              {editId !== null ? t("更新", "Update") : t("添加", "Add")}
            </button>
            {editId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  isDark
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t("取消编辑", "Cancel")}
              </button>
            )}
          </div>
        </div>

        {/* 命令列表 */}
        <div className={`max-h-64 overflow-y-auto ${isDark ? "dark-scrollbar" : "light-scrollbar"}`}>
          {commands.length === 0 ? (
            <div className={`px-4 py-6 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {t("还没有快捷命令，添加一个吧", "No quick commands yet. Add one above.")}
            </div>
          ) : (
            commands.map((cmd) => (
              <div
                key={cmd.id}
                className={`flex items-center justify-between px-4 py-2 border-b text-sm ${
                  isDark
                    ? "border-slate-800 hover:bg-slate-800/50 text-slate-300"
                    : "border-slate-100 hover:bg-slate-50 text-slate-700"
                } ${editId === cmd.id ? (isDark ? "bg-slate-800" : "bg-slate-50") : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{cmd.name}</div>
                  <div className={`text-xs truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    <code className={isDark ? "text-amber-400/80" : "text-amber-700"}>{cmd.command}</code>
                    {cmd.group_name ? (
                      <span className="ml-2 opacity-60">{cmd.group_name}</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(cmd)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      isDark
                        ? "hover:bg-slate-700 text-slate-400"
                        : "hover:bg-slate-200 text-slate-500"
                    }`}
                    aria-label={t("编辑", "Edit")}
                  >
                    {t("编辑", "Edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cmd.id)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      isDark
                        ? "hover:bg-red-900/50 text-red-400"
                        : "hover:bg-red-50 text-red-500"
                    }`}
                    aria-label={t("删除", "Delete")}
                  >
                    {t("删除", "Delete")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
