@echo off
REM Runner for the hourly plan-execution selector (companion to plan-audit.cmd).
REM Resolves repo root from this script's location, then runs the Node selector.
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "REPO_ROOT=%%~fI"
set "NODE=%NODE_EXE%"
if "%NODE%"=="" set "NODE=node"
"%NODE%" "%REPO_ROOT%\scripts\plan-next.mjs" %*
set "RC=%ERRORLEVEL%"
endlocal & exit /b %RC%
