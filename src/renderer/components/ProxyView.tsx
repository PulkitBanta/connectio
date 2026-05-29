import { createSignal, For } from "solid-js";
import { Icon } from "./Icon";
import { apps, setApps, selectedAppId, setSelectedAppId } from "../lib/state";
import { formatTime, getStatusColor } from "../lib/utils";
import * as ipc from "../lib/ipc";

function syncRules() {
  const flat = apps.flatMap((app) =>
    app.rules
      .filter((r) => r.enabled)
      .map((r) => ({ matchPath: r.matchPath, targetUrl: app.targetUrl })),
  );
  ipc.rules.update(flat);
}

export function ProxyView() {
  const app = () => apps.find((a) => a.id === selectedAppId());
  const [editing, setEditing] = createSignal(false);
  const [editName, setEditName] = createSignal("");
  const [editUrl, setEditUrl] = createSignal("");

  const logs = () => app()?.logs ?? [];

  if (!app()) return null;

  const startEdit = () => {
    const a = app()!;
    setEditName(a.name);
    setEditUrl(a.targetUrl);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    const a = app()!;
    const idx = apps.findIndex((x) => x.id === a.id);
    if (idx === -1) return;
    const name = editName().trim();
    const targetUrl = editUrl().trim();
    if (!name || !targetUrl) return;
    setApps(idx, "name", name);
    setApps(idx, "targetUrl", targetUrl);
    syncRules();
    setEditing(false);
  };

  const deleteApp = () => {
    const a = app()!;
    const idx = apps.findIndex((x) => x.id === a.id);
    if (idx === -1) return;
    setApps(apps.filter((x) => x.id !== a.id));
    syncRules();
    setSelectedAppId(null);
  };

  return (
    <div id="request-view" class="flex-1 flex flex-col min-h-0">
      <div class="px-6 py-4 border-b border-white/5 shrink-0 flex items-start justify-between gap-4">
        {editing() ? (
          <div class="flex flex-col gap-2 flex-1">
            <input
              type="text"
              value={editName()}
              onInput={(e) => setEditName(e.currentTarget.value)}
              class="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-white/25 transition-colors"
            />
            <input
              type="text"
              value={editUrl()}
              onInput={(e) => setEditUrl(e.currentTarget.value)}
              class="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-white/25 font-mono transition-colors"
            />
            <div class="flex gap-2">
              <button
                onClick={saveEdit}
                class="px-3 py-1 rounded text-xs bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                class="px-3 py-1 rounded text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <p class="text-sm font-semibold text-slate-300">{app()!.name}</p>
              <p class="text-xs text-slate-500 mt-0.5">{app()!.targetUrl}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0 mt-0.5">
              <button
                onClick={startEdit}
                title="Edit app"
                class="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-white/8 transition-colors"
              >
                <Icon name="pencil" class="w-3.5 h-3.5" />
              </button>
              <button
                onClick={deleteApp}
                title="Delete app"
                class="p-1.5 rounded text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              >
                <Icon name="trash-2" class="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      <div class="flex-1 min-h-0 px-6 py-4 flex flex-col gap-4">
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Route Rules
            </p>
          </div>
          <RuleSection app={app()!} />
        </div>

        <div class="flex-1 flex flex-col min-h-0 gap-2">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-500 shrink-0">
            Recent Requests
          </p>
          <div id="log-list" class="flex-1 overflow-y-auto min-h-0">
            {logs().length === 0 ? (
              <p class="text-xs text-slate-600">No requests yet.</p>
            ) : (
              <For each={logs()}>
                {(entry) => (
                  <div class="flex items-center gap-3 py-1.5 border-b border-white/3 font-mono text-xs">
                    <span class="text-slate-600 shrink-0">
                      {formatTime(entry.ts || Date.now())}
                    </span>
                    <span class="text-slate-400 shrink-0 w-10">{entry.method}</span>
                    <span class="text-slate-300 flex-1 truncate">{entry.path}</span>
                    <span class={`${getStatusColor(entry.status)} shrink-0`}>{entry.status}</span>
                    <span class="text-slate-600 shrink-0">{entry.ms}ms</span>
                  </div>
                )}
              </For>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RuleSection(props: {
  app: { id: string; rules: { id: string; matchPath: string; enabled: boolean }[] };
}) {
  const [adding, setAdding] = createSignal(false);
  const [newPath, setNewPath] = createSignal("");

  const appIdx = () => apps.findIndex((a) => a.id === props.app.id);

  const addRule = () => {
    const path = newPath().trim();
    if (!path) return;
    const idx = appIdx();
    if (idx === -1) return;
    setApps(idx, "rules", (rules) => [
      ...rules,
      { id: crypto.randomUUID(), matchPath: path, enabled: true },
    ]);
    setNewPath("");
    setAdding(false);
    syncRules();
  };

  const toggleRule = (ruleIdx: number) => {
    const idx = appIdx();
    if (idx === -1) return;
    const rule = apps[idx].rules[ruleIdx];
    if (rule) setApps(idx, "rules", ruleIdx, "enabled", !rule.enabled);
    syncRules();
  };

  const deleteRule = (ruleId: string) => {
    const idx = appIdx();
    if (idx === -1) return;
    setApps(idx, "rules", (rules) => rules.filter((r) => r.id !== ruleId));
    syncRules();
  };

  const moveRule = (from: number, to: number) => {
    const idx = appIdx();
    if (idx === -1) return;
    const rules = [...apps[idx].rules];
    if (from < 0 || from >= rules.length || to < 0 || to >= rules.length) return;
    [rules[from], rules[to]] = [rules[to], rules[from]];
    setApps(idx, "rules", rules);
    syncRules();
  };

  return (
    <div>
      <div class="flex flex-col gap-1">
        <For each={props.app.rules}>
          {(rule, i) => (
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 hover:bg-white/5 group transition-colors">
              <button
                onClick={() => moveRule(i(), i() - 1)}
                class={`text-xs transition-colors ${i() === 0 ? "text-slate-700 pointer-events-none" : "text-slate-600 hover:text-slate-300"}`}
              >
                ↑
              </button>
              <button
                onClick={() => moveRule(i(), i() + 1)}
                class={`text-xs transition-colors ${i() === props.app.rules.length - 1 ? "text-slate-700 pointer-events-none" : "text-slate-600 hover:text-slate-300"}`}
              >
                ↓
              </button>
              <button
                onClick={() => toggleRule(i())}
                class={`w-2 h-2 rounded-full shrink-0 transition-colors ${rule.enabled ? "bg-emerald-500" : "bg-slate-600"}`}
                title={rule.enabled ? "Click to disable rule" : "Click to enable rule"}
              />
              <span
                class={`text-xs font-mono flex-1 ${rule.enabled ? "text-slate-300" : "text-slate-600 line-through"}`}
              >
                {rule.matchPath}
              </span>
              <button
                onClick={() => deleteRule(rule.id)}
                class="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </For>
      </div>

      {adding() ? (
        <div class="flex items-center gap-2 mt-3">
          <input
            type="text"
            placeholder="/api/*"
            value={newPath()}
            onInput={(e) => setNewPath(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addRule();
              if (e.key === "Escape") setAdding(false);
            }}
            class="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-white/25 font-mono transition-colors"
          />
          <button
            onClick={addRule}
            class="px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white transition-colors shrink-0"
          >
            Add
          </button>
          <button
            onClick={() => setAdding(false)}
            class="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors shrink-0"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          class="mt-3 w-full py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          + Add Rule
        </button>
      )}

      {props.app.rules.length === 0 && !adding() && (
        <p class="text-xs text-slate-600 mt-1">No rules yet. Add one to start routing traffic.</p>
      )}
    </div>
  );
}
