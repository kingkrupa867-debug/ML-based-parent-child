@echo off
REM ============================================================
REM  build_desktop.bat — Build CommQuality Analyzer as a Windows .exe
REM  Run this script from inside the ML-based-parent-child folder.
REM  Prerequisites: Python 3.10+, Node 18+, pip, npm
REM ============================================================

echo.
echo =========================================================
echo  STEP 1 — Install Python desktop dependencies
echo =========================================================
pip install -r requirements_desktop.txt
IF ERRORLEVEL 1 (echo [ERROR] pip install failed & pause & exit /b 1)

echo.
echo =========================================================
echo  STEP 2 — Run Django migrations (create/update db.sqlite3)
echo =========================================================
python manage.py migrate --run-syncdb
IF ERRORLEVEL 1 (echo [ERROR] Django migrations failed & pause & exit /b 1)

echo.
echo =========================================================
echo  STEP 3 — Collect Django static files
echo =========================================================
python manage.py collectstatic --noinput
IF ERRORLEVEL 1 (echo [ERROR] collectstatic failed & pause & exit /b 1)

echo.
echo =========================================================
echo  STEP 4 — Build React frontend (npm run build)
echo =========================================================
cd frontend
call npm install
IF ERRORLEVEL 1 (echo [ERROR] npm install failed & pause & cd .. & exit /b 1)
call npm run build
IF ERRORLEVEL 1 (echo [ERROR] npm build failed & pause & cd .. & exit /b 1)
cd ..

echo.
echo =========================================================
echo  STEP 5 — Package with PyInstaller into a single .exe
echo =========================================================
pyinstaller ^
  --name "CommQuality" ^
  --windowed ^
  --onedir ^
  --add-data "ml_engine;ml_engine" ^
  --add-data "accounts;accounts" ^
  --add-data "questionnaire;questionnaire" ^
  --add-data "communication_analyzer;communication_analyzer" ^
  --add-data "templates;templates" ^
  --add-data "static;static" ^
  --add-data "frontend\build;frontend\build" ^
  --add-data "db.sqlite3;." ^
  --add-data "manage.py;." ^
  --add-data ".env;." ^
  --hidden-import "sklearn" ^
  --hidden-import "sklearn.ensemble" ^
  --hidden-import "sklearn.ensemble._gradient_boosting" ^
  --hidden-import "sklearn.ensemble._forest" ^
  --hidden-import "sklearn.tree" ^
  --hidden-import "sklearn.tree._classes" ^
  --hidden-import "sklearn.utils._weight_vector" ^
  --hidden-import "sklearn.neighbors._partition_nodes" ^
  --hidden-import "sklearn.preprocessing" ^
  --hidden-import "sklearn.preprocessing._label" ^
  --hidden-import "joblib" ^
  --hidden-import "django" ^
  --hidden-import "django.template.defaulttags" ^
  --hidden-import "django.template.defaultfilters" ^
  --hidden-import "django.template.loader_tags" ^
  --hidden-import "rest_framework" ^
  --hidden-import "corsheaders" ^
  --hidden-import "whitenoise" ^
  --hidden-import "dj_database_url" ^
  --hidden-import "communication_analyzer" ^
  --hidden-import "communication_analyzer.settings" ^
  --hidden-import "communication_analyzer.urls" ^
  --hidden-import "communication_analyzer.wsgi" ^
  --hidden-import "communication_analyzer.authentication" ^
  --hidden-import "accounts" ^
  --hidden-import "accounts.models" ^
  --hidden-import "accounts.admin" ^
  --hidden-import "accounts.apps" ^
  --hidden-import "accounts.views" ^
  --hidden-import "accounts.serializers" ^
  --hidden-import "accounts.urls" ^
  --hidden-import "questionnaire" ^
  --hidden-import "questionnaire.models" ^
  --hidden-import "questionnaire.admin" ^
  --hidden-import "questionnaire.apps" ^
  --hidden-import "questionnaire.views" ^
  --hidden-import "questionnaire.serializers" ^
  --hidden-import "questionnaire.urls" ^
  --hidden-import "wsgiref" ^
  --hidden-import "wsgiref.simple_server" ^
  --hidden-import "wsgiref.handlers" ^
  --collect-all "webview" ^
  --collect-all "sklearn" ^
  --collect-all "django" ^
  --collect-all "whitenoise" ^
  --collect-all "corsheaders" ^
  --collect-all "rest_framework" ^
  launcher.py

IF ERRORLEVEL 1 (
  echo [ERROR] PyInstaller failed — see above for details.
  pause
  exit /b 1
)

echo.
echo =========================================================
echo  BUILD COMPLETE!
echo  Your app is in:  dist\CommQuality\CommQuality.exe
echo  Zip the entire  dist\CommQuality\  folder and share it.
echo =========================================================
pause
