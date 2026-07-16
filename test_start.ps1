$node = 'C:\Users\Slaff\AppData\Local\hermes\node\node.exe'
$script = 'C:\Users\Slaff\Documents\trosheencrafts-main\dist\index.cjs'
$log = 'C:\Users\Slaff\Documents\trosheencrafts-main\logs\server.log'
$tmp = 'C:\Users\Slaff\Documents\trosheencrafts-main\logs\server_start.log'
Start-Process -FilePath $node -ArgumentList $script -NoNewWindow -RedirectStandardOutput $log -RedirectStandardError $tmp
Start-Sleep -Seconds 6
'--- STDOUT ---'
Get-Content $log -ErrorAction SilentlyContinue | Select-Object -First 80
'--- STDERR ---'
Get-Content $tmp -ErrorAction SilentlyContinue | Select-Object -First 80
