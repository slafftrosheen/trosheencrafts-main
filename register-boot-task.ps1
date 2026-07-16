$ErrorActionPreference = 'Stop'
$action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c start "" "C:\Users\Slaff\Documents\trosheencrafts-main\start_trosheencrafts.bat"'
$trigger = New-ScheduledTaskTrigger -AtLogOn -User 'Slaff'
$trigger.Delay = 'PT2M'
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName 'TrosheenCraftsBoot' -Action $action -Trigger $trigger -Settings $settings -User 'Slaff' -RunLevel Highest -Force
