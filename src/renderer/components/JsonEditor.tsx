import { createSignal, onMount } from "solid-js";
import { editingConfigName, setEditingConfigName, setCurrentView } from "../lib/state";
import * as ipc from "../lib/ipc";
import { showToast } from "./Toast";

export function JsonEditor() {
  const [json, setJson] = createSignal("");
  const [error, setError] = createSignal("");
  const configName = editingConfigName();

  onMount(async () => {
    if (configName) {
      try {
        const result = await ipc.config.export(configName);
        setJson(result.json);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to load config", "error");
      }
    }
  });

  const doSave = async () => {
    setError("");
    const str = json().trim();
    if (!str) {
      setError("JSON cannot be empty.");
      return;
    }
    let data: unknown;
    try {
      data = JSON.parse(str);
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : "Parse error"}`);
      return;
    }
    if (
      !data ||
      typeof data !== "object" ||
      !Array.isArray((data as Record<string, unknown>).apps) ||
      typeof (data as Record<string, unknown>).port !== "number"
    ) {
      setError('Invalid config format: expected { "apps": [...], "port": number }');
      return;
    }
    try {
      await ipc.config.save(configName!, data as { apps: unknown[]; port: number });
      showToast(`Saved "${configName}"`, "success");
      setEditingConfigName(null);
      setCurrentView("configs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      doSave();
    }
  };

  return (
    <div id="json-editor-view" class="flex-1 flex flex-col min-h-0">
      <div class="px-6 py-4 border-b border-white/5 shrink-0 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingConfigName(null);
              setCurrentView("configs");
            }}
            class="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-white/8 transition-colors"
          >
            <i data-lucide="arrow-left" class="w-4 h-4" />
          </button>
          <p class="text-sm font-semibold text-slate-300">
            Edit: <span class="text-emerald-400">{configName}</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-slate-600">Cmd+Enter to save</span>
          <button
            onClick={doSave}
            class="px-3 py-1.5 rounded-lg text-xs bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
          >
            Save
          </button>
        </div>
      </div>
      <div class="flex-1 p-6 min-h-0">
        <textarea
          value={json()}
          onInput={(e) => {
            setJson(e.currentTarget.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          class="w-full h-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-white/25 transition-colors resize-none"
        />
        {error() && <p class="text-xs text-red-400 mt-2">{error()}</p>}
      </div>
    </div>
  );
}
