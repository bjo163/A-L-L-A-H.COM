@echo off
REM Runner for the hourly plan-audit automation.
REM Resolves repo root from this script's location, then runs the Node audit.
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "REPO_ROOT=%%~fI"
REM Operator chose to ENFORCE git hooks for the automated plan-cleanup commits.
REM Set to 0 (or delete this line) to skip the heavy source gates instead.
set "PLAN_AUDIT_ENFORCE_HOOKS=1"
set "NODE=%NODE_EXE%"
if "%NODE%"=="" set "NODE=node"
"%NODE%" "%REPO_ROOT%\scripts\plan-audit.mjs" %*
set "RC=%ERRORLEVEL%"
endlocal & exit /b %RC%

