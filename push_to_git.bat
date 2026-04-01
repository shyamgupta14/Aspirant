@echo off
echo 🌌 Elite Lab: Synchronizing Signal to GitHub...
cd /d %~dp0
git init
git add .
git commit -m "🌌 Elite Lab v1.0: Full Modern UI + God Mode Admin Control + Deployment Ready"
git remote add origin https://github.com/shyamgupta14/Aspirant.git
git branch -M main
git push -u origin main
echo.
echo ✅ MISSION ACCOMPLISHED: Signal Broadcasted to GitHub!
pause
