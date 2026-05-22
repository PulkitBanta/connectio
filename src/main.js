const { app, BrowserWindow, ipcMain, dialog } = require("electron");
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
    icon: path.join(__dirname, "../icons/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "default",
    title: "Connectio",
  });

  mainWindow = win;

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

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
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (isValidConfigShape(data)) return data;
    return null;
  } catch {
    return null;
  }
});
ipcMain.handle("config:delete", (_e, name) => {
  const file = path.join(configDir, `${name}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  return { ok: true };
});

ipcMain.handle("config:rename", (_e, oldName, newName) => {
  if (oldName === newName) return { ok: true };
  const oldFile = path.join(configDir, `${oldName}.json`);
  const newFile = path.join(configDir, `${newName}.json`);
  if (!fs.existsSync(oldFile)) throw new Error(`Config "${oldName}" not found`);
  if (fs.existsSync(newFile)) throw new Error(`Config "${newName}" already exists`);
  fs.renameSync(oldFile, newFile);
  return { ok: true };
});

ipcMain.handle("config:export", (_e, name) => {
  const file = path.join(configDir, `${name}.json`);
  if (!fs.existsSync(file)) throw new Error(`Config "${name}" not found`);
  return { name, json: fs.readFileSync(file, "utf8") };
});

function isValidConfigShape(data) {
  return data && typeof data === "object" && Array.isArray(data.apps) && typeof data.port === "number";
}

ipcMain.handle("config:import", (_e, jsonString, name) => {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}`, { cause: err });
  }
  if (!isValidConfigShape(data)) {
    throw new Error('Invalid config format: expected { apps: [], port: number }');
  }
  ensureConfigDir();
  const file = path.join(configDir, `${name}.json`);
  if (fs.existsSync(file)) throw new Error(`Config "${name}" already exists`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return { ok: true };
});

ipcMain.handle("config:save", (_e, name, data) => {
  ensureConfigDir();
  if (!isValidConfigShape(data)) {
    throw new Error('Invalid config format: expected { apps: [], port: number }');
  }
  fs.writeFileSync(path.join(configDir, `${name}.json`), JSON.stringify(data, null, 2));
  return { ok: true };
});

ipcMain.handle("config:exportFile", async (_e, name, jsonString) => {
  const result = await dialog.showSaveDialog({
    defaultPath: `${name}.json`,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (result.canceled) return { ok: false };
  fs.writeFileSync(result.filePath, jsonString, "utf8");
  return { ok: true, filePath: result.filePath };
});

ipcMain.handle("config:importFile", async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: "JSON", extensions: ["json"] }],
    properties: ["openFile"],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const filePath = result.filePaths[0];
  const jsonString = fs.readFileSync(filePath, "utf8");
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}`, { cause: err });
  }
  if (!isValidConfigShape(data)) {
    throw new Error('Invalid config format: expected { apps: [], port: number }');
  }
  const name = path.basename(filePath, ".json");
  return { name, json: jsonString };
});

ipcMain.handle("config:listDetailed", () => {
  ensureConfigDir();
  return fs
    .readdirSync(configDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const filePath = path.join(configDir, f);
      const stat = fs.statSync(filePath);
      const raw = fs.readFileSync(filePath, "utf8");
      let data;
      try { data = JSON.parse(raw); } catch { data = { apps: [], port: 8080 }; }
      const appCount = (data.apps || []).length;
      const routeCount = (data.apps || []).reduce((sum, a) => sum + (a.rules || []).length, 0);
      return {
        name: f.slice(0, -5),
        appCount,
        routeCount,
        lastModified: stat.mtimeMs,
        size: stat.size,
        port: data.port || 8080,
        note: data.note || "",
      };
    })
    .sort((a, b) => b.lastModified - a.lastModified);
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
