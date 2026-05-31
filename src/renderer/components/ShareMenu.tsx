import { createSignal, onCleanup, onMount } from "solid-js";
import { Icon } from "./Icon";
import * as ipc from "../lib/ipc";
import { showToast } from "./Toast";

interface ShareMenuProps {
  configName: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export function ShareMenu(props: ShareMenuProps) {
  const [style, setStyle] = createSignal<Record<string, string>>({});

  onMount(() => {
    if (props.anchorEl) {
      const rect = props.anchorEl.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: `${rect.top}px`,
        left: `${rect.left - 148}px`,
      });
    }
  });

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-share-menu]") && target !== props.anchorEl) {
      props.onClose();
    }
  };

  onMount(() => {
    setTimeout(() => document.addEventListener("click", handleClickOutside), 0);
  });

  onCleanup(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  const handleCopy = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await ipc.config.export(props.configName);
      await navigator.clipboard.writeText(result.json);
      showToast("Copied to clipboard", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
    props.onClose();
  };

  const handleSave = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await ipc.config.export(props.configName);
      const saveResult = await ipc.config.exportFile(props.configName, result.json);
      if (saveResult.ok) showToast("File saved", "success");
    } catch {
      showToast("Failed to export", "error");
    }
    props.onClose();
  };

  return (
    <div
      data-share-menu
      class="bg-[#1a1d26] border border-white/10 rounded-lg py-1 shadow-xl flex flex-col min-w-[140px] z-50"
      style={style()}
    >
      <button
        onClick={handleCopy}
        class="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition-colors text-left"
      >
        <Icon name="clipboard" class="w-3.5 h-3.5 shrink-0" />
        Copy JSON
      </button>
      <button
        onClick={handleSave}
        class="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition-colors text-left"
      >
        <Icon name="download" class="w-3.5 h-3.5 shrink-0" />
        Save as file
      </button>
    </div>
  );
}
