@echo off
setlocal EnableExtensions
chcp 65001 >nul
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

rem Make the project-local pnpm shim available to Electron Forge and child processes.
if exist "%PROJECT_ROOT%.tools\pnpm.cmd" set "PATH=%PROJECT_ROOT%.tools;%PATH%"

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js was not found. Please install Node.js 22.12 or later.
    pause
    exit /b 1
)

set "PNPM_COMMAND=pnpm.cmd"
set "DESKTOP_COMMAND=desktop:dev"
where pnpm.cmd >nul 2>&1
if errorlevel 1 (
    where corepack.cmd >nul 2>&1
    if errorlevel 1 (
        echo pnpm was not found. Please install pnpm or enable Corepack.
        pause
        exit /b 1
    )
    rem Use Corepack directly because the desktop:dev script invokes pnpm again.
    set "PNPM_COMMAND=corepack.cmd pnpm"
    set "DESKTOP_COMMAND=--filter @open-mindmap/desktop start"
)

if not exist "%PROJECT_ROOT%node_modules" (
    echo Dependencies are not installed. Run: %PNPM_COMMAND% install
    pause
    exit /b 1
)

echo Starting Electron desktop app...
call %PNPM_COMMAND% %DESKTOP_COMMAND% %*
set "STATUS=%ERRORLEVEL%"

echo.
if "%STATUS%"=="0" (
    echo Electron desktop app exited normally.
) else (
    echo Electron desktop app exited with code %STATUS%.
)
pause
exit /b %STATUS%
