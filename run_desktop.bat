@echo off
REM ============================================================
REM  run_desktop.bat — Run CommQuality Analyzer as a desktop app
REM  WITHOUT building an exe (good for testing on your own PC).
REM
REM  Prerequisites (one-time setup):
REM    pip install -r requirements_desktop.txt
REM    cd frontend && npm install && npm run build && cd ..
REM    python manage.py migrate
REM ============================================================

echo [CommQuality] Starting desktop app...
python launcher.py
IF ERRORLEVEL 1 (
  echo.
  echo [ERROR] App failed to start. Check commquality.log for details.
  pause
)
