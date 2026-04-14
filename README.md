# Connectio

A local proxy manager — connect and route between local servers with optional Cloudflare tunnel exposure

## Development

```bash
yarn install
yarn dev
```

## Build

```bash
yarn build
```

## Release Notes

- Releases are built with `electron-builder`.
- Linux `.deb` packaging requires maintainer metadata (name + email) in `package.json`.
- CI publishes artifacts using `yarn build --publish always`.
