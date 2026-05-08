#!/bin/bash
# =============================================================
#  run_desktop.sh — Run CommQuality Analyzer as a desktop app
#  Works on Ubuntu / Debian Linux
#
#  Prerequisites (one-time setup):
#    pip install -r requirements_desktop.txt
#    sudo apt install python3-gi python3-gi-cairo gir1.2-webkit2-4.0
#    cd frontend && npm install && npm run build && cd ..
#    python manage.py migrate
# =============================================================

echo "[CommQuality] Starting desktop app..."
python3 launcher.py
if [ $? -ne 0 ]; then
  echo ""
  echo "[ERROR] App failed to start. Check commquality.log for details."
  read -p "Press Enter to exit..."
fi
