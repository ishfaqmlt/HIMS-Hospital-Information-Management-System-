@echo off
title Stop HIMS Analyzer Bridge Service
color 0C
cd /d "%~dp0"
echo ===================================================================
echo ⏹️ STOPPING HIMS LABORATORY ANALYZER BRIDGE SERVICE
echo ===================================================================
echo.
call npx pm2 stop HIMS-Analyzer-Bridge
echo.
echo ===================================================================
echo 🔴 Connection Stopped Successfully!
echo ===================================================================
pause
