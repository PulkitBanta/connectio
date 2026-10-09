// Content for connectio.pulkitbanta.com (/) and its Markdown twin (/index.md).
// Facts here mirror the README and INSTALL.md. The version comes from the app's package.json,
// so download links follow each release without edits here.
import pkg from '../../../package.json';
import tour from '../../../screenshots/connectio-launch.mp4?url';

const version = pkg.version;
const repo = 'https://github.com/PulkitBanta/connectio';
const latest = `${repo}/releases/latest`;
const raw = 'https://raw.githubusercontent.com/PulkitBanta/connectio/main';

export const connectio = {
  name: 'Connectio',
  version,
  license: 'MIT',
  tagline: 'One local address for all your development servers.',
  summary:
    'Connectio is a free, open-source desktop app. It puts all of your local development servers behind one address. It sends each request to a server by its path and shows each request immediately. You can share your servers through a Cloudflare tunnel. You do not write an nginx config.',
  description:
    'Connectio is a free, open-source local proxy manager for macOS, Windows, and Linux. It sends requests to local development servers by path, shows each request, and shares them through a temporary Cloudflare tunnel.',
  repo,
  latest,
  installGuide: `${repo}/blob/main/INSTALL.md`,
  // Bump ?v= when og.png changes so social platforms refetch it.
  ogImage: '/og.png?v=20261009',
  video: { src: tour, poster: '/tour-poster.jpg', duration: 'PT1M' },

  problems: [
    {
      title: 'CORS errors between ports',
      body: 'Your frontend on :3000 sends requests to the API on :3001, and the browser blocks them. When all servers use one origin, the browser has no cross-origin requests to block.',
    },
    {
      title: 'Cookies that do not arrive',
      body: 'The auth service on :4000 sets a session cookie, but the browser does not send it to the app on :3000. When all servers use one address, cookies operate correctly.',
    },
    {
      title: 'Webhooks that must have a public URL',
      body: 'Stripe, GitHub, and Slack must send requests to your computer. Select one checkbox to receive a temporary trycloudflare.com URL for all of your servers.',
    },
    {
      title: 'Reverse-proxy configs that you write again each time',
      body: 'You do not write an nginx.conf file, a Caddyfile, or a Docker network. You make rules in the UI, and you can save, load, and share them as JSON.',
    },
  ],

  steps: [
    {
      title: 'Add your servers',
      body: 'Click + to add each local server as an app. Type a name and a target, for example http://localhost:3001.',
    },
    {
      title: 'Write route rules',
      body: 'Add path rules, for example /api/* or /auth/login. Connectio compares the rules in sequence and uses the first rule that matches.',
    },
    {
      title: 'Start the server',
      body: 'Select a port. The default port is 8080. Then click Start. All of your servers are now available at one address.',
    },
    {
      title: 'Monitor each request',
      body: 'Each request shows in Recent Requests. Click a request to see the matched rule, the target, and the headers.',
    },
    {
      title: 'Share your servers',
      body: 'Enable the Cloudflare tunnel to receive a public URL while the server runs. When you stop the server, the tunnel closes.',
    },
  ],

  features: [
    {
      title: 'Wildcard route rules',
      body: 'Send glob paths, for example /api/*, to any local target. Connectio compares the rules in priority sequence.',
    },
    {
      title: 'Live request logs',
      body: 'See the method, path, status, and time of each request. Click a request to see all of its details.',
    },
    {
      title: 'Cloudflare tunnels',
      body: 'Each config can have a temporary public URL. The tunnel opens when the server starts and closes when it stops.',
    },
    {
      title: 'Save and load configs',
      body: 'Keep one config for each project. Click one time to load a different config.',
    },
    {
      title: 'JSON import and export',
      body: 'Copy a config to the clipboard, save it as a file, or paste a config into the app.',
    },
    {
      title: 'Built-in JSON editor',
      body: 'Edit a config as raw JSON. Connectio validates the JSON before it saves the config.',
    },
  ],

  downloads: [
    { os: 'macOS', detail: 'Apple Silicon', file: `Connectio-${version}-arm64.dmg`, key: 'mac' },
    { os: 'Windows', detail: '64-bit installer', file: `Connectio.Setup.${version}.exe`, key: 'win' },
    { os: 'Linux', detail: 'AppImage', file: `Connectio-${version}.AppImage`, key: 'linux' },
    { os: 'Linux', detail: 'Debian / Ubuntu', file: `connectio_${version}_amd64.deb`, key: 'deb' },
  ].map((d) => ({ ...d, url: `${repo}/releases/download/v${version}/${d.file}` })),

  install: {
    unix: `curl -fsSL ${raw}/scripts/install.sh | sh`,
    windows: `irm ${raw}/scripts/install.ps1 | iex`,
  },

  config: `{
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
}`,

  faqs: [
    {
      q: 'What is Connectio?',
      a: 'Connectio is a desktop app that runs a local reverse proxy. You add your local development servers and write path rules, for example /api/* → localhost:3001. Then you can access all of the servers through one address, for example localhost:8080.',
    },
    {
      q: 'Is Connectio free?',
      a: 'Yes. Connectio is free and open source. It uses the MIT license. The source code is on GitHub.',
    },
    {
      q: 'Which operating systems can it run on?',
      a: 'Connectio runs on macOS with Apple Silicon, on 64-bit Windows, and on Linux (AppImage or .deb). For Intel Macs and other architectures, build Connectio from the source code.',
    },
    {
      q: 'How does Connectio prevent CORS errors in local development?',
      a: 'CORS errors occur when your frontend and your API use different ports. The browser thinks that different ports are different origins. Connectio puts both behind the same port. Thus, the requests have the same origin, and the browser does not block them.',
    },
    {
      q: 'How is it different from nginx or Caddy?',
      a: 'nginx and Caddy are production web servers. You configure them with text files, and you must reload them after each change. Connectio is for local development. You edit rules in a UI, and the rules apply when you start the server. Connectio shows each request in a live log. It saves each configuration as JSON that you can load again.',
    },
    {
      q: 'Do I need Docker?',
      a: 'No. Connectio sends requests to servers that already run on your computer. You can start these servers in any way: npm scripts, Go binaries, Docker containers with published ports, or other programs that listen on localhost.',
    },
    {
      q: 'How do Cloudflare tunnels work in Connectio?',
      a: 'Before you start the server, enable "Cloudflare tunnel". Connectio starts a Cloudflare Quick Tunnel and shows the public trycloudflare.com URL. When you stop the server, Connectio closes the tunnel. You must have cloudflared in a directory on your PATH. All persons who have the URL can access every route. Thus, use tunnels only for development.',
    },
    {
      q: 'Where are my configs stored?',
      a: 'Connectio keeps configs as JSON files in the user data folder of your operating system: ~/Library/Application Support/connectio/configs on macOS, %APPDATA%/connectio/configs on Windows, and ~/.config/connectio/configs on Linux.',
    },
    {
      q: 'Why does my operating system show a warning when I open Connectio for the first time?',
      a: 'Connectio does not have a code signature yet. Thus, macOS and Windows ask you to confirm the first launch. The install guide gives the procedure. Alternatively, use the install script, which prevents these prompts.',
    },
    {
      q: 'How do I update Connectio?',
      a: 'Download the new release and install it over the old version. Alternatively, run the install script again. Connectio keeps your saved configs.',
    },
  ],
};
