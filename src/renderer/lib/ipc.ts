import type { App } from "./state";

export interface ConfigData {
  apps: App[];
  port: number;
  cloudflareTunnel?: boolean;
}

interface RequestLog {
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
}

interface TunnelStatus {
  running: boolean;
  url?: string;
  error?: string;
}

declare global {
  interface Window {
    connectio: {
      proxy: {
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
      };
      rules: {
        update: (rules: { matchPath: string; targetUrl: string }[]) => Promise<void>;
      };
      config: {
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
        exportFile: (
          name: string,
          jsonString: string,
        ) => Promise<{ ok: boolean; filePath?: string }>;
        importFile: () => Promise<{ name: string; json: string } | null>;
      };
      onLog: (cb: (entry: RequestLog) => void) => void;
      onTunnelStatus: (cb: (status: TunnelStatus) => void) => void;
    };
  }
}

export const proxy = {
  start: (
    port: number,
    options?: { cloudflareTunnel?: boolean },
  ): Promise<{ ok: boolean; port?: number; tunnelUrl?: string; error?: string }> =>
    window.connectio.proxy.start(port, options),
  stop: (): Promise<{ ok: boolean }> => window.connectio.proxy.stop(),
  getStatus: (): Promise<{
    running: boolean;
    port: number | null;
    tunnel: { running: boolean; url: string | null };
  }> => window.connectio.proxy.getStatus(),
};

export const rules = {
  update: (flatRules: { matchPath: string; targetUrl: string }[]): Promise<void> =>
    window.connectio.rules.update(flatRules),
};

export const onLog = (cb: (entry: RequestLog) => void): void => window.connectio.onLog(cb);

export const onTunnelStatus = (cb: (status: TunnelStatus) => void): void =>
  window.connectio.onTunnelStatus(cb);

export const config = {
  dir: (): Promise<string> => window.connectio.config.dir(),
  list: (): Promise<string[]> => window.connectio.config.list(),
  listDetailed: (): Promise<
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
  > => window.connectio.config.listDetailed(),
  load: (name: string): Promise<ConfigData | null> => window.connectio.config.load(name),
  save: (name: string, data: ConfigData): Promise<{ ok: boolean }> =>
    window.connectio.config.save(name, data),
  delete: (name: string): Promise<{ ok: boolean }> => window.connectio.config.delete(name),
  rename: (oldName: string, newName: string): Promise<{ ok: boolean }> =>
    window.connectio.config.rename(oldName, newName),
  import: (jsonString: string, name: string): Promise<{ ok: boolean }> =>
    window.connectio.config.import(jsonString, name),
  export: (name: string): Promise<{ name: string; json: string }> =>
    window.connectio.config.export(name),
  exportFile: (name: string, jsonString: string): Promise<{ ok: boolean; filePath?: string }> =>
    window.connectio.config.exportFile(name, jsonString),
  importFile: (): Promise<{ name: string; json: string } | null> =>
    window.connectio.config.importFile(),
};
