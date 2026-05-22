import { createSignal } from "solid-js";
import { apps, setApps, setSelectedAppId } from "../lib/state";

interface AddProxyModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddProxyModal(props: AddProxyModalProps) {
  const [name, setName] = createSignal("");
  const [targetUrl, setTargetUrl] = createSignal("");
  const [error, setError] = createSignal("");

  const handleSubmit = () => {
    const n = name().trim();
    const u = targetUrl().trim();
    if (!n || !u) {
      setError("Both fields are required.");
      return;
    }
    const app = { id: crypto.randomUUID(), name: n, targetUrl: u, enabled: true, rules: [] };
    setApps([...apps, app]);
    setSelectedAppId(app.id);
    setName("");
    setTargetUrl("");
    setError("");
    props.onClose();
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).id === "modal-overlay") props.onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") props.onClose();
    if (e.key === "Enter" && props.open) handleSubmit();
  };

  return (
    <div
      id="modal-overlay"
      class={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 ${props.open ? "" : "hidden"}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div class="bg-[#16181f] border border-white/10 rounded-xl p-6 w-96 flex flex-col gap-4 shadow-xl">
        <p class="text-sm font-semibold text-slate-200">Add Proxy App</p>
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-500">Name</label>
            <input
              type="text"
              placeholder="e.g. Auth Service"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              class="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-500">Target URL</label>
            <input
              type="text"
              placeholder="http://localhost:3001"
              value={targetUrl()}
              onInput={(e) => setTargetUrl(e.currentTarget.value)}
              class="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>
        </div>
        {error() && <p class="text-xs text-red-400">{error()}</p>}
        <div class="flex gap-2 justify-end">
          <button
            onClick={props.onClose}
            class="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            class="px-4 py-2 rounded-lg text-xs bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
