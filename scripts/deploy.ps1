param(
  [string]$RemoteHost = "10.10.10.91",
  [string]$RemoteUser = "admin",
  [string]$IdentityFile = "$env:USERPROFILE\\.ssh\\id_5tratumos",
  [ValidateSet("portal", "daemon", "all")]
  [string]$Target = "all"
)

$ErrorActionPreference = "Stop"

function Invoke-CommandChecked {
  param([string]$Command)
  Write-Host ">> $Command"
  cmd /c $Command
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed ($LASTEXITCODE): $Command"
  }
}

function Deploy-Portal {
  $src = "C:\VSC\5tratumOS\overlay\portal"
  $id = ""
  if ($IdentityFile) {
    $id = "-i `"$IdentityFile`""
  }
  $ssh = "ssh -T -o BatchMode=yes -o StrictHostKeyChecking=accept-new $id $RemoteUser@$RemoteHost"
  $cmd = "tar -cf - -C `"$src`" . | $ssh `"sudo -n /bin/mkdir -p '/opt/5tratumos/overlay/portal' && sudo -n tar -xf - -C '/opt/5tratumos/overlay/portal' && sudo -n /bin/systemctl restart 5tratumos-overlay.service`""
  Invoke-CommandChecked $cmd
}

function Deploy-Daemon {
  $src = "C:\VSC\5tratumOS\daemon"
  $id = ""
  if ($IdentityFile) {
    $id = "-i `"$IdentityFile`""
  }
  $ssh = "ssh -T -o BatchMode=yes -o StrictHostKeyChecking=accept-new $id $RemoteUser@$RemoteHost"
  $cmd = "tar -cf - -C `"$src`" 5tratumosd.py | $ssh `"sudo -n /bin/mkdir -p '/opt/5tratumos/daemon' && sudo -n tar -xf - -C '/opt/5tratumos/daemon' && sudo -n /bin/systemctl restart 5tratumosd`""
  Invoke-CommandChecked $cmd
}

switch ($Target) {
  "portal" { Deploy-Portal }
  "daemon" { Deploy-Daemon }
  "all" {
    Deploy-Portal
    Deploy-Daemon
  }
}
