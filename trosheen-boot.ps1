Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$project = 'C:\Users\Slaff\Documents\trosheencrafts-main'
$logDir = Join-Path $project 'logs'
$bootLog = Join-Path $logDir 'boot.log'
$serverLog = Join-Path $logDir 'server.log'
$serverStdOut = Join-Path $logDir 'server_stdout.log'
$serverStdErr = Join-Path $logDir 'server_stderr.log'
$supabaseLog = Join-Path $logDir 'supabase.log'
$supabaseErrLog = Join-Path $logDir 'supabase.err.log'
$dockerLog = Join-Path $logDir 'docker.log'
$statusCodeFile = Join-Path $logDir 'status_code.txt'
$nodeExe = 'C:\Users\Slaff\AppData\Local\hermes\node\node.exe'
$npmExe = 'C:\Users\Slaff\AppData\Local\hermes\node\npm.cmd'
$supabaseExe = 'C:\Users\Slaff\AppData\Local\hermes\node\supabase.cmd'
$appServer = Join-Path $project 'dist\index.cjs'
$dockerExe = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'

if (-not (Test-Path $logDir)) {
    New-Item -Path $logDir -ItemType Directory | Out-Null
}

function Write-Log($message) {
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $entry = "[$timestamp] $message"
    Add-Content -Path $bootLog -Value $entry
    Write-Host $entry
}

Write-Log '=== Trosheen Crafts Boot Sequence Started ==='

function Test-CommandAvailable($path) {
    return (Test-Path $path)
}

# -------------------------------
# 1. Ensure Docker Desktop is available
# -------------------------------
Write-Log 'Step 1: Ensuring Docker Desktop is available...'

$dockerReady = $false
$maxDockerWaitSeconds = 600
$dockerWaitStart = Get-Date

while (-not $dockerReady) {
    try {
        $dockerInfoOutput = & docker info 2>&1 | Out-String
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Log 'Docker is ready.'
            break
        }
    } catch {}

    if ((New-TimeSpan -Start $dockerWaitStart -End (Get-Date)).TotalSeconds -gt $maxDockerWaitSeconds) {
        Write-Log 'Docker Desktop did not become ready in time. Launching Docker Desktop...'
        if (Test-Path $dockerExe) {
            Start-Process -FilePath $dockerExe
            Start-Sleep -Seconds 2
        } else {
            Write-Log "ERROR: Docker Desktop executable not found at: $dockerExe"
        }
    }

    Write-Log 'Waiting for Docker to become ready...'
    Start-Sleep -Seconds 10
}

if (-not $dockerReady) {
    Write-Log 'CRITICAL: Docker Desktop is not available after extended wait. Aborting boot sequence.'
    exit 1
}

"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') Docker Desktop confirmed ready." | Add-Content -Path $dockerLog

# -------------------------------
# 2. Start Supabase
# -------------------------------
Write-Log 'Step 2: Starting Supabase...'

$supabaseRunning = $false
$maxSupabaseRetries = 3

if (-not (Test-CommandAvailable $supabaseExe)) {
    Write-Log "Supabase CLI not found at: $supabaseExe"
}

if ((Test-Path (Join-Path $project 'supabase\config.toml')) -or (Test-Path (Join-Path $project '.supabase'))) {
    for ($attempt = 1; $attempt -le $maxSupabaseRetries; $attempt++) {
        Write-Log "Supabase start attempt $attempt/$maxSupabaseRetries"
        try {
            Push-Location $project
            $proc = Start-Process -FilePath $supabaseExe -ArgumentList 'start' -NoNewWindow -Wait -PassThru -RedirectStandardOutput $supabaseLog -RedirectStandardError $supabaseErrLog
            Pop-Location
            if ($proc.ExitCode -eq 0) {
                $supabaseRunning = $true
                break
            }
            Write-Log "Supabase start returned exit code $($proc.ExitCode)"
        } catch {
            Write-Log "Supabase start threw exception: $_"
        }
        Start-Sleep -Seconds 5
    }
} else {
    Write-Log 'Supabase config not found in project. Skipping Supabase start.'
}

if (-not $supabaseRunning) {
    Write-Log 'WARNING: Supabase did not start successfully after retries.'
}

"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') Supabase boot sequence complete." | Add-Content -Path $supabaseLog

# -------------------------------
# 3. Run database migrations
# -------------------------------
Write-Log 'Step 3: Running database migrations...'

if (Test-Path $npmExe) {
    Push-Location $project
    try {
        $migrateOutput = & $npmExe run db:push 2>&1 | Out-String
        if ($migrateOutput) {
            "db:push output: $migrateOutput" | Add-Content -Path $bootLog
        }
        Write-Log 'Database migrations applied.'
    } catch {
        Write-Log "Database migration error: $_"
    } finally {
        Pop-Location
    }
} else {
    Write-Log "npm not found at: $npmExe"
}

# -------------------------------
# Load .env for tunnel token and app secrets
# -------------------------------
$envFile = Join-Path $project '.env'
if (Test-Path $envFile) {
    Write-Log 'Loading .env into process environment...'
    Get-Content -Path $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#')) {
            $parts = $line.Split('=', 2)
            if ($parts.Length -eq 2) {
                $name = $parts[0].Trim()
                $value = $parts[1].Trim()
                if ($value.Length -ge 2 -and $value[0] -eq '"' -and $value[-1] -eq '"') {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                [System.Environment]::SetEnvironmentVariable($name, $value, 'Process')
            }
        }
    }
}

# -------------------------------
# 4. Start App and Cloudflare via Docker Compose
# -------------------------------
Write-Log 'Step 4: Starting Docker Compose (App, Nginx, Cloudflared)...'

Push-Location $project
try {
    $proc = Start-Process -FilePath "docker" -ArgumentList "compose","up","-d","--build" -Wait -NoNewWindow -PassThru
    if ($proc.ExitCode -eq 0) {
        Write-Log 'Docker Compose started successfully.'
    } else {
        Write-Log "Docker Compose error output with exit code $($proc.ExitCode)"
    }
} catch {
    Write-Log "Docker Compose threw exception: $_"
} finally {
    Pop-Location
}

# -------------------------------
# 5. Check if service is listening locally (optional health check)
# -------------------------------
Start-Sleep -Seconds 8
$listener = $null
try {
    $listener = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
} catch {}

if ($null -ne $listener) {
    Write-Log 'Server container is listening on port 5000.'
    try {
        $response = Invoke-WebRequest -Uri 'http://localhost:5000/' -UseBasicParsing -TimeoutSec 15
        Set-Content -Path $statusCodeFile -Value $response.StatusCode
        Write-Log "Server HTTP status: $($response.StatusCode)"
    } catch {
        Set-Content -Path $statusCodeFile -Value '000'
        Write-Log "Server HTTP check failed: $_"
    }
} else {
    Write-Log 'WARNING: Port 5000 is not listening yet. Check Docker logs.'
    Set-Content -Path $statusCodeFile -Value '000'
}

Write-Log '=== Trosheen Crafts Boot Sequence Complete ==='

Write-Host
Write-Host "BOOT_COMPLETE"
Write-Host
