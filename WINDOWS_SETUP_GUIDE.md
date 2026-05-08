# 🖥️ CommQuality Analyzer — Windows Setup Guide

## Complete Step-by-Step Guide to Run on Windows Laptop

---

## 📋 STEP 0 — What You Need to Install First

You need **3 software** installed on your Windows laptop. Download and install them one by one:

### ✅ 1. Install Python (3.10 or higher)

1. Go to → **https://www.python.org/downloads/**
2. Click the big yellow button **"Download Python 3.x.x"**
3. **Run the downloaded `.exe` file**
4. ⚠️ **VERY IMPORTANT:** On the first screen, check the box that says:
   ```
   ☑ Add Python to PATH
   ```
5. Click **"Install Now"**
6. Wait for installation to complete → Click **"Close"**

**To verify:** Open Command Prompt and type:
```cmd
python --version
```
You should see something like `Python 3.12.x`

---

### ✅ 2. Install Node.js (18 or higher)

1. Go to → **https://nodejs.org/**
2. Click **"LTS"** (the recommended version)
3. **Run the downloaded `.msi` file**
4. Click **Next → Next → Next → Install**
5. Wait for installation → Click **"Finish"**

**To verify:** Open Command Prompt and type:
```cmd
node --version
npm --version
```
You should see version numbers like `v20.x.x` and `10.x.x`

---

### ✅ 3. Install Git

1. Go to → **https://git-scm.com/downloads**
2. Click **"Windows"** → Download the installer
3. **Run the downloaded `.exe` file**
4. Click **Next** for all options (keep defaults)
5. Click **Install** → **Finish**

**To verify:** Open Command Prompt and type:
```cmd
git --version
```
You should see something like `git version 2.x.x`

---

## 🚀 STEP 1 — Download the Project

Open **Command Prompt** (press `Win + R`, type `cmd`, press Enter) and run:

```cmd
cd Desktop
git clone https://github.com/kingkrupa867-debug/ML-based-parent-child.git
cd ML-based-parent-child
```

> **If you already have the folder:** Just open Command Prompt, navigate to it, and pull:
> ```cmd
> cd Desktop\ML-based-parent-child
> git pull origin main
> ```

---

## 🔧 STEP 2 — Create the `.env` File

1. Open **Notepad**
2. Copy-paste this text:

```
SECRET_KEY=django-insecure-dev-key-for-local-testing-only-12345
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

3. Click **File → Save As**
4. Navigate to the `ML-based-parent-child` folder on your Desktop
5. In **"File name"** type: `.env`  (with the dot!)
6. In **"Save as type"** select: **All Files (*.*)**
7. Click **Save**

> ⚠️ Make sure the file is named `.env` not `.env.txt`. If Windows adds `.txt`, rename it.

---

## 🐍 STEP 3 — Create Python Virtual Environment

In Command Prompt (make sure you're in the project folder):

```cmd
cd Desktop\ML-based-parent-child
python -m venv venv
```

Wait a few seconds. Then **activate** the virtual environment:

```cmd
venv\Scripts\activate
```

You should see `(venv)` at the beginning of your command line:
```
(venv) C:\Users\YourName\Desktop\ML-based-parent-child>
```

---

## 📦 STEP 4 — Install Python Dependencies

With the virtual environment active (you see `(venv)`), run:

```cmd
pip install -r requirements_desktop.txt
```

⏳ This will take 2-5 minutes. Wait until it finishes.

> If you see errors about `psycopg2-binary`, that's OK — it's optional (for PostgreSQL).

---

## 🗄️ STEP 5 — Set Up the Database

```cmd
python manage.py migrate
```

This creates the `db.sqlite3` database file. You should see output like:
```
Operations to perform:
  Apply all migrations...
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
```

---

## ⚛️ STEP 6 — Build the React Frontend

```cmd
cd frontend
npm install
```

⏳ This will take 3-5 minutes (downloads all JavaScript packages).

Then build the production version:

```cmd
npm run build
```

⏳ This takes 1-2 minutes. Wait for:
```
The build folder is ready to be deployed.
```

Go back to the main folder:

```cmd
cd ..
```

---

## 🎉 STEP 7 — Run the App!

```cmd
run_desktop.bat
```

**OR** if that doesn't work:
```cmd
python launcher.py
```

### ✅ What You Should See:
1. A **splash screen** with college details and team members
2. Click **"Get Started"**
3. The **CommQuality Analyzer** landing page opens!

---

## 🔁 Running the App Next Time

After the first setup, you only need to do this:

1. Open **Command Prompt**
2. Run:
```cmd
cd Desktop\ML-based-parent-child
venv\Scripts\activate
run_desktop.bat
```

Or just **double-click** `run_desktop.bat` in the folder!

---

## 🏗️ Building a Standalone .EXE (Optional)

If you want to create a portable `.exe` that works without Python:

```cmd
cd Desktop\ML-based-parent-child
venv\Scripts\activate
build_desktop.bat
```

⏳ This takes 5-10 minutes. The output will be in:
```
dist\CommQuality\CommQuality.exe
```

**To share:** Zip the entire `dist\CommQuality\` folder.

---

## ❓ Troubleshooting

### "python is not recognized"
→ Python wasn't added to PATH. Reinstall Python and check **"Add Python to PATH"**.

### "npm is not recognized"
→ Node.js isn't installed. Download from https://nodejs.org/ and install.

### "No module named 'django'"
→ Virtual environment not activated. Run:
```cmd
venv\Scripts\activate
```

### White screen after splash
→ Frontend not built. Run:
```cmd
cd frontend
npm run build
cd ..
```

### "Port 8000 already in use"
→ Another app is using port 8000. Kill it:
```cmd
netstat -ano | findstr :8000
taskkill /PID <number_from_above> /F
```

### ".env file not found" error
→ Make sure the `.env` file exists in the main project folder (see Step 2).

---

## 📁 Quick Reference — All Commands Together

```cmd
:: ONE-TIME SETUP (first time only)
cd Desktop
git clone https://github.com/kingkrupa867-debug/ML-based-parent-child.git
cd ML-based-parent-child

:: Create .env file (see Step 2)

python -m venv venv
venv\Scripts\activate
pip install -r requirements_desktop.txt
python manage.py migrate

cd frontend
npm install
npm run build
cd ..

:: RUN THE APP
run_desktop.bat
```

---

**Made with ❤️ by Team CommQuality — GVP College, Visakhapatnam**
