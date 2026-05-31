import { For, createSignal } from "solid-js";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration: number;
}

const [toasts, setToasts] = createSignal<ToastItem[]>([]);

export function showToast(
  message: string,
  type: "success" | "error" | "info" = "success",
  duration = 2500,
) {
  const id = crypto.randomUUID();
  setToasts((prev) => [...prev, { id, message, type, duration }]);
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, duration);
}

export function Toast() {
  return (
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <For each={toasts()}>
        {(toast) => (
          <div
            class={`pointer-events-auto ${toast.type === "error" ? "bg-red-800" : toast.type === "info" ? "bg-blue-800" : "bg-emerald-800"} text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2`}
          >
            {toast.message}
          </div>
        )}
      </For>
    </div>
  );
}
