# Connectio installer for Windows.
#
#   irm https://raw.githubusercontent.com/PulkitBanta/connectio/main/scripts/install.ps1 | iex
#
# Set $env:CONNECTIO_VERSION (e.g. "1.1.0") to install a specific version instead of the latest release.

& {
  $ErrorActionPreference = 'Stop'
  $ProgressPreference = 'SilentlyContinue' # Invoke-WebRequest is much faster without the progress bar

  $repo = 'PulkitBanta/connectio'
  $version = $env:CONNECTIO_VERSION
  if (-not $version) {
    $version = (Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest").tag_name
  }
  $version = $version.TrimStart('v')

  $asset = "Connectio.Setup.$version.exe"
  $url = "https://github.com/$repo/releases/download/v$version/$asset"
  $installer = Join-Path ([System.IO.Path]::GetTempPath()) $asset

  Write-Host "==> Downloading $asset" -ForegroundColor Green
  Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
  # Files saved by PowerShell aren't marked as downloaded from the internet, but clear it in case.
  Unblock-File -Path $installer

  Write-Host "==> Installing Connectio $version" -ForegroundColor Green
  try {
    # One-click, per-user NSIS installer: /S installs silently without admin rights.
    Start-Process -FilePath $installer -ArgumentList '/S' -Wait
  } finally {
    Remove-Item -Path $installer -ErrorAction SilentlyContinue
  }

  Write-Host "==> Installed Connectio $version - launch it from the Start menu." -ForegroundColor Green
}
