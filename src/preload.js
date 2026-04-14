const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("connectio", {
  proxy: {
    start: (port) => ipcRenderer.invoke("proxy:start", port),
    stop: () => ipcRenderer.invoke("proxy:stop"),
    getStatus: () => ipcRenderer.invoke("proxy:getStatus"),
  },
  rules: {
    update: (rules) => ipcRenderer.invoke("rules:update", rules),
  },
  onLog: (cb) => ipcRenderer.on("request:log", (_e, entry) => cb(entry)),
  config: {
    dir: () => ipcRenderer.invoke("config:dir"),
    list: () => ipcRenderer.invoke("config:list"),
    load: (name) => ipcRenderer.invoke("config:load", name),
    save: (name, data) => ipcRenderer.invoke("config:save", name, data),
    delete: (name) => ipcRenderer.invoke("config:delete", name),
  },
});
