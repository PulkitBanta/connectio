import { createSignal } from "solid-js";
import { editingConfigName, setEditingConfigName, setCurrentView, syncRules } from "../lib/state";
import * as ipc from "../lib/ipc";
import { showToast } from "./Toast";

export function PasteJsonView() {
  const [name, setName] = createSignal(editingConfigName() ?? "");
  const [json, setJson] = createSignal("");
  const [error, setError] = createSignal("");
  const [preview, setPreview] = createSignal("");
  const [validData, setValidData] = createSignal<object | null>(null);

  const validate = () => {
    setError("");
    setPreview("");
    setValidData(null);

    const str = json().trim();
    if (!str) {
      setError("Please paste JSON first.");
      return;
    }

    let data: { apps?: unknown[]; port?: number };
    try {
      data = JSON.parse(str);
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : "Parse error"}`);
      return;
    }

    if (!data || typeof data !== "object" || !Array.isArray(data.apps) || typeof data.port !== "number") {
      setError('Invalid config format: expected { "apps": [...], "port": number }');
      return;
    }

    setValidData(data as object);
    setPreview(`${data.apps.length} app(s), port ${data.port}`);
  };

  const doImport = async () => {
    if (!validData()) {
      showToast("Please validate the JSON first", "info");
      return;
    }
    const n = name().trim();
    if (!n) {
      showToast("Please enter a config name", "error");
      return;
    }
    try {
      await ipc.config.save(n, validData() as { apps: { id: string; name: string; targetUrl: string; enabled: boolean; rules: unknown[] }[]; port: number });
      showToast(`Imported "${n}"`, "success");
      setEditingConfigName(null);
      setCurrentView("configs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!validData()) validate();
      else doImport();
    }
    if (e.key === "Escape") {
      setEditingConfigName(null);
      setCurrentView("configs");
    }
  };

  return (
    <div id="paste-json-view" class="flex-1 flex flex-col min-h-0">
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
          <p class="text-sm font-semibold text-slate-300">Import Config from JSON</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-slate-600">Validate before importing</span>
          <button
            onClick={doImport}
            disabled={!validData()}
            class="px-3 py-1.5 rounded-lg text-xs bg-emerald-700 hover:bg-emerald-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Import
          </button>
        </div>
      </div>
      <div class="flex-1 p-6 min-h-0 flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-slate-500">Config name</label>
          <input
            type="text"
            placeholder="e.g. Local Dev"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
              if (e.key === "Escape") {
                setEditingConfigName(null);
                setCurrentView("configs");
              }
            }}
            class="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-white/25 transition-colors max-w-xs"
          />
        </div>
        <div class="flex-1 flex flex-col min-h-0">
          <textarea
            value={json()}
            onInput={(e) => {
              setJson(e.currentTarget.value);
              setValidData(null);
              setError("");
              setPreview("");
            }}
            onKeyDown={handleKeyDown}
            class="w-full h-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-white/25 transition-colors resize-none"
            placeholder='{ "apps": [...], "port": 8080 }'
          />
          <div class="flex items-center gap-2 mt-2">
            <button
              onClick={validate}
              class="px-3 py-1.5 rounded text-xs bg-white/10 hover:bg-white/15 text-slate-300 transition-colors"
            >
              Validate
            </button>
            {error() && <p class="text-xs text-red-400">{error()}</p>}
            {preview() && <p class="text-xs text-slate-400">{preview()}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
