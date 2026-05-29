import { onMount } from "solid-js";
import {
  apps,
  setApps,
  currentView,
  selectedAppId,
  asideCollapsed,
  setAsideCollapsed,
  showAddProxyModal,
  setShowAddProxyModal,
} from "./lib/state";
import * as ipc from "./lib/ipc";
import { Nav } from "./components/Nav";
import { AsidePanel } from "./components/AsidePanel";
import { ProxyView } from "./components/ProxyView";
import { ConfigsView } from "./components/ConfigsView";
import { PasteJsonView } from "./components/PasteJsonView";
import { JsonEditor } from "./components/JsonEditor";
import { Toast } from "./components/Toast";
import { AddProxyModal } from "./components/AddProxyModal";
import { Icon } from "./components/Icon";

export function App() {
  onMount(() => {
    ipc.onLog((entry) => {
      const app = apps.find((a) => a.targetUrl === entry.targetUrl);
      if (!app) return;
      const idx = apps.indexOf(app);
      if (idx === -1) return;
      const logEntry = { ...entry, ts: Date.now() };
      setApps(idx, "logs", (logs) => [logEntry, ...(logs || [])]);
    });
  });

  return (
    <div class="bg-[#0f1117] text-slate-200 h-full flex overflow-hidden">
      <Nav />
      <div class="w-px bg-white/5 shrink-0" />

      <main class="flex-1 flex flex-col overflow-hidden">
        {currentView() === "empty" && <EmptyState />}
        {currentView() === "proxy" && selectedAppId() && <ProxyView />}
        {currentView() === "configs" && <ConfigsView />}
        {currentView() === "paste-json" && <PasteJsonView />}
        {currentView() === "json-editor" && <JsonEditor />}
      </main>

      <div id="aside-divider" class="w-px bg-white/5 shrink-0 relative">
        <button
          onClick={() => setAsideCollapsed(!asideCollapsed())}
          title={asideCollapsed() ? "Expand panel" : "Collapse panel"}
          class="absolute -left-3 top-4 w-6 h-6 rounded-full bg-[#16181f] border border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors z-10 shadow-lg"
        >
          <Icon name={asideCollapsed() ? "panel-right-open" : "panel-right-close"} class="w-3 h-3" />
        </button>
      </div>

      <AsidePanel />
      <AddProxyModal open={showAddProxyModal()} onClose={() => setShowAddProxyModal(false)} />
      <Toast />
    </div>
  );
}

function EmptyState() {
  return (
    <div class="flex-1 flex flex-col items-center justify-center gap-5 text-center px-8">
      <div class="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400">
        <Icon name="zap" class="w-7 h-7" />
      </div>
      <div>
        <p class="text-slate-300 font-medium mb-1">No proxy apps yet</p>
        <p class="text-slate-500 text-sm leading-relaxed max-w-xs">
          Add a proxy app using the <span class="text-slate-400">+</span> button below. Each app
          maps route rules to a locally running server.
        </p>
      </div>
      <button
        onClick={() => setShowAddProxyModal(true)}
        class="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-sm text-white transition-colors"
      >
        Add your first proxy
      </button>
    </div>
  );
}
