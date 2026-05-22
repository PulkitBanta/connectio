/// <reference types="vite/client" />

interface ProxyAPI {
  start: (port: number) => Promise<{ ok: boolean; port?: number; error?: string }>;
  stop: () => Promise<{ ok: boolean }>;
  getStatus: () => Promise<{ running: boolean; port: number | null }>;
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
      note: string;
    }[]
  >;
  load: (name: string) => Promise<{ apps: App[]; port: number } | null>;
  save: (name: string, data: { apps: App[]; port: number }) => Promise<{ ok: boolean }>;
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
  method: string;
  path: string;
  status: number;
  ms: number;
  targetUrl: string;
  ts?: number;
}

interface ConnectioAPI {
  proxy: ProxyAPI;
  rules: RulesAPI;
  config: ConfigAPI;
  onLog: (cb: (entry: LogEntry) => void) => void;
}

declare global {
  interface Window {
    connectio: ConnectioAPI;
  }
}
