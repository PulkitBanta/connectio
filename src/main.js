const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const server = require("./server");

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

  win.loadFile(path.join(__dirname, "renderer", "index.html"));

  if (process.argv.includes("--dev")) {
    win.webContents.openDevTools();
  }
}

ipcMain.handle("proxy:start", (_e, port) => server.start(port));
ipcMain.handle("proxy:stop", () => server.stop());
ipcMain.handle("proxy:getStatus", () => server.getStatus());

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
