$node = 'C:\Users\Slaff\AppData\Local\hermes\node\node.exe'
$script = 'C:\Users\Slaff\Documents\trosheencrafts-main\dist\index.cjs'
$logOut = 'C:\Users\Slaff\Documents\trosheencrafts-main\logs\server_start_stdout.log'
$logErr = 'C:\Users\Slaff\Documents\trosheencrafts-main\logs\server_start_stderr.log'
$csv = 'C:\Users\Slaff\Documents\trosheencrafts-main\logs\server_start_csv.log'
Start-Process -FilePath $node -ArgumentList $script -NoNewWindow -RedirectStandardOutput $logOut -RedirectStandardError $logErr
Start-Sleep -Seconds 10
'--- STATUS CHECK ---'
'port:'
@(netstat -aon | Select-String ':5000' | Select-String 'LISTENING') -replace '^','  '
'http:'
try { Invoke-WebRequest -Uri 'http://localhost:5000/' -UseBasicParsing | Select-Object StatusCode } catch { '  connection_failed' }
'--- STDOUT ---'
Get-Content $logOut -ErrorAction SilentlyContinue | Select-Object -First 80
'--- STDERR ---'
Get-Content $logErr -ErrorAction SilentlyContinue | Select-Object -First 120
