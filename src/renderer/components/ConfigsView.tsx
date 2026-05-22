import { createSignal, For, Show } from "solid-js";
import {
  apps,
  setApps,
  activeConfigName,
  setActiveConfigName,
  setCurrentView,
  port,
  setPort,
  setEditingConfigName,
  syncRules,
  stopServer,
} from "../lib/state";
import { getRelativeTime } from "../lib/utils";
import * as ipc from "../lib/ipc";
import { showToast } from "./Toast";
import { ShareMenu } from "./ShareMenu";

export function ConfigsView() {
  const [configs, setConfigs] = createSignal<
    { name: string; appCount: number; routeCount: number; lastModified: number; size: number; port: number; note: string }[]
  >([]);
  const [search, setSearch] = createSignal("");
  const [shareMenu, setShareMenu] = createSignal<{ name: string; el: HTMLElement } | null>(null);

  const loadConfigs = async () => {
    const list = await ipc.config.listDetailed();
    setConfigs(list);
  };

  loadConfigs();

  const filtered = () => {
    const term = search().toLowerCase();
    return term ? configs().filter((c) => c.name.toLowerCase().includes(term)) : configs();
  };

  const loadConfig = async (name: string) => {
    await stopServer();
    const data = await ipc.config.load(name);
    setActiveConfigName(name);
    if (data) {
      setApps([]);
      data.apps.forEach((a) => setApps([...apps, a]));
      if (data.port) setPort(data.port);
      syncRules();
    }
    setCurrentView(apps.length > 0 ? "proxy" : "empty");
  };

  const doDelete = async (name: string) => {
    await ipc.config.delete(name);
    setConfigs((prev) => prev.filter((c) => c.name !== name));
    if (activeConfigName() === name) setActiveConfigName(null);
    showToast(`Deleted "${name}"`, "success");
  };

  const openEditor = (name: string) => {
    setEditingConfigName(name);
    setCurrentView("json-editor");
  };

  const doRename = async (oldName: string, newName: string) => {
    try {
      await ipc.config.rename(oldName, newName);
      showToast(`Renamed to "${newName}"`, "success");
      if (activeConfigName() === oldName) setActiveConfigName(newName);
      loadConfigs();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Rename failed", "error");
    }
  };

  const importFromFile = async () => {
    try {
      const result = await ipc.config.importFile();
      if (!result) return;
      setEditingConfigName(result.name);
      setCurrentView("paste-json");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to import file", "error");
    }
  };

  return (
    <div id="configs-view" class="flex-1 flex flex-col min-h-0">
      <div class="px-3 md:px-6 py-2 md:py-4 border-b border-white/5 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <p class="text-xs md:text-sm font-semibold text-slate-300 shrink-0">Configs</p>
          <div class="relative flex-1 min-w-0 max-w-xs">
            <i data-lucide="search" class="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
              class="w-full bg-white/5 border border-white/10 rounded pl-7 pr-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>
        </div>
        <div class="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setCurrentView("paste-json")}
            title="New config"
            class="p-1.5 rounded text-slate-600 hover:text-slate-200 hover:bg-white/8 transition-colors"
          >
            <i data-lucide="plus" class="w-3.5 h-3.5" />
          </button>
          <button
            onClick={importFromFile}
            title="Import from file"
            class="p-1.5 rounded text-slate-600 hover:text-slate-200 hover:bg-white/8 transition-colors"
          >
            <i data-lucide="file-up" class="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentView("paste-json")}
            title="Paste JSON"
            class="p-1.5 rounded text-slate-600 hover:text-slate-200 hover:bg-white/8 transition-colors"
          >
            <i data-lucide="clipboard" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-4">
        <Show when={filtered().length === 0 && !search()}>
          <div class="flex flex-col items-center justify-center h-full text-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
              <i data-lucide="file-json" class="w-7 h-7" />
            </div>
            <p class="text-slate-400 font-medium">No configs yet</p>
            <p class="text-slate-600 text-sm max-w-xs">
              Create a new config, paste JSON, or import a file to get started.
            </p>
          </div>
        </Show>

        <Show when={filtered().length === 0 && search()}>
          <div class="flex flex-col items-center justify-center h-40 text-center gap-2">
            <p class="text-slate-500 text-sm">No configs match "{search()}"</p>
          </div>
        </Show>

        <div class="flex flex-col gap-2 w-full">
          <For each={filtered()}>
            {(cfg) => (
              <div
                class="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10"
                onClick={() => loadConfig(cfg.name)}
              >
                <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <ConfigNameCell cfg={cfg} onRename={doRename} />
                    <span class="text-[10px] text-slate-600">
                      {cfg.appCount} app{cfg.appCount !== 1 ? "s" : ""} · {cfg.routeCount} route
                      {cfg.routeCount !== 1 ? "s" : ""} · port {cfg.port} ·{" "}
                      {getRelativeTime(cfg.lastModified)}
                    </span>
                  </div>
                  <Show when={cfg.note}>
                    <div class="text-[10px] text-slate-500 italic truncate mt-0.5">{cfg.note}</div>
                  </Show>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditor(cfg.name);
                    }}
                    title="Edit JSON"
                    class="p-1.5 rounded text-slate-600 hover:text-slate-200 hover:bg-white/8 transition-colors"
                  >
                    <i data-lucide="file-code" class="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareMenu({ name: cfg.name, el: e.currentTarget });
                    }}
                    title="Share"
                    class="p-1.5 rounded text-slate-600 hover:text-slate-200 hover:bg-white/8 transition-colors"
                  >
                    <i data-lucide="share-2" class="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      doDelete(cfg.name);
                    }}
                    title="Delete"
                    class="p-1.5 rounded text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <i data-lucide="trash-2" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      <Show when={shareMenu()}>
        <ShareMenu
          configName={shareMenu()!.name}
          anchorEl={shareMenu()!.el}
          onClose={() => setShareMenu(null)}
        />
      </Show>
    </div>
  );
}

function ConfigNameCell(props: {
  cfg: { name: string };
  onRename: (oldName: string, newName: string) => Promise<void>;
}) {
  const [renaming, setRenaming] = createSignal(false);
  const [value, setValue] = createSignal(props.cfg.name);
  let inputRef: HTMLInputElement | undefined;

  const commit = async () => {
    const newName = value().trim();
    if (newName && newName !== props.cfg.name) {
      await props.onRename(props.cfg.name, newName);
    }
    setRenaming(false);
  };

  return (
    <Show
      when={renaming()}
      fallback={
        <div
          class="flex items-center gap-1.5 cursor-text hover:bg-white/5 rounded px-1 -ml-1 transition-colors"
          onClick={() => {
            setValue(props.cfg.name);
            setRenaming(true);
            setTimeout(() => inputRef?.select(), 0);
          }}
        >
          <span class="text-sm font-medium text-slate-300">{props.cfg.name}</span>
          <i data-lucide="pencil" class="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      }
    >
      <input
        ref={inputRef}
        type="text"
        value={value()}
        onInput={(e) => setValue(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setRenaming(false);
        }}
        onBlur={commit}
        class="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-sm text-slate-300 focus:outline-none focus:border-white/25 transition-colors w-40"
      />
    </Show>
  );
}
