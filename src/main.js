const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const server = require("./server");

let mainWindow = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "default",
    title: "Connectio",
  });

  mainWindow = win;
  win.loadFile(path.join(__dirname, "renderer", "index.html"));

  if (process.argv.includes("--dev")) {
    win.webContents.openDevTools();
  }
}

server.setLogHandler((entry) => mainWindow?.webContents.send("request:log", entry));

ipcMain.handle("proxy:start", (_e, port) => server.start(port));
ipcMain.handle("proxy:stop", () => server.stop());
ipcMain.handle("proxy:getStatus", () => server.getStatus());
ipcMain.handle("rules:update", (_e, rules) => server.setRules(rules));

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
