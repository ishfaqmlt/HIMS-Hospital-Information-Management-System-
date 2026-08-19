@echo off
title HIMS Analyzer Bridge Live Logs
color 0B
cd /d "%~dp0"
echo ===================================================================
echo 📡 HIMS ANALYZER BRIDGE LIVE LOGS STREAM
echo (Press Ctrl + C to exit logs window anytime)
echo ===================================================================
echo.
call npx pm2 logs HIMS-Analyzer-Bridge
