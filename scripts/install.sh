#!/bin/sh
# Connectio installer for macOS and Linux.
#
#   curl -fsSL https://raw.githubusercontent.com/PulkitBanta/connectio/main/scripts/install.sh | sh
#
# Environment overrides:
#   CONNECTIO_VERSION      Install a specific version (e.g. 1.1.0) instead of the latest release
#   CONNECTIO_INSTALL_DIR  macOS only — where to put Connectio.app (default: /Applications)
set -eu

REPO="PulkitBanta/connectio"

info() { printf '\033[1;32m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$1" >&2; }
fail() {
  printf '\033[1;31merror:\033[0m %s\n' "$1" >&2
  exit 1
}

command -v curl >/dev/null 2>&1 || fail "curl is required but was not found."

version="${CONNECTIO_VERSION:-}"
if [ -z "$version" ]; then
  # /releases/latest redirects to /releases/tag/v<version> — avoids the GitHub API rate limit.
  latest_url=$(curl -fsSLI -o /dev/null -w '%{url_effective}' "https://github.com/$REPO/releases/latest") ||
    fail "Could not reach GitHub to look up the latest release."
  version="${latest_url##*/}"
fi
version="${version#v}"
case "$version" in
  [0-9]*) ;;
  *) fail "Could not determine the latest Connectio version." ;;
esac

base_url="https://github.com/$REPO/releases/download/v$version"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

download() {
  info "Downloading $1"
  curl -fL --progress-bar -o "$tmp/$1" "$base_url/$1" || fail "Download failed: $base_url/$1"
}

install_macos() {
  # uname -m reports x86_64 under Rosetta, so ask the hardware directly.
  if [ "$(sysctl -n hw.optional.arm64 2>/dev/null || echo 0)" != "1" ]; then
    fail "Connectio currently ships Apple Silicon builds only. Intel Macs can build from source: https://github.com/$REPO#build-from-source"
  fi

  asset="Connectio-$version-arm64-mac.zip"
  download "$asset"
  ditto -x -k "$tmp/$asset" "$tmp/app"

  dest="${CONNECTIO_INSTALL_DIR:-/Applications}"
  if [ -z "${CONNECTIO_INSTALL_DIR:-}" ] && [ ! -w "$dest" ]; then
    dest="$HOME/Applications"
  fi
  mkdir -p "$dest"
  rm -rf "$dest/Connectio.app"
  mv "$tmp/app/Connectio.app" "$dest/"
  # curl doesn't quarantine downloads, but clear it in case the file came from elsewhere.
  xattr -dr com.apple.quarantine "$dest/Connectio.app" 2>/dev/null || true

  info "Installed Connectio $version to $dest/Connectio.app"
  echo "    Open it from Launchpad, Spotlight, or: open \"$dest/Connectio.app\""
}

install_linux() {
  case "$(uname -m)" in
    x86_64 | amd64) ;;
    *) fail "Connectio currently ships x86_64 Linux builds only." ;;
  esac

  if command -v apt-get >/dev/null 2>&1; then
    asset="connectio_${version}_amd64.deb"
    download "$asset"
    info "Installing $asset (you may be asked for your password)"
    sudo apt-get install -y "$tmp/$asset"
    info "Installed Connectio $version — launch it from your app menu or run: connectio"
    return
  fi

  asset="Connectio-$version.AppImage"
  download "$asset"
  bin_dir="$HOME/.local/bin"
  data_dir="${XDG_DATA_HOME:-$HOME/.local/share}"
  mkdir -p "$bin_dir" "$data_dir/applications" "$data_dir/icons/hicolor/512x512/apps"
  cp "$tmp/$asset" "$bin_dir/connectio"
  chmod 755 "$bin_dir/connectio"

  curl -fsSL -o "$data_dir/icons/hicolor/512x512/apps/connectio.png" \
    "https://raw.githubusercontent.com/$REPO/main/icons/icon.png" || warn "Could not download the app icon."
  cat >"$data_dir/applications/connectio.desktop" <<EOF
[Desktop Entry]
Name=Connectio
Comment=Local proxy manager
Exec=$bin_dir/connectio %U
Icon=connectio
Terminal=false
Type=Application
Categories=Network;Development;
EOF

  info "Installed Connectio $version to $bin_dir/connectio"
  case ":$PATH:" in
    *":$bin_dir:"*) ;;
    *) warn "$bin_dir is not on your PATH — launch Connectio from your app menu or add it to PATH." ;;
  esac
  echo "    AppImages need FUSE 2. If it doesn't start, install libfuse2 (or fuse2) with your package manager."
}

case "$(uname -s)" in
  Darwin) install_macos ;;
  Linux) install_linux ;;
  *) fail "Unsupported OS: $(uname -s). On Windows, use scripts/install.ps1 — see https://github.com/$REPO#download" ;;
esac
