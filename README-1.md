# TaskFlow — Team Task Manager

Full-stack task management app with role-based access control (Admin/Member).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI + SQLAlchemy + SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT + bcrypt |
| Frontend | React 18 + Vite + Tailwind CSS |
| Deployment | Railway |

---

## Repo Structure

All files are in the root of the repo:

```
Anuj09x/
├── main.py              # FastAPI app + all routes
├── models.py            # Database models
├── schemas.py           # Pydantic schemas
├── crud.py              # DB operations
├── auth.py              # JWT + bcrypt
├── database.py          # DB connection
├── requirements.txt     # Python dependencies
├── Procfile             # Railway backend start command
├── railway.toml         # Railway config
│
├── App.jsx              # React router
├── main.jsx             # React entry point
├── AuthContext.jsx      # Auth state + axios setup
├── Dashboard.jsx        # Dashboard page
├── Login.jsx            # Login page
├── Signup.jsx           # Signup page
├── Projects.jsx         # Projects list page
├── ProjectDetail.jsx    # Project + tasks page
├── Users.jsx            # Users page (admin only)
├── Layout.jsx           # Sidebar layout
│
├── index.html           # HTML entry
├── index.css            # Global styles
├── package.json         # Node dependencies
├── vite.config.js       # Vite config
├── tailwind.config.js   # Tailwind config
├── postcss.config.js    # PostCSS config
├── serve.json           # SPA routing fix for serve
└── README.md
```

---

## ⚠️ Important Note

Your files are all in the root. Railway needs to know which files are backend and which are frontend. You have **two options**:

### Option A — Deploy as Two Separate Railway Services (Recommended)

You'll need to reorganize into folders. In your terminal:

```bash
# Clone your repo
git clone https://github.com/Anuj09x/taskflow.git
cd taskflow

# Create folder structure
mkdir -p backend frontend/src/pages frontend/src/components frontend/src/context

# Move backend files
mv main.py models.py schemas.py crud.py auth.py database.py requirements.txt Procfile railway.toml backend/

# Move frontend files
mv App.jsx main.jsx index.html index.css package.json vite.config.js tailwind.config.js postcss.config.js serve.json frontend/
mv AuthContext.jsx frontend/src/context/
mv Dashboard.jsx Login.jsx Signup.jsx Projects.jsx ProjectDetail.jsx Users.jsx frontend/src/pages/
mv Layout.jsx frontend/src/components/

# Commit the reorganized structure
git add .
git commit -m "fix: reorganize into backend/ and frontend/ folders"
git push
```

Then deploy on Railway as shown in the Deploy section below.

---

### Option B — Run Locally As Is (Quick Test)

If you just want to test locally without reorganizing:

#### Step 1 — Run the Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the backend
uvicorn main:app --reload
# Runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

#### Step 2 — Run the Frontend

Since your JSX files are in the root, you need a proper Vite project structure. The easiest fix:

```bash
# Install frontend dependencies
npm install

# Start the frontend
npm run dev
# Runs at http://localhost:5173
```

> **Note:** For `npm run dev` to work, Vite needs `index.html` in the root (which you have) and `main.jsx` also in root. Your current flat structure should work for local dev.

---

## Deploy on Railway (After Reorganizing)

### Step 1 — Backend Service

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo
3. Set **Root Directory** → `backend`
4. Add environment variables:
   ```
   SECRET_KEY=any-long-random-string-here
   ALLOWED_ORIGINS=https://your-frontend.up.railway.app
   ```
5. Add **PostgreSQL** plugin → Railway auto-injects `DATABASE_URL`
6. Deploy → copy the generated URL e.g. `https://taskflow-backend.up.railway.app`

### Step 2 — Frontend Service

1. New Service → same GitHub repo
2. Set **Root Directory** → `frontend`
3. Add environment variable:
   ```
   VITE_API_URL=https://taskflow-backend.up.railway.app
   ```
4. Deploy → your app is live

---

## API Endpoints

```
POST   /auth/signup
POST   /auth/login
GET    /auth/me

GET    /projects
POST   /projects          [admin only]
GET    /projects/:id
PUT    /projects/:id       [admin only]
DELETE /projects/:id       [admin only]

POST   /projects/:id/members       [admin only]
DELETE /projects/:id/members/:uid  [admin only]

GET    /projects/:id/tasks
POST   /projects/:id/tasks   [admin only]
PUT    /tasks/:id
DELETE /tasks/:id            [admin only]

GET    /users        [admin only]
GET    /dashboard
```

---

## Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create / delete projects | ✅ | ❌ |
| Add / remove members | ✅ | ❌ |
| Create / delete tasks | ✅ | ❌ |
| Update task status (own tasks) | ✅ | ✅ |
| View assigned projects | ✅ | ✅ |
| View all users | ✅ | ❌ |

---

## First Time Setup

1. Sign up at `/signup` — select **admin** role for the first account
2. Create a project
3. Add members to the project
4. Create tasks and assign them
5. Members can log in and update status on their tasks
