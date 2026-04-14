const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const server = require("./server");

const configDir = path.join(app.getPath("userData"), "configs");

function ensureConfigDir() {
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
}

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

ipcMain.handle("config:dir", () => configDir);
ipcMain.handle("config:list", () => {
  ensureConfigDir();
  return fs
    .readdirSync(configDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -5));
});
ipcMain.handle("config:load", (_e, name) => {
  const file = path.join(configDir, `${name}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
});
ipcMain.handle("config:save", (_e, name, data) => {
  ensureConfigDir();
  fs.writeFileSync(path.join(configDir, `${name}.json`), JSON.stringify(data, null, 2));
  return { ok: true };
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
