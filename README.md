# TaskFlow — Team Task Manager

Full-stack task management app with role-based access control (Admin/Member).

## Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI + SQLAlchemy + SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (PyJWT) + bcrypt |
| Frontend | React 18 + Vite + Tailwind CSS |
| Deployment | Railway |

---

## Features

- **Auth** — Signup / Login with JWT, roles: `admin` / `member`
- **Projects** — Create, edit, delete projects (admin); view assigned (member)
- **Tasks** — Full CRUD with status (`todo` / `in_progress` / `done`), priority, due date, assignee
- **Dashboard** — Stats: total tasks, by status, overdue count
- **RBAC** — Admins manage everything; members can only update status on their assigned tasks
- **Overdue detection** — Tasks past due date (not done) flagged in UI

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
# Set backend URL in .env:
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
# App runs at http://localhost:5173
```

---

## Railway Deployment

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "init: taskflow"
gh repo create taskflow --public --push
```

### Step 2 — Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → choose the `backend/` directory as root (or use monorepo service config)
3. Add environment variables:
   ```
   SECRET_KEY=<your-random-secret>
   DATABASE_URL=<your-postgres-url>   # Railway can provision Postgres for you
   ```
4. Railway auto-detects `railway.toml` and runs `uvicorn`
5. Copy the generated backend URL (e.g. `https://taskflow-backend.up.railway.app`)

### Step 3 — Deploy Frontend on Railway
1. New Service → same repo → `frontend/` directory
2. Add environment variable:
   ```
   VITE_API_URL=https://taskflow-backend.up.railway.app
   ```
3. Deploy — Railway runs `npm run build` then serves via `serve`

### Step 4 — Database (PostgreSQL)
- In Railway dashboard: Add Plugin → PostgreSQL
- Railway auto-injects `DATABASE_URL` into the backend service
- Tables are auto-created on first startup via SQLAlchemy `create_all`

---

## API Endpoints

```
POST   /auth/signup          Create account
POST   /auth/login           Login → JWT
GET    /auth/me              Current user

GET    /projects             List projects (filtered by role)
POST   /projects             Create project [admin]
GET    /projects/:id         Get project details
PUT    /projects/:id         Update project [admin]
DELETE /projects/:id         Delete project [admin]

POST   /projects/:id/members Add member [admin]
DELETE /projects/:id/members/:uid Remove member [admin]

GET    /projects/:id/tasks   List tasks
POST   /projects/:id/tasks   Create task [admin]
PUT    /tasks/:id            Update task (admin: full; member: status only on own tasks)
DELETE /tasks/:id            Delete task [admin]

GET    /users                List all users [admin]
GET    /dashboard            Stats for current user
```

---

## RBAC Summary

| Action | Admin | Member |
|--------|-------|--------|
| Create/edit/delete projects | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Update any task field | ✅ | ❌ |
| Update status on own tasks | ✅ | ✅ |
| View assigned projects/tasks | ✅ | ✅ |
| View all users | ✅ | ❌ |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── main.py          # FastAPI app + routes
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── crud.py          # DB operations
│   ├── auth.py          # JWT + bcrypt
│   ├── database.py      # Engine + session
│   ├── requirements.txt
│   └── railway.toml
├── frontend/
│   ├── src/
│   │   ├── pages/       # Login, Signup, Dashboard, Projects, ProjectDetail, Users
│   │   ├── components/  # Layout
│   │   ├── context/     # AuthContext (JWT, axios defaults)
│   │   └── App.jsx      # Router
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── railway.toml
└── README.md
```
