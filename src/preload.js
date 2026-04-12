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
});
