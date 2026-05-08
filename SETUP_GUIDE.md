# 🖥️ CommQuality Analyzer — Setup Guide

## Prerequisites (Install these first)

| Software | Version | Download Link |
|----------|---------|---------------|
| **Python** | 3.10 or higher | https://www.python.org/downloads/ |
| **Node.js** | 18 or higher | https://nodejs.org/ |
| **Git** | Any recent | https://git-scm.com/downloads |

> **IMPORTANT (Python installation on Windows):**
> ✅ Check **"Add Python to PATH"** during installation!

---

## Step-by-Step Setup

### Step 1 — Clone the repository

If you already have the files, skip this. Otherwise:

```bash
git clone https://github.com/kingkrupa867-debug/ML-based-parent-child.git
cd ML-based-parent-child
```

If you already have the folder, just pull latest changes:

```bash
cd ML-based-parent-child
git pull origin main
```

---

### Step 2 — Create the `.env` file

Create a file named `.env` in the root folder (same level as `manage.py`) with this content:

```
SECRET_KEY=django-insecure-dev-key-for-local-testing-only-12345
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

### Step 3 — Create Python virtual environment & install dependencies

**Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate
pip install -r requirements_desktop.txt
```

**Linux/Mac (Terminal):**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements_desktop.txt
```

---

### Step 4 — Run Django migrations (create the database)

```bash
python manage.py migrate
```

---

### Step 5 — Build the React frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

> This creates the `frontend/build/` folder that Django serves.

---

### Step 6 — Run the desktop app

**Windows:**
```cmd
run_desktop.bat
```

**Linux:**
```bash
bash run_desktop.sh
```

✅ **The app should open** with the splash screen, then click "Get Started" to enter the main app!

---

## 🏗️ Building a Standalone Windows .EXE

If you want to create a portable `.exe` file that runs without Python installed:

```cmd
build_desktop.bat
```

This will:
1. Install dependencies
2. Run migrations
3. Build the React frontend
4. Package everything into `dist\CommQuality\CommQuality.exe`

**To share:** Zip the entire `dist\CommQuality\` folder and give it to anyone.

---

## 🌐 Running as a Website (Browser only)

If you just want to run it in the browser without the desktop window:

**Terminal 1 — Django backend:**
```bash
python manage.py runserver
```

**Terminal 2 — React frontend (dev mode):**
```bash
cd frontend
npm start
```

Open `http://localhost:3000` in your browser.

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| `python` not found | Use `python3` instead, or reinstall Python with "Add to PATH" checked |
| `npm` not found | Install Node.js from https://nodejs.org/ |
| White screen after splash | Make sure `frontend/build/` exists (run `npm run build` in frontend/) |
| Port 8000 already in use | Close other apps using port 8000, or kill it: `fuser -k 8000/tcp` (Linux) or `netstat -ano | findstr :8000` then `taskkill /PID <pid> /F` (Windows) |
| Missing `.env` file | Create it with the content from Step 2 above |
| `ModuleNotFoundError` | Make sure venv is activated (`venv\Scripts\activate` on Windows) |

---

## 📁 Project Structure

```
ML-based-parent-child/
├── .env                    ← Create this (Step 2)
├── manage.py               ← Django management
├── launcher.py             ← Desktop app launcher
├── run_desktop.bat         ← Windows: double-click to run
├── run_desktop.sh          ← Linux: bash run_desktop.sh
├── build_desktop.bat       ← Windows: build .exe
├── requirements_desktop.txt← Python dependencies
├── db.sqlite3              ← Database (auto-created)
├── communication_analyzer/ ← Django settings & URLs
├── accounts/               ← User auth app
├── questionnaire/          ← ML questionnaire app
├── ml_engine/              ← ML models
├── templates/splash.html   ← Desktop splash screen
├── static/img/             ← Logo images
└── frontend/               ← React app
    ├── package.json
    ├── public/
    ├── src/
    └── build/              ← Created by npm run build
```
