import type { App } from "./state";

export const proxy = {
  start: (port: number): Promise<{ ok: boolean; port?: number; error?: string }> =>
    window.connectio.proxy.start(port),
  stop: (): Promise<{ ok: boolean }> => window.connectio.proxy.stop(),
  getStatus: (): Promise<{ running: boolean; port: number | null }> =>
    window.connectio.proxy.getStatus(),
};

export const rules = {
  update: (flatRules: { matchPath: string; targetUrl: string }[]): Promise<void> =>
    window.connectio.rules.update(flatRules),
};

export const onLog = (
  cb: (entry: {
    method: string;
    path: string;
    status: number;
    ms: number;
    targetUrl: string;
  }) => void,
): void => window.connectio.onLog(cb);

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
      note: string;
    }[]
  > => window.connectio.config.listDetailed(),
  load: (name: string): Promise<{ apps: App[]; port: number } | null> =>
    window.connectio.config.load(name),
  save: (name: string, data: { apps: App[]; port: number }): Promise<{ ok: boolean }> =>
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
