const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("connectio", {
  proxy: {
    start: (port, options) => ipcRenderer.invoke("proxy:start", port, options),
    stop: () => ipcRenderer.invoke("proxy:stop"),
    getStatus: () => ipcRenderer.invoke("proxy:getStatus"),
  },
  rules: {
    update: (rules) => ipcRenderer.invoke("rules:update", rules),
  },
  onLog: (cb) => ipcRenderer.on("request:log", (_e, entry) => cb(entry)),
  onTunnelStatus: (cb) => ipcRenderer.on("tunnel:status", (_e, status) => cb(status)),
  config: {
    dir: () => ipcRenderer.invoke("config:dir"),
    list: () => ipcRenderer.invoke("config:list"),
    listDetailed: () => ipcRenderer.invoke("config:listDetailed"),
    load: (name) => ipcRenderer.invoke("config:load", name),
    save: (name, data) => ipcRenderer.invoke("config:save", name, data),
    delete: (name) => ipcRenderer.invoke("config:delete", name),
    rename: (oldName, newName) => ipcRenderer.invoke("config:rename", oldName, newName),
    import: (jsonString, name) => ipcRenderer.invoke("config:import", jsonString, name),
    export: (name) => ipcRenderer.invoke("config:export", name),
    exportFile: (name, jsonString) => ipcRenderer.invoke("config:exportFile", name, jsonString),
    importFile: () => ipcRenderer.invoke("config:importFile"),
  },
});
