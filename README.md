# Connectio

A local proxy manager - Connect your applications with a simple config based server to proxy servers and combine those under a single umbrella.

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
