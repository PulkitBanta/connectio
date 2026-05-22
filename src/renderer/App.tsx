import { onMount, createEffect } from "solid-js";
import { createIcons } from "lucide";
import {
  Zap,
  PanelRightClose,
  Pencil,
  Trash2,
  ArrowLeft,
  ChevronRight,
  Plus,
  Search,
  FileUp,
  Clipboard,
  FileJson,
  FileCode,
  Share2,
  Download,
} from "lucide";
import { apps, setApps, currentView, selectedAppId, setCurrentView } from "./lib/state";
import * as ipc from "./lib/ipc";
import { Nav } from "./components/Nav";
import { AsidePanel } from "./components/AsidePanel";
import { ProxyView } from "./components/ProxyView";
import { ConfigsView } from "./components/ConfigsView";
import { PasteJsonView } from "./components/PasteJsonView";
import { JsonEditor } from "./components/JsonEditor";
import { Toast } from "./components/Toast";

const icons = {
  zap: Zap,
  "panel-right-close": PanelRightClose,
  pencil: Pencil,
  "trash-2": Trash2,
  "arrow-left": ArrowLeft,
  "chevron-right": ChevronRight,
  plus: Plus,
  search: Search,
  "file-up": FileUp,
  clipboard: Clipboard,
  "file-json": FileJson,
  "file-code": FileCode,
  "share-2": Share2,
  download: Download,
};

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

  createEffect(() => {
    currentView();
    setTimeout(() => createIcons({ icons }), 0);
  });

  const handleAddProxy = () => {
    setCurrentView("configs");
  };

  return (
    <div class="bg-[#0f1117] text-slate-200 h-screen flex overflow-hidden select-none">
      <Nav />
      <div class="w-px bg-white/5 shrink-0" />

      <main class="flex-1 flex flex-col overflow-hidden">
        {currentView() === "empty" && <EmptyState onAddProxy={handleAddProxy} />}
        {currentView() === "proxy" && selectedAppId() && <ProxyView />}
        {currentView() === "configs" && <ConfigsView />}
        {currentView() === "paste-json" && <PasteJsonView />}
        {currentView() === "json-editor" && <JsonEditor />}
      </main>

      <div id="aside-divider" class="w-px bg-white/5 shrink-0 relative">
        <button
          title="Collapse panel"
          class="absolute -left-3 top-4 w-6 h-6 rounded-full bg-[#16181f] border border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors z-10 shadow-lg"
        >
          <i data-lucide="panel-right-close" class="w-3 h-3" />
        </button>
      </div>

      <AsidePanel />
      <Toast />
    </div>
  );
}

function EmptyState(props: { onAddProxy: () => void }) {
  return (
    <div class="flex-1 flex flex-col items-center justify-center gap-5 text-center px-8">
      <div class="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400">
        <i data-lucide="zap" class="w-7 h-7" />
      </div>
      <div>
        <p class="text-slate-300 font-medium mb-1">No proxy apps yet</p>
        <p class="text-slate-500 text-sm leading-relaxed max-w-xs">
          Add a proxy app using the <span class="text-slate-400">+</span> button below. Each app
          maps route rules to a locally running server.
        </p>
      </div>
      <button
        onClick={props.onAddProxy}
        class="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-sm text-white transition-colors"
      >
        Add your first proxy
      </button>
    </div>
  );
}
