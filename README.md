<p align="center">
  <img src="icons/icon.png" alt="Connectio" width="128" />
</p>

<h1 align="center">Connectio</h1>

<p align="center">
  Connectio is a local proxy manager. Use one dashboard to send HTTP requests to your local servers through one address.
</p>

<p align="center">
  <a href="https://github.com/PulkitBanta/connectio/releases/latest"><img src="https://img.shields.io/github/v/release/PulkitBanta/connectio?style=flat-square" alt="Latest release" /></a>
  <a href="https://github.com/PulkitBanta/connectio/actions/workflows/build.yml"><img src="https://img.shields.io/github/actions/workflow/status/PulkitBanta/connectio/build.yml?branch=main&style=flat-square&label=build" alt="Build status" /></a>
  <a href="https://github.com/PulkitBanta/connectio/releases"><img src="https://img.shields.io/github/downloads/PulkitBanta/connectio/total?style=flat-square" alt="Downloads" /></a>
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue?style=flat-square" alt="Platform" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/PulkitBanta/connectio?style=flat-square" alt="License" /></a>
</p>

<p align="center">
  <a href="https://pulkitbanta.com/connectio/">Website</a> ·
  <a href="#video-tour">Video tour</a> ·
  <a href="#download">Download</a> ·
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#how-to-contribute">How to contribute</a>
</p>

<p align="center">
  <img src="screenshots/connectio-request-details.png" alt="Connectio routing requests, showing request details and a Cloudflare tunnel URL" width="800" />
</p>

## Purpose of Connectio

Usually, local development uses more than one server. For example, the frontend is on `:3000`, the API is on `:3001`, and an auth service is on `:4000`. This causes these problems:

- The browser blocks requests between the ports (CORS errors).
- Cookies do not go from one port to a different port.
- Webhooks must have one public URL.

Connectio puts all of these servers behind **one local address**. Write path rules, for example `/api/*` → `localhost:3001` and `/*` → `localhost:3000`. Then click **Start**. Connectio sends each request to the correct server and records it in a log. You do not write an nginx config, and you do not restart a reverse proxy. To share your servers, start a temporary Cloudflare tunnel.

## Video tour

This 60-second video shows the primary workflow: add apps, add route rules, start the server, examine requests, share through a tunnel, and save configs as JSON.

<p align="center">
  <a href="screenshots/connectio-launch.mp4"><img src="screenshots/connectio-launch-poster.jpg" alt="Watch the 60-second Connectio tour" width="800" /></a>
</p>

## Download

Download the latest build for your operating system from the [**Releases page**](https://github.com/PulkitBanta/connectio/releases/latest):

- macOS (Apple Silicon): `.dmg`
- Windows: `.exe`
- Linux: `.AppImage` or `.deb`

You can also install Connectio from the terminal:

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/PulkitBanta/connectio/main/scripts/install.sh | sh
```

```powershell
# Windows (PowerShell)
irm https://raw.githubusercontent.com/PulkitBanta/connectio/main/scripts/install.ps1 | iex
```

> [!NOTE]
> Connectio does not have a code signature yet. Thus, macOS and Windows ask you to confirm when you open a downloaded build for the first time. For the procedure, see the [**installation guide**](INSTALL.md#first-launch). The guide also tells you how to update and remove Connectio.

## Features

- **Proxy apps** — Make many proxy apps. Each app sends requests to a different local server, for example `localhost:3001` or `localhost:4000`.
- **Wildcard route rules** — Write path rules with glob wildcards, for example `/api/*` or `/auth/login`. Connectio compares the rules in sequence, so you control the priority.
- **Detailed request logs** — See each request when it occurs. Click a log entry to see the matched rule, the target, the connection data, and the request and response headers.
- **Temporary Cloudflare tunnels** — Enable a tunnel for each config. While the server runs, the tunnel gives the proxy a temporary public `trycloudflare.com` URL.
- **App sequence** — Move proxy apps up or down. The sequence sets the rule priority. If the first app matches `/*`, that app receives the request.
- **Config manager** — Find, rename, and delete saved configs in the configs list.
- **JSON import and export** — To import a config, paste raw JSON or select a file in the native dialog. To export a config, copy it to the clipboard or save it as a `.json` file.
- **JSON editor** — Edit the raw JSON of a config in the app. Connectio validates the JSON before it saves the config.
- **Save and load** — Save the current state as a named config. Load a saved config from the sidebar panel.
- **Collapsible sidebar** — Expand the left navigation to see the full app names. Collapse it to show only icons and make more screen area available.
- **Cross-platform** — Connectio operates on macOS, Windows, and Linux. It keeps configs in the user data directory of the operating system.

<details>
<summary><strong>More screenshots</strong></summary>
<br />

<table>
  <tr>
    <td width="50%"><img src="screenshots/connectio-home.png" alt="Home screen" /></td>
    <td width="50%"><img src="screenshots/connectio-feature-highlights.png" alt="App and rule ordering" /></td>
  </tr>
  <tr>
    <td align="center"><em>Home screen with server controls in the right sidebar</em></td>
    <td align="center"><em>Move apps and route rules to change the match priority</em></td>
  </tr>
  <tr>
    <td><img src="screenshots/connectio-load-config.png" alt="Load config dialog" /></td>
    <td><img src="screenshots/connectio-configs-list.png" alt="Configs list view" /></td>
  </tr>
  <tr>
    <td align="center"><em>Save and load named configs</em></td>
    <td align="center"><em>Find and manage saved configs</em></td>
  </tr>
  <tr>
    <td><img src="screenshots/connectio-share-menu.png" alt="Share config menu" /></td>
    <td><img src="screenshots/connectio-paste-json.png" alt="Paste JSON import" /></td>
  </tr>
  <tr>
    <td align="center"><em>Export a config to the clipboard or a <code>.json</code> file</em></td>
    <td align="center"><em>Paste raw JSON to import a config</em></td>
  </tr>
</table>

</details>

## How It Works

Connectio runs an Express proxy server on a port that you select. The default port is `8080`. When the server receives a request, Connectio compares the request path with your route rules in sequence. It uses the first rule that matches. Then it sends the request to the target server through `http-proxy-middleware`. The UI shows each response in the log immediately.

```
Browser / cURL                      Your local servers
       │                                   ▲
       │  GET /api/users                   │
       ▼                                   │
  ┌──────────┐   match: /api/*   ┌─────────────────┐
  │ Connectio│ ───────────────►  │ localhost:3001  │
  │ :8080    │                   │ (API server)    │
  │          │   match: /*       ├─────────────────┤
  │          │ ───────────────►  │ localhost:3000  │
  └──────────┘                   │ (Frontend)      │
                                 └─────────────────┘
```

## Quick Start

1. In the left sidebar, click **+** to add a proxy app.
2. Type a name, for example "API Server".
3. Type a target URL, for example `http://localhost:3001`.
4. Click the app.
5. Click **+ Add Rule**.
6. Type a route pattern, for example `/api/*`.
7. In the right sidebar, set the port.
8. Click **Start Server**.
9. Send requests to `http://localhost:8080`. Connectio sends each request to the correct server and shows it in the log.
10. To see the details of a request, click it in **Recent Requests**. The details include the matched rule, the target, and the headers.

### Share through a Cloudflare tunnel

1. Make sure that [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/) is in a directory on your `PATH`. Alternatively, set the `CLOUDFLARED_PATH` variable.
2. Before you start the server, enable **Cloudflare tunnel**.
3. Start the server. Connectio starts a [Cloudflare Quick Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/) and shows the public URL.
4. Click the URL to copy it.
5. When you stop the server, Connectio closes the tunnel.

> [!WARNING]
> Enable a tunnel only for servers that you can safely make public. All persons on the internet who have the URL can access **every route** in your proxy. The tunnel has no authentication. Stop the server when you complete your work. Quick Tunnels are for development and tests only. Do not use them in production.

## Config Storage

Connectio saves configs as JSON files in the user data directory of the operating system:

| OS      | Path                                               |
| ------- | -------------------------------------------------- |
| macOS   | `~/Library/Application Support/connectio/configs/` |
| Windows | `%APPDATA%/connectio/configs/`                     |
| Linux   | `~/.config/connectio/configs/`                     |

This is an example config. The `cloudflareTunnel` field is optional. Its default value is `false`.

```json
{
  "apps": [
    {
      "id": "api",
      "name": "API Server",
      "targetUrl": "http://localhost:3001",
      "enabled": true,
      "rules": [{ "id": "r1", "matchPath": "/api/*", "enabled": true }]
    }
  ],
  "port": 8080,
  "cloudflareTunnel": false
}
```

## How to contribute

Contributions are welcome. Report bugs and send feature ideas in [Issues](https://github.com/PulkitBanta/connectio/issues). To change the code, open a pull request to the `main` branch.

### Build from source

You must have [Node.js](https://nodejs.org/) v22 or later and [Yarn](https://classic.yarnpkg.com/) v1.

```bash
git clone https://github.com/PulkitBanta/connectio.git
cd connectio
yarn install
yarn dev        # Start with DevTools open
```

| Command       | What it does                                  |
| ------------- | --------------------------------------------- |
| `yarn dev`    | Start the app with hot reload and DevTools    |
| `yarn start`  | Run the production build without DevTools     |
| `yarn lint`   | Run ESLint                                    |
| `yarn format` | Run Prettier                                  |
| `yarn build`  | Build the app and put the packages in `dist/` |

### Guidelines

- Run `yarn lint` and `yarn format` before you push.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, …). The release notes and version numbers come from these commit messages.
- Keep each PR on one topic. For UI changes, include a screenshot.

### Build & Release

- **Build** — For each push to `main` and each PR, the [build workflow](.github/workflows/build.yml) runs on macOS, Windows, and Linux.
- **Release** — [release-please](https://github.com/googleapis/release-please) monitors `main`. It keeps a release PR open with the next version and the [changelog](CHANGELOG.md). When you merge that PR, release-please tags the release. Then the [release workflow](.github/workflows/release.yml) builds the three platforms and attaches the installers to the GitHub Release.

<details>
<summary><strong>Tech stack</strong></summary>

- **Desktop Shell** — [Electron](https://www.electronjs.org/) with context isolation
- **UI Framework** — [Solid.js](https://www.solidjs.com/) with TypeScript. Signals update the UI quickly and predictably.
- **Styling** — [Tailwind CSS v4](https://tailwindcss.com/) through the `@tailwindcss/vite` plugin
- **Icons** — [Lucide](https://lucide.dev/) rendered as native Solid SVG components
- **Build Tool** — [electron-vite](https://github.com/alex8088/electron-vite/) — hot module replacement for the main, preload, and renderer code
- **Packaging** — [electron-builder](https://www.electron.build/) — makes `.dmg`, `.AppImage`, `.deb`, `.exe`
- **Proxy Server** — [Express 5](https://expressjs.com/) — receives the requests
- **Proxying** — [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) — matches routes and sends requests to the targets
- **Linting** — ESLint v10 with `typescript-eslint`
- **Formatting** — Prettier

</details>

<details>
<summary><strong>Project structure</strong></summary>

```
src/
├── main/               # Electron main process
│   ├── index.ts        # App lifecycle, window creation
│   ├── server.ts       # Proxy IPC handlers, request log + tunnel status forwarding
│   ├── configs.ts      # Config CRUD — list, load, save, delete, rename, export, import
│   └── ipc.ts          # Registers all IPC handlers
├── preload/
│   └── index.ts        # Context bridge — exposes window.connectio to the renderer
├── renderer/           # Solid.js UI
│   ├── index.html      # Shell HTML
│   ├── index.tsx       # Solid entry point
│   ├── App.tsx         # Root component — view router, layout
│   ├── components/     # UI components (Nav, ProxyView, ConfigsView, etc.)
│   ├── lib/            # State (signals), IPC client, utilities, constants
│   └── styles/
│       └── index.css   # Tailwind entry
└── server.js           # Express proxy server, rule matching, Cloudflare tunnel process
```

</details>

## License

[MIT](LICENSE) © Pulkit Banta
