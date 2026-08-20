@echo off
title Build Standalone HIMS Analyzer Bridge EXE
color 0A
cd /d "%~dp0"
echo ===================================================================
echo 🛠️ BUILDING STANDALONE WINDOWS EXE FOR CLIENT DEPLOYMENT
echo ===================================================================
echo.
call npx caxa --input . --exclude node_modules --output HIMS-Analyzer-Bridge.exe -- "{{caxa}}/node_modules/.bin/node" "{{caxa}}/bridge.js"
echo.
echo ===================================================================
echo ✅ BUILD SUCCESSFUL! Created standalone application:
echo 📦 HIMS-Analyzer-Bridge.exe
echo ===================================================================
pause
