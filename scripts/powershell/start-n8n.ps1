# Load .env and launch n8n locally.
# Used only for LOCAL deployment mode. VPS mode uses Docker Compose.

$ErrorActionPreference = 'Stop'

# Kill existing n8n on port 5678 if any
$existing = Get-NetTCPConnection -LocalPort 5678 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    $oldPid = $existing.OwningProcess
    Write-Host "[start-n8n] Killing existing n8n PID $oldPid..." -ForegroundColor Yellow
    Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

$envFile = Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) '.env'
if (-not (Test-Path $envFile)) {
    Write-Error ".env not found at $envFile — run intake first to generate it"
    exit 1
}

$loaded = 0
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    if ($line -notmatch '^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') { return }
    $key = $matches[1]
    $value = $matches[2].Trim()
    if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") { $value = $matches[1] }
    [Environment]::SetEnvironmentVariable($key, $value, 'Process')
    $loaded++
}

Write-Host "[start-n8n] Loaded $loaded env vars from .env" -ForegroundColor Green
Write-Host "[start-n8n] Starting n8n on http://localhost:5678 ..." -ForegroundColor Cyan

$n8nVersion = if ($env:N8N_VERSION) { $env:N8N_VERSION } else { '1.121.0' }
npx --yes "n8n@$n8nVersion"
