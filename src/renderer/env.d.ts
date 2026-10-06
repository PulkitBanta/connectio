/// <reference types="vite/client" />

interface ProxyAPI {
  start: (
    port: number,
    options?: { cloudflareTunnel?: boolean },
  ) => Promise<{ ok: boolean; port?: number; tunnelUrl?: string; error?: string }>;
  stop: () => Promise<{ ok: boolean }>;
  getStatus: () => Promise<{
    running: boolean;
    port: number | null;
    tunnel: { running: boolean; url: string | null };
  }>;
}

interface RulesAPI {
  update: (rules: { matchPath: string; targetUrl: string }[]) => Promise<void>;
}

interface ConfigAPI {
  dir: () => Promise<string>;
  list: () => Promise<string[]>;
  listDetailed: () => Promise<
    {
      name: string;
      appCount: number;
      routeCount: number;
      lastModified: number;
      size: number;
      port: number;
      cloudflareTunnel: boolean;
      note: string;
    }[]
  >;
  load: (name: string) => Promise<ConfigData | null>;
  save: (name: string, data: ConfigData) => Promise<{ ok: boolean }>;
  delete: (name: string) => Promise<{ ok: boolean }>;
  rename: (oldName: string, newName: string) => Promise<{ ok: boolean }>;
  import: (jsonString: string, name: string) => Promise<{ ok: boolean }>;
  export: (name: string) => Promise<{ name: string; json: string }>;
  exportFile: (name: string, jsonString: string) => Promise<{ ok: boolean; filePath?: string }>;
  importFile: () => Promise<{ name: string; json: string } | null>;
}

interface App {
  id: string;
  name: string;
  targetUrl: string;
  enabled: boolean;
  rules: { id: string; matchPath: string; enabled: boolean }[];
  logs?: LogEntry[];
}

interface LogEntry {
  id?: string;
  method: string;
  path: string;
  status: number;
  statusText?: string;
  ms: number;
  targetUrl: string;
  matchPath?: string;
  httpVersion?: string;
  remoteAddress?: string;
  requestHeaders?: Record<string, string | string[] | undefined>;
  responseHeaders?: Record<string, string | string[] | number | undefined>;
  ts?: number;
}

interface ConfigData {
  apps: App[];
  port: number;
  cloudflareTunnel?: boolean;
}

interface ConnectioAPI {
  proxy: ProxyAPI;
  rules: RulesAPI;
  config: ConfigAPI;
  onLog: (cb: (entry: LogEntry) => void) => void;
  onTunnelStatus: (
    cb: (status: { running: boolean; url?: string; error?: string }) => void,
  ) => void;
}

declare global {
  interface Window {
    connectio: ConnectioAPI;
  }
}
