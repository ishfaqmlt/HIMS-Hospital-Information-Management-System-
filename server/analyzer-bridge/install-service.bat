@echo off
title HIMS Analyzer Bridge Installer
color 0A
echo ===================================================================
echo 🚀 HIMS LABORATORY ANALYZER BRIDGE AUTOMATED INSTALLER
echo ===================================================================
echo.

:: Ensure script runs with Administrator privileges
cd /d "%~dp0"

echo 📦 1/4 Installing Node.js dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error installing npm dependencies.
    pause
    exit /b %ERRORLEVEL%
)
echo.

echo ⚙️ 2/4 Checking configuration (.env)...
if not exist .env (
    copy .env.example .env
    echo ⚠️ Created .env file. Please edit HIMS_API_URL to point to your server IP!
) else (
    echo ✅ .env file exists.
)
echo.

echo 🌐 3/4 Installing PM2 Process Manager globally...
call npm install -g pm2 pm2-windows-service
echo.

echo 🛡️ 4/4 Registering 24/7 Windows Service...
call pm2 start bridge.js --name "HIMS-Analyzer-Bridge"
call pm2 save

echo.
echo ===================================================================
echo ✅ INSTALLATION COMPLETE!
echo HIMS Analyzer Bridge is now running silently in the background 24/7.
echo ===================================================================
pause
