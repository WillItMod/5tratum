Param(
  [string]$BundleName = "5tratumos-update.tgz",
  [string]$DistDir = "",
  [string]$SigningKey = "",
  [string]$BuildChannel = ""
)

$ErrorActionPreference = "Stop"

function Resolve-RepoRoot {
  $here = $PSScriptRoot
  if ([string]::IsNullOrWhiteSpace($here)) {
    $here = Split-Path -Parent $PSCommandPath
  }
  if ([string]::IsNullOrWhiteSpace($here)) {
    throw "Unable to resolve script directory"
  }
  return (Resolve-Path (Join-Path $here "..")).Path
}

$root = Resolve-RepoRoot
if ([string]::IsNullOrWhiteSpace($DistDir)) {
  $DistDir = Join-Path $root "dist"
}

New-Item -ItemType Directory -Force -Path $DistDir | Out-Null

$tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("5tratumos-update-" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

try {
  $stageOverlay = Join-Path $tmp "overlay"
  $stageDaemon = Join-Path $tmp "daemon"
  $stageBootstrap = Join-Path $tmp "bootstrap"
  $stageAppsAvailable = Join-Path $tmp "apps-available"
  $stageSystemd = Join-Path $tmp "systemd"
  $stageBin = Join-Path $tmp "bin"
  $stageConsole = Join-Path $tmp "console"

  New-Item -ItemType Directory -Force -Path $stageOverlay, $stageDaemon, $stageBootstrap, $stageAppsAvailable, $stageSystemd, $stageBin, $stageConsole | Out-Null

  Copy-Item -Recurse -Force -Path (Join-Path $root "overlay\\*") -Destination $stageOverlay
  Copy-Item -Recurse -Force -Path (Join-Path $root "daemon\\*") -Destination $stageDaemon
  Copy-Item -Recurse -Force -Path (Join-Path $root "bootstrap\\*") -Destination $stageBootstrap
  Copy-Item -Recurse -Force -Path (Join-Path $root "apps-available\\*") -Destination $stageAppsAvailable
  Copy-Item -Recurse -Force -Path (Join-Path $root "systemd\\*") -Destination $stageSystemd
  Copy-Item -Force -Path (Join-Path $root "bin\\5tratumos") -Destination (Join-Path $stageBin "5tratumos")
  if (Test-Path (Join-Path $root "console")) {
    Copy-Item -Recurse -Force -Path (Join-Path $root "console\\*") -Destination $stageConsole
  }

  # Embed build metadata inside the bundle so fresh installs can show a real version
  # even if the installer fails to write /etc/5tratumos/build.json.
  $channel = $BuildChannel
  if ([string]::IsNullOrWhiteSpace($channel)) { $channel = "main" }
  $tag = ""
  try { $tag = (& git -C $root describe --tags --abbrev=0 2>$null).Trim() } catch {}
  if ([string]::IsNullOrWhiteSpace($tag)) {
    try { $tag = ("rev-" + (& git -C $root rev-parse --short HEAD 2>$null).Trim()) } catch {}
  }
  if ([string]::IsNullOrWhiteSpace($tag)) { $tag = "unknown" }
  $buildObj = @{
    tag      = $tag
    repo     = "WillItMod/5tratum"
    channel  = $channel
    built_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  }
  $buildPath = Join-Path $stageBootstrap "build.json"
  ($buildObj | ConvertTo-Json -Compress) | Set-Content -Encoding UTF8 -NoNewline -Path $buildPath

  $bundlePath = Join-Path $DistDir $BundleName
  $shaPath = "$bundlePath.sha256"
  $sigPath = "$bundlePath.sig"

  if (Test-Path $bundlePath) { Remove-Item -Force $bundlePath }
  if (Test-Path $shaPath) { Remove-Item -Force $shaPath }
  if (Test-Path $sigPath) { Remove-Item -Force $sigPath }

  Push-Location $tmp
  try {
    tar -czf $bundlePath overlay daemon bootstrap apps-available systemd bin console
  } finally {
    Pop-Location
  }

  $hash = (Get-FileHash -Algorithm SHA256 -Path $bundlePath).Hash.ToLowerInvariant()
  "$hash  $BundleName" | Set-Content -Encoding ASCII -NoNewline -Path $shaPath

  if (-not [string]::IsNullOrWhiteSpace($SigningKey)) {
    if (-not (Test-Path $SigningKey)) { throw "SigningKey not found: $SigningKey" }
    & openssl pkeyutl -sign -inkey $SigningKey -in $bundlePath -out $sigPath | Out-Null
  }

  Write-Host "Wrote:"
  Write-Host "  $bundlePath"
  Write-Host "  $shaPath"
  if (Test-Path $sigPath) { Write-Host "  $sigPath" }
} finally {
  if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
}
