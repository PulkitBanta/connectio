const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

let rules = [];
let logHandler = null;
let tunnelHandler = null;

function setLogHandler(fn) {
  logHandler = fn;
}

function setTunnelHandler(fn) {
  tunnelHandler = fn;
}

// Cache one proxy instance per target to avoid recreating it on every request
const proxyCache = new Map();

function getProxy(targetUrl) {
  if (!proxyCache.has(targetUrl)) {
    proxyCache.set(
      targetUrl,
      createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        on: {
          error: (err, _req, res) => {
            const body = JSON.stringify({
              error: "Upstream unreachable",
              target: targetUrl,
              detail: err.message,
            });
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(body);
          },
        },
      }),
    );
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
  const start = Date.now();
  const rule = rules.find((r) => matchesRule(r.matchPath, req.path));
  if (!rule) return res.status(404).json({ error: "No matching rule", path: req.path });
  res.on("finish", () => {
    logHandler?.({
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      statusText: res.statusMessage,
      ms: Date.now() - start,
      targetUrl: rule.targetUrl,
      matchPath: rule.matchPath,
      httpVersion: req.httpVersion,
      remoteAddress: req.socket.remoteAddress,
      requestHeaders: req.headers,
      responseHeaders: res.getHeaders(),
    });
  });
  getProxy(rule.targetUrl)(req, res, next);
});

let server = null;
let tunnelProcess = null;
let tunnelUrl = null;
let stoppingTunnel = false;

function cloudflaredCommand() {
  const executable = process.platform === "win32" ? "cloudflared.exe" : "cloudflared";
  const candidates = [
    process.env.CLOUDFLARED_PATH,
    process.resourcesPath && path.join(process.resourcesPath, executable),
    process.platform === "darwin" ? `/opt/homebrew/bin/${executable}` : null,
    process.platform === "darwin" ? `/usr/local/bin/${executable}` : null,
    process.platform === "linux" ? `/usr/local/bin/${executable}` : null,
    process.platform === "linux" ? `/usr/bin/${executable}` : null,
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) || executable;
}

function startTunnel(port) {
  return new Promise((resolve, reject) => {
    if (tunnelProcess) {
      resolve({ url: tunnelUrl });
      return;
    }

    const child = spawn(cloudflaredCommand(), ["tunnel", "--url", `http://127.0.0.1:${port}`]);
    tunnelProcess = child;
    stoppingTunnel = false;
    let output = "";
    let settled = false;

    const finish = (error, url) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (error) reject(error);
      else resolve({ url });
    };

    const onOutput = (chunk) => {
      output = (output + chunk.toString()).slice(-20000);
      const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if (!match) return;
      tunnelUrl = match[0];
      tunnelHandler?.({ running: true, url: tunnelUrl });
      finish(null, tunnelUrl);
    };

    child.stdout.on("data", onOutput);
    child.stderr.on("data", onOutput);
    child.once("error", (err) => {
      tunnelProcess = null;
      tunnelUrl = null;
      const message =
        err.code === "ENOENT"
          ? "cloudflared is not installed or could not be found. Install it and try again."
          : `Could not start cloudflared: ${err.message}`;
      tunnelHandler?.({ running: false, error: message });
      finish(new Error(message));
    });
    child.once("exit", (code) => {
      const wasStopping = stoppingTunnel;
      tunnelProcess = null;
      tunnelUrl = null;
      if (!wasStopping) {
        const detail = output.trim().split("\n").at(-1);
        const message = `Cloudflare tunnel stopped${code === null ? "" : ` (exit ${code})`}${detail ? `: ${detail}` : ""}`;
        tunnelHandler?.({ running: false, error: message });
        finish(new Error(message));
      }
    });

    const timeout = setTimeout(() => {
      child.kill();
      finish(new Error("Timed out while waiting for Cloudflare to create a tunnel."));
    }, 20000);
  });
}

function stopTunnel() {
  return new Promise((resolve) => {
    if (!tunnelProcess) {
      tunnelUrl = null;
      resolve();
      return;
    }

    const child = tunnelProcess;
    stoppingTunnel = true;
    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
      tunnelProcess = null;
      tunnelUrl = null;
      tunnelHandler?.({ running: false });
      resolve();
    };
    child.once("exit", done);
    child.kill();
    setTimeout(() => {
      if (!resolved) child.kill("SIGKILL");
      done();
    }, 2000);
  });
}

async function start(port = 8080, options = {}) {
  if (server) return { ok: false, error: "Proxy server is already running." };

  const listenResult = await new Promise((resolve) => {
    const nextServer = app.listen(port, () => {
      server = nextServer;
      resolve({ ok: true, port });
    });
    nextServer.on("error", (err) => {
      if (server === nextServer) server = null;
      resolve({ ok: false, error: err.message });
    });
  });

  if (!listenResult.ok || !options.cloudflareTunnel) return listenResult;

  try {
    const tunnel = await startTunnel(port);
    return { ...listenResult, tunnelUrl: tunnel.url };
  } catch (err) {
    await stop();
    return { ok: false, error: err.message };
  }
}

async function stop() {
  await stopTunnel();
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
  return {
    running: !!server,
    port: server?.address()?.port ?? null,
    tunnel: { running: !!tunnelProcess && !!tunnelUrl, url: tunnelUrl },
  };
}

function setRules(newRules) {
  rules = newRules;
  proxyCache.clear();
}

process.once("exit", () => tunnelProcess?.kill());

module.exports = { start, stop, getStatus, setRules, setLogHandler, setTunnelHandler };
