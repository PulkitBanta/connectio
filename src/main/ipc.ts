const { registerConfigHandlers } = require("./configs");
const { registerProxyHandlers, setLogHandler } = require("./server");

function registerIpc(mainWindow) {
  setLogHandler(mainWindow);
  registerConfigHandlers();
  registerProxyHandlers();
}

module.exports = { registerIpc };
