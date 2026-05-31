import { For } from "solid-js";
import { Icon } from "./Icon";
import {
  apps,
  setApps,
  navExpanded,
  setNavExpanded,
  selectedAppId,
  setSelectedAppId,
  setShowAddProxyModal,
  setCurrentView,
} from "../lib/state";
import * as ipc from "../lib/ipc";

function swapApps(i: number, j: number) {
  const current = apps();
  const a = current[i];
  const b = current[j];
  if (a && b) {
    setApps((prev) => {
      const next = [...prev];
      next[i] = b;
      next[j] = a;
      return next;
    });
    syncRules();
  }
}

function syncRules() {
  const flat = apps().flatMap((app) =>
    app.rules
      .filter((r) => r.enabled)
      .map((r) => ({ matchPath: r.matchPath, targetUrl: app.targetUrl })),
  );
  ipc.rules.update(flat);
}

export function Nav() {
  return (
    <nav
      id="nav"
      class="flex flex-col bg-[#09090d] py-3 overflow-hidden shrink-0"
      style={{ width: navExpanded() ? "210px" : "80px" }}
    >
      <div
        class={`flex mb-2 ${navExpanded() ? "justify-start w-full px-3" : "justify-center px-3"}`}
      >
        <button
          onClick={() => setNavExpanded(!navExpanded())}
          title={navExpanded() ? "Collapse" : "Expand"}
          class={`squircle h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors ${navExpanded() ? "w-full justify-start gap-3 px-3" : "w-10"}`}
        >
          <Icon
            name="chevron-right"
            class="w-4 h-4 shrink-0"
            style={{ transform: navExpanded() ? "rotate(180deg)" : "" }}
          />
          {navExpanded() && <span class="text-xs font-medium whitespace-nowrap">Collapse</span>}
        </button>
      </div>

      <div
        id="proxy-list"
        class={`flex flex-col gap-2 px-3 flex-1 ${navExpanded() ? "" : "items-center"}`}
      >
        <For each={apps()}>
          {(app, i) => {
            const isSelected = app.id === selectedAppId();
            if (navExpanded()) {
              return (
                <div class="group relative flex items-center gap-1 w-full">
                  <button
                    title={app.name}
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setCurrentView("proxy");
                    }}
                    class={`flex-1 h-10 rounded-xl flex items-center gap-3 px-3 transition-colors ${
                      isSelected
                        ? "bg-emerald-600/15 text-emerald-400"
                        : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span
                      class={`squircle w-6 h-6 flex items-center justify-center text-xs font-semibold shrink-0 ${
                        isSelected ? "bg-emerald-600 text-white" : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {app.name[0].toUpperCase()}
                    </span>
                    <span class="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {app.name}
                    </span>
                  </button>
                  <div class="flex flex-col opacity-30 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (i() > 0) swapApps(i(), i() - 1);
                      }}
                      class={`text-[10px] leading-none py-0.5 px-0.5 transition-colors ${
                        i() === 0
                          ? "text-slate-700 pointer-events-none"
                          : "text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (i() < apps().length - 1) swapApps(i(), i() + 1);
                      }}
                      class={`text-[10px] leading-none py-0.5 px-0.5 transition-colors ${
                        i() === apps().length - 1
                          ? "text-slate-700 pointer-events-none"
                          : "text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <button
                title={app.name}
                onClick={() => {
                  setSelectedAppId(app.id);
                  setCurrentView("proxy");
                }}
                class={`squircle w-10 h-10 flex items-center justify-center text-sm font-semibold transition-colors ${
                  isSelected
                    ? "bg-emerald-600 text-white"
                    : "bg-white/10 hover:bg-white/15 text-slate-300"
                }`}
              >
                {app.name[0].toUpperCase()}
              </button>
            );
          }}
        </For>
      </div>

      <div class={`flex ${navExpanded() ? "justify-start w-full px-3" : "justify-center px-3"}`}>
        <button
          onClick={() => setShowAddProxyModal(true)}
          title="Add a proxy app"
          class={`squircle h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors ${
            navExpanded() ? "w-full justify-start gap-3 px-3" : "w-10"
          }`}
        >
          <Icon name="plus" class="w-4 h-4 shrink-0" />
          {navExpanded() && <span class="text-xs font-medium whitespace-nowrap">Add App</span>}
        </button>
      </div>
    </nav>
  );
}
