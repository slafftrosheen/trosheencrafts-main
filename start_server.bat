@echo off
setlocal enabledelayedexpansion

set "PROJECT=C:\Users\Slaff\Documents\trosheencrafts-main"
set "NODE_EXE=C:\Users\Slaff\AppData\Local\hermes\node\node.exe"
set "SERVER_EXE=%PROJECT%\dist\index.cjs"
set "BOOT_LOG=%PROJECT%\logs\boot.log"
set "SERVER_LOG=%PROJECT%\logs\server.log"

echo [start_server] Launching app from %PROJECT% >> "%BOOT_LOG%"

if not exist "%SERVER_EXE%" (
    echo [start_server] Missing %SERVER_EXE% >> "%BOOT_LOG%"
    pause
    exit /b 1
)

cd /d "%PROJECT%"
set NODE_ENV=production
start "" "C:\Users\Slaff\AppData\Local\hermes\node\node.exe" "%PROJECT%\dist\index.cjs" >> "%SERVER_LOG%" 2>&1
