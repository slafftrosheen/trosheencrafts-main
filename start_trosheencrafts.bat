@echo off
setlocal

set "PROJECT=C:\Users\Slaff\Documents\trosheencrafts-main"
set "TUNNEL_NAME=cloudflared"
set "TUNNEL_IMAGE=cloudflare/cloudflared:latest"

echo ==========================================
echo TROSHEEN CRAFTS BOOTSTRAP
echo ==========================================

:: 1. Ensure Docker Desktop is running
echo [1/4] Checking Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
    echo Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Waiting for Docker to be ready...
    :waitdocker
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if errorlevel 1 goto waitdocker
)
echo Docker is running.

:: 2. Start Supabase
echo [2/4] Starting Supabase...
cd /d "%PROJECT%"
start "" cmd /c "cd /d %PROJECT% && supabase start"

:: 3. Start app server in production mode
echo [3/4] Starting Trosheen server...
cd /d "%PROJECT%"
if not exist dist\index.cjs (
    echo Building project...
    call npm run build
)
start "" cmd /c "set NODE_ENV=production && cd /d %PROJECT% && node dist/index.cjs"

:: 4. Start Cloudflare Tunnel
echo [4/4] Starting Cloudflare Tunnel...
docker inspect %TUNNEL_NAME% >nul 2>&1
if not errorlevel 1 (
    docker start %TUNNEL_NAME% >nul 2>&1
) else (
    docker run -d --name %TUNNEL_NAME% --network host %TUNNEL_IMAGE% tunnel --no-autoupdate run --token eyJhIj...aiJ9
)

echo.
echo ==========================================
echo SERVICES LAUNCHED
echo ==========================================
echo.
echo Supabase Studio : http://127.0.0.1:54323
echo Local App       : http://localhost:5000
echo Cloudflare Tunnel: configured
echo.
pause >nul
