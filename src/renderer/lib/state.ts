import { createSignal, createStore } from "solid-js";

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
