@echo off
title Start HIMS Analyzer Bridge Service
color 0A
cd /d "%~dp0"
echo ===================================================================
echo ▶️ STARTING HIMS LABORATORY ANALYZER BRIDGE SERVICE
echo ===================================================================
echo.
call npx pm2 start HIMS-Analyzer-Bridge
echo.
echo ===================================================================
echo 🟢 Connection Started Successfully!
echo ===================================================================
pause
