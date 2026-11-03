@echo off
title Publish SAMA projects
cd /d "%~dp0"
node tools\publish.mjs
echo.
pause
