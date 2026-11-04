# Register an hourly Windows Scheduled Task that runs scripts/plan-audit.mjs.
# Reversible: remove later with  Unregister-ScheduledTask -TaskName $Name -Confirm:$false
param(
    [string]$TaskName = "AllA-PlanAudit",
    [int]$IntervalHours = 1,
    [int]$FirstRunDelayMinutes = 5
)

$ErrorActionPreference = "Stop"
$repo = Split-Path $PSScriptRoot -Parent
$cmd  = Join-Path $repo "scripts\plan-audit.cmd"

if (-not (Test-Path $cmd)) { throw "Runner not found: $cmd" }

# The .cmd wrapper resolves node, sets PLAN_AUDIT_ENFORCE_HOOKS, and runs the audit.
$action  = New-ScheduledTaskAction -Execute $cmd -WorkingDirectory $repo
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes($FirstRunDelayMinutes) `
    -RepetitionInterval (New-TimeSpan -Hours $IntervalHours) `
    -RepetitionDuration (New-TimeSpan -Days 999)

$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable `
    -MultipleInstances IgnoreNew -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
    -Settings $settings -Force | Out-Null

Write-Host "Registered '$TaskName' to run every $IntervalHours hour(s)."
Write-Host "  runner : $cmd (sets PLAN_AUDIT_ENFORCE_HOOKS=1)"
Write-Host "Remove with: Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false"
Write-Host "NOTE: interactive-user task; runs only while you are signed in."
