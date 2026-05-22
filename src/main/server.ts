const { ipcMain } = require("electron");
const proxyServer = require("../../server");

function registerProxyHandlers() {
  ipcMain.handle("proxy:start", (_e, port) => proxyServer.start(port));
  ipcMain.handle("proxy:stop", () => proxyServer.stop());
  ipcMain.handle("proxy:getStatus", () => proxyServer.getStatus());
  ipcMain.handle("rules:update", (_e, rules) => proxyServer.setRules(rules));
}

function setLogHandler(mainWindow) {
  proxyServer.setLogHandler((entry) => mainWindow?.webContents.send("request:log", entry));
}

module.exports = { registerProxyHandlers, setLogHandler };
