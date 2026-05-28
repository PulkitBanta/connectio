import * as ipc from "../lib/ipc";
import { Icon } from "./Icon";
import {
  proxyRunning,
  setProxyRunning,
  proxyStatusText,
  setProxyStatusText,
  port,
  setPort,
  activeConfigName,
  apps,
} from "../lib/state";
import { showToast } from "./Toast";

async function stopServer() {
  if (!proxyRunning()) return;
  await ipc.proxy.stop();
  setProxyRunning(false);
  setProxyStatusText("Offline");
}

export function AsidePanel() {
  const handleToggle = async () => {
    if (proxyRunning()) {
      await stopServer();
      return;
    }
    const p = port();
    if (isNaN(p) || p < 1024 || p > 65535) {
      setProxyStatusText("Invalid port (1024–65535)");
      return;
    }
    const result = await ipc.proxy.start(p);
    if (result.ok) {
      setProxyRunning(true);
      setProxyStatusText(`Online — :${result.port}`);
    } else {
      setProxyStatusText(`Error: ${result.error}`);
    }
  };

  const handleSave = async () => {
    const name = activeConfigName();
    if (!name) {
      showToast("No config loaded", "info");
      return;
    }
    const appsToSave = apps.map(({ logs: _, ...rest }) => rest);
    await ipc.config.save(name, { apps: appsToSave, port: port() });
    showToast(`Saved "${name}"`, "success");
  };

  return (
    <aside
      id="aside-panel"
      class="w-64 shrink-0 flex flex-col bg-[#09090d] transition-all duration-200"
    >
      <div class="flex-1 flex flex-col gap-6 px-4 py-4">
        <section>
          <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 mb-3">
            <Icon name="zap" class="w-5 h-5" />
          </div>
          <p class="text-sm font-semibold text-slate-300">Connectio</p>
          <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">Local proxy manager</p>
        </section>

        <section>
          <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
            Proxy Server
          </p>
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <span
                class={`w-2 h-2 rounded-full transition-colors duration-300 ${proxyRunning() ? "bg-emerald-400" : "bg-slate-700"}`}
              />
              <span class="text-xs text-slate-400">{proxyStatusText()}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500 w-8 shrink-0">Port</span>
              <input
                type="number"
                value={port()}
                onInput={(e) => setPort(parseInt(e.currentTarget.value) || 8080)}
                disabled={proxyRunning()}
                class={`flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-white/25 transition-colors ${proxyRunning() ? "opacity-40 cursor-not-allowed" : ""}`}
              />
            </div>
            <button
              onClick={handleToggle}
              class={`w-full py-2 rounded-lg text-sm font-medium text-white transition-colors ${proxyRunning() ? "bg-red-800 hover:bg-red-700" : "bg-emerald-700 hover:bg-emerald-600"}`}
            >
              {proxyRunning() ? "Stop Server" : "Start Server"}
            </button>
          </div>
        </section>
      </div>

      <div class="px-4 py-4 border-t border-white/5 flex flex-col gap-2">
        <p class="text-xs text-slate-500 truncate">{activeConfigName() ?? ""}</p>
        <div class="flex gap-2">
          <button
            onClick={handleSave}
            class="flex-1 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            Save
          </button>
          <button class="flex-1 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
            Load
          </button>
        </div>
      </div>
    </aside>
  );
}
