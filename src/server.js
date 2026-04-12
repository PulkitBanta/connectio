const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

let rules = [];

// Cache one proxy instance per target to avoid recreating it on every request
const proxyCache = new Map();

function getProxy(targetUrl) {
  if (!proxyCache.has(targetUrl)) {
    proxyCache.set(targetUrl, createProxyMiddleware({ target: targetUrl, changeOrigin: true }));
  }
  return proxyCache.get(targetUrl);
}

const app = express();

function matchesRule(pattern, path) {
  if (!pattern.includes("*")) return path.startsWith(pattern);
  // Escape all regex special chars except *, then replace * with .* for wildcard matching.
  // e.g. "/api/*" becomes /^\/api\/.*/ and matches "/api/users", "/api/v1/orders", etc.
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("^" + escaped.replace(/\*/g, ".*")).test(path);
}

app.use((req, res, next) => {
  const rule = rules.find((r) => matchesRule(r.matchPath, req.path));
  if (!rule) return res.status(404).json({ error: "No matching rule", path: req.path });
  getProxy(rule.targetUrl)(req, res, next);
});

let server = null;

function start(port = 8080) {
  return new Promise((resolve) => {
    server = app.listen(port, () => resolve({ ok: true, port }));
    server.on("error", (err) => {
      server = null;
      resolve({ ok: false, error: err.message });
    });
  });
}

function stop() {
  return new Promise((resolve) => {
    if (!server) return resolve({ ok: true });
    server.close(() => {
      server = null;
      proxyCache.clear();
      resolve({ ok: true });
    });
  });
}

function getStatus() {
  return { running: !!server, port: server?.address()?.port ?? null };
}

function setRules(newRules) {
  rules = newRules;
  proxyCache.clear();
}

module.exports = { start, stop, getStatus, setRules };
