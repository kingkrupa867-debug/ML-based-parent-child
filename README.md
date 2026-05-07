# Parent-Child Communication Quality Analyzer

A full-stack Django web application that uses Machine Learning (Gradient Boosting) to analyze and classify parent-child communication quality as **Strong**, **Moderate**, or **Weak**, with actionable recommendations.

---

## 🚀 Quick Start Guide

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.10+ |
| MySQL | 8.0+ (or XAMPP) |
| pip | Latest |

---

### Step 1 — Clone / Navigate to the project

```bash
cd krupa
```

### Step 2 — Create and activate the virtual environment

```bash
# Windows
py -m venv venv
venv\Scripts\activate
```

### Step 3 — Install dependencies

```bash
pip install -r requirements.txt
pip install mysqlclient
```

### Step 4 — Set up MySQL

Start your MySQL server (via XAMPP, MySQL Workbench, or the MySQL service).

Then create the database:

```sql
CREATE DATABASE communication_analyzer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 5 — Configure environment

Edit `.env` in the project root:

```env
SECRET_KEY=django-insecure-change-me-in-production-abc123xyz
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=communication_analyzer
DB_USER=root
DB_PASSWORD=          # your MySQL root password (leave blank if none)
DB_HOST=localhost
DB_PORT=3306
```

### Step 6 — Train the ML model

```bash
python ml_engine/train_model.py
```

Expected output:
```
Test Accuracy: 1.0000
Model saved to: ml_engine/model.pkl
```

### Step 7 — Run database migrations

```bash
python manage.py makemigrations accounts questionnaire
python manage.py migrate
```

### Step 8 — Create admin superuser (optional)

```bash
python manage.py createsuperuser
```

### Step 9 — Start the development server

```bash
python manage.py runserver
```

Open **http://127.0.0.1:8000** in your browser.

---

## 📁 Project Structure

```
parent-child-main/
├── manage.py
├── requirements.txt
├── .env                         ← DB & secret key config
├── communication_analyzer/      ← Django project settings
│   ├── settings.py
│   └── urls.py
├── accounts/                    ← Auth (register, login, logout)
│   ├── models.py               (CustomUser with role)
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── questionnaire/               ← Core feature app
│   ├── models.py               (QuestionnaireResponse, PredictionResult, Recommendation)
│   ├── views.py                (submit, predict, history, recommendations)
│   ├── serializers.py
│   └── urls.py
├── ml_engine/                   ← Machine Learning
│   ├── train_model.py          (GradientBoostingClassifier training)
│   ├── predict.py              (inference function)
│   └── *.pkl                   (trained model artifacts)
├── templates/                   ← Django HTML templates (legacy)
├── frontend/                    ← React.js Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        (Landing, Login, Register, Dashboard, Questionnaire, Results, History)
│   │   ├── services/           (API services)
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
```

---

## 🌐 Pages & API Endpoints

### Web Pages

| URL | Description |
|-----|-------------|
| `/login/` | Login page |
| `/register/` | Registration with role (Parent/Child) |
| `/questionnaire/` | 10-question Likert questionnaire |
| `/results/<id>/` | Results dashboard with score & recommendations |
| `/history/` | History with trend chart |

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register/` | Register a new user |
| POST | `/api/login/` | Login (session auth) |
| POST | `/api/logout/` | Logout |
| POST | `/api/submit-questionnaire/` | Submit answers → returns prediction |
| GET | `/api/predict/` | Latest prediction result |
| GET | `/api/results-history/` | All past results |
| GET | `/api/recommendations/` | Latest recommendations |

---

## 🤖 ML Model Details

- **Algorithm**: Gradient Boosting Classifier (`sklearn.ensemble.GradientBoostingClassifier`)
- **Features**: 10 Likert-scale responses (1–5)
- **Classes**: Weak (0), Moderate (1), Strong (2)
- **Score range**: 1.0–3.0 (probability-weighted)
- **Test Accuracy**: 100% on the current held-out test split
- **Training data**: 10,000 cleaned rows from `Parent_Child_Communication_Dataset_10000.xlsx`

### Classification

| Score Range | Category |
|-------------|----------|
| 1.0 – 1.67 | Weak |
| 1.67 – 2.33 | Moderate |
| 2.33 – 3.0 | Strong |

---

## 🔐 Security Features

- CSRF protection on all forms
- Password hashing (Django PBKDF2)
- Session-based authentication
- Input validation via DRF serializers
- ORM-only queries (no raw SQL)
- `SESSION_COOKIE_HTTPONLY = True`

---

## 🗄️ Database Schema

```
CustomUser          → id, username, email, password_hash, role, date_joined
QuestionnaireResponse → id, user_id, pq1..pq10, cq1..cq10, parent_age, child_age, family_type, submitted_at
PredictionResult    → id, response_id, score, category, predicted_at
Recommendation      → id, result_id, text
```

---

## 🖥️ Running the Full Application

### Option 1: Separate Servers (Development)

**Terminal 1 - Backend:**
```bash
cd parent-child-main
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd parent-child-main/frontend
npm install
npm start
```

Access the React app at `http://localhost:3000`

### Option 2: Django Serves React (Production)

```bash
# Build React app
cd frontend
npm run build

# Collect static files
cd ../parent-child-main
python manage.py collectstatic

# Runserver - React served at /
python manage.py runserver
```

---

## 📱 React Frontend Components

| Component | File | Description |
|-----------|------|-------------|
| Landing | `frontend/src/components/Landing.js` | Role selection page |
| Login | `frontend/src/components/Login.js` | User login |
| Register | `frontend/src/components/Register.js` | User registration |
| Dashboard | `frontend/src/components/Dashboard.js` | User dashboard with stats |
| Questionnaire | `frontend/src/components/Questionnaire.js` | Questionnaire form |
| Results | `frontend/src/components/Results.js` | Results with charts |
| History | `frontend/src/components/History.js` | Progress history |

---

## 🔧 Frontend Configuration

The frontend is configured to proxy API requests to the Django backend:

```json
// frontend/package.json
{
  "proxy": "http://localhost:8000"
}
```

API base URL: `http://localhost:8000`
```

---

## ☁️ Deployment on Render

For detailed step-by-step deployment instructions, see [DEPLOYMENT_RENDER.md](DEPLOYMENT_RENDER.md)

### Quick Summary

1. Push code to GitHub
2. Create two services on Render:
   - **Backend**: Python with `build.sh` and `gunicorn communication_analyzer.wsgi:application`
   - **Frontend**: Static Site with `npm run build` in the `frontend` directory
3. Set environment variables:
   - Backend: `DEBUG`, `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`
   - Frontend: `REACT_APP_API_URL`
4. Add PostgreSQL database (optional for production)
5. Test the deployed application

### Environment Variables (Render)

**Backend:**
```
DEBUG=false
SECRET_KEY=<generate-strong-key>
ALLOWED_HOSTS=*.render.com,yourdomain.com
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
```

**Frontend:**
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## 🧪 Running Tests

```bash
# Check Django setup
python manage.py check

# Quick prediction test
python -c "from ml_engine.predict import run_prediction; print(run_prediction([4,5,4,3,5,4,5,4,3,4]))"
```
