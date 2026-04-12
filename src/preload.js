const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('connectio', {
  // placeholder — IPC bridge methods will be added per implementation step
})
