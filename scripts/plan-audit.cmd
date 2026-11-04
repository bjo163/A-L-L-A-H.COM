@echo off
REM Runner for the hourly plan-audit automation.
REM Resolves repo root from this script's location, then runs the Node audit.
setlocal
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "REPO_ROOT=%%~fI"
REM Docs-only cleanup commit: skip the heavy source gates by default.
REM Set PLAN_AUDIT_SKIP_HOOKS=0 to force full pre-commit/pre-push gates.
set "PLAN_AUDIT_SKIP_HOOKS=1"
set "NODE=%NODE_EXE%"
if "%NODE%"=="" set "NODE=node"
"%NODE%" "%REPO_ROOT%\scripts\plan-audit.mjs" %*
set "RC=%ERRORLEVEL%"
endlocal & exit /b %RC%

