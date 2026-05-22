import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

export interface Rule {
  id: string;
  matchPath: string;
  enabled: boolean;
}

export interface LogEntry {
  method: string;
  path: string;
  status: number;
  ms: number;
  targetUrl: string;
  ts?: number;
}

export interface App {
  id: string;
  name: string;
  targetUrl: string;
  enabled: boolean;
  rules: Rule[];
  logs?: LogEntry[];
}

export type View = "empty" | "proxy" | "configs" | "paste-json" | "json-editor";

export const [apps, setApps] = createStore<App[]>([]);
export const [navExpanded, setNavExpanded] = createSignal(false);
export const [selectedAppId, setSelectedAppId] = createSignal<string | null>(null);
export const [proxyRunning, setProxyRunning] = createSignal(false);
export const [proxyStatusText, setProxyStatusText] = createSignal("Offline");
export const [activeConfigName, setActiveConfigName] = createSignal<string | null>(null);
export const [asideCollapsed, setAsideCollapsed] = createSignal(false);
export const [currentView, setCurrentView] = createSignal<View>("empty");
export const [port, setPort] = createSignal(8080);
export const [editingConfigName, setEditingConfigName] = createSignal<string | null>(null);

export function syncRules() {
  const flat = apps.flatMap((app) =>
    app.rules.filter((r) => r.enabled).map((r) => ({ matchPath: r.matchPath, targetUrl: app.targetUrl })),
  );
  window.connectio.rules.update(flat);
}

export async function stopServer() {
  await window.connectio.proxy.stop();
}
