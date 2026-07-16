Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'

$scriptPath = Join-Path $PSScriptRoot 'C:\Users\Slaff\Documents\trosheencrafts-main\trosheen-boot.ps1' ?? 'C:\Users\Slaff\Documents\trosheencrafts-main\trosheen-boot.ps1'
Write-Host "Launching: $scriptPath";
if (Test-Path $scriptPath) {
  $settings = New-Object System.Management.Automation.PSInvocationSettings
  & powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File $scriptPath
} else {
  Write-Host "Boot script not found."
}
