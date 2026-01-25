Param(
  [string]$BundleName = "5tratumos-update.tgz",
  [string]$DistDir = "",
  [string]$SigningKey = "",
  [string]$BuildTag = "",
  [string]$Channel = "",
  [string]$UpdateRepo = ""
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

$tag = $BuildTag
if ([string]::IsNullOrWhiteSpace($tag)) {
  try {
    $tag = (& git -C $root describe --tags --always 2>$null).Trim()
  } catch {
    $tag = ""
  }
}
if ([string]::IsNullOrWhiteSpace($tag)) {
  $tag = "unknown"
}

$ch = $Channel
if ([string]::IsNullOrWhiteSpace($ch)) {
  $ch = $env:TRATUMOS_CHANNEL
}
if ([string]::IsNullOrWhiteSpace($ch)) {
  $ch = $env:OS_CHANNEL
}
if ([string]::IsNullOrWhiteSpace($ch)) {
  $ch = $env:FIVETRATUMOS_CHANNEL
}
if ([string]::IsNullOrWhiteSpace($ch)) {
  $ch = "main"
}
$ch = $ch.Trim().ToLowerInvariant()

$repo = $UpdateRepo
if ([string]::IsNullOrWhiteSpace($repo)) {
  $repo = $env:TRATUMOS_UPDATE_REPO
}
if ([string]::IsNullOrWhiteSpace($repo)) {
  $repo = $env:FIVETRATUMOS_UPDATE_REPO
}
if ([string]::IsNullOrWhiteSpace($repo)) {
  $repo = "WillItMod/5tratum"
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

  # Ensure bundles always ship valid build metadata.
  # (Some prior builds accidentally wrote a literal "\\n" suffix, making JSON invalid.)
  $builtAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  $build = @{
    channel  = $ch
    repo     = $repo
    tag      = $tag
    built_at = $builtAt
  }
  $buildJson = ($build | ConvertTo-Json -Compress)
  # ASCII avoids UTF-8 BOM (Python json.loads with encoding="utf-8" would fail on BOM).
  Set-Content -Encoding ASCII -NoNewline -Path (Join-Path $stageBootstrap "build.json") -Value $buildJson

  # Guardrail: fail the build if any critical web assets contain a literal "\n" line.
  # This breaks JS parsing and bricks the WebUI.
  $checkFiles = @(
    (Join-Path $stageOverlay "portal\\app.js"),
    (Join-Path $stageOverlay "portal\\5tratumos.css"),
    (Join-Path $stageOverlay "portal\\index.html"),
    (Join-Path $stageOverlay "portal\\login.html"),
    (Join-Path $stageBootstrap "build.json")
  )
  foreach ($f in $checkFiles) {
    if (-not (Test-Path $f)) { continue }
    $lineNo = 0
    foreach ($line in (Get-Content -Path $f)) {
      $lineNo++
      if ($line -match '^\s*\\n\s*$') {
        throw "Invalid literal '\\n' line in $f at line $lineNo (refusing to build)"
      }
    }
  }

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
