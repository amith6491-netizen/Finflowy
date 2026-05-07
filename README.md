<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=32&pause=1000&color=8B5CF6&center=true&vCenter=true&width=600&lines=FinFlowy+%F0%9F%92%B8;AI-Powered+Finance+Tracker;Microservice+Architecture;Real+ML+Models+%F0%9F%A4%96" alt="Typing SVG" />

<h3>🧠 Intelligent Personal Finance Intelligence System</h3>
<p><em>"Not just tracking money — understanding it."</em></p>

<p>
  <img src="https://img.shields.io/badge/React_18-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-Typed-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Python_FastAPI-ML_Service-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/scikit--learn-ML_Models-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" />
</p>

<p>
  <a href="#-overview"><strong>Overview</strong></a> ·
  <a href="#-key-features"><strong>Features</strong></a> ·
  <a href="#-system-architecture"><strong>Architecture</strong></a> ·
  <a href="#-ml-models"><strong>ML Models</strong></a> ·
  <a href="#-diagrams"><strong>Diagrams</strong></a> ·
  <a href="#-quick-start"><strong>Quick Start</strong></a> ·
  <a href="#-api-reference"><strong>API</strong></a>
</p>

</div>

---

## 📖 Overview

**FinFlowy** is a full-stack, AI-powered personal finance management platform built as a final year engineering project. It goes far beyond simple transaction tracking — it applies **real Machine Learning models** to your financial data to predict future expenses, detect anomalous spending, cluster your habits, and recommend intelligent budgets.

Built on a **Database-per-Service microservice architecture**, FinFlowy separates every domain (auth, transactions, goals, ML) into isolated services, making it production-ready, scalable, and maintainable.

| 🎯 Project Type | Final Year B.E. / B.Tech Project |
|---|---|
| 🏛️ Architecture | Microservices (Database-per-Service) |
| 🧠 Intelligence | 5 Real scikit-learn ML Models |
| 🐳 Deployment | Fully Dockerized (8 containers) |
| 🌐 Access | Web Browser — `http://localhost` |

---

## ✨ Key Features

### 💳 Transaction Management
- Add income and expense transactions with category, date, description
- Real-time balance, savings rate, and cash flow calculations
- Delete transactions with optimistic UI updates
- Persistent storage in isolated MongoDB instance

### 📊 Interactive Dashboard
- Live **Cash Flow Line Chart** (Income vs Expense over time)
- **Spending by Category Pie Chart** with colour-coded legend
- 4 KPI stat cards: Total Balance, Income, Expense, Savings Rate
- Last 5 recent transactions with type indicators

### 🎯 Goal Tracking
- Set financial goals with target amount, deadline, priority weight
- **GradientBoosting ML model** predicts achievement probability (%)
- Priority-based automatic income allocation (15% pool split by weight)
- Progress bars and actionable ML recommendations per goal

### 🤖 AI Insights Page
- **Expense Forecast** — next month's predicted spending
- **Anomaly Detection** — flagged unusual transactions
- **Spending Cluster Map** — KMeans-grouped spending habits
- **Budget Recommendations** — Ridge Regression per category
- All panels have graceful loading skeletons and fallback states

### 🔐 Authentication & Security
- JWT-based login/register with 30-day token expiry
- bcrypt password hashing (salt rounds: 10)
- Startup token validator — auto-clears stale/malformed/expired tokens
- Protected routes (user) + Admin-only routes
- CORS configured for cross-origin safety

### 🛡️ Admin Panel
- View all registered users in a table
- Role badges (Admin / User)
- Delete non-admin users with one click
- Access restricted to `isAdmin: true` users only

---

## 🏗️ System Architecture

FinFlowy uses a **Database-per-Service** microservice pattern. Each service owns its data and communicates through well-defined APIs. Nginx acts as the single entry point, routing all traffic.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (http://localhost)                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Port 80
┌─────────────────────────▼───────────────────────────────────────┐
│                   Nginx Reverse Proxy                           │
│          /api/** → backend-api:5000                             │
│          /*      → React SPA (static files)                     │
└──────────┬──────────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────┐
│              Node.js Express Backend  (Port 5000)               │
│  Routes: /api/auth  |  /api/finance                             │
│  Middleware: JWT protect, CORS, JSON parser                     │
└──┬──────────┬────────────┬──────────────────┬───────────────────┘
   │          │            │                  │
   ▼          ▼            ▼                  ▼
Auth DB   Trans DB      Goal DB         ML Service
MongoDB   MongoDB       MongoDB       FastAPI Python
:27017    :27019        :27020           Port 5001
                                            │
                                         ML DB
                                        MongoDB
                                         :27018
```

### 🐳 Docker Services (8 Containers)

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| `frontend-ui` | nginx:alpine | 80 | React SPA + Reverse Proxy |
| `backend-api` | node:22-alpine | 5000 | Express REST API |
| `ml-service` | python:3.11-slim | 5001 | FastAPI ML Engine |
| `mongodb-auth` | mongo:latest | 27017 | Users Database |
| `mongodb-transaction` | mongo:latest | 27019 | Transactions Database |
| `mongodb-goal` | mongo:latest | 27020 | Goals Database |
| `mongodb-ml` | mongo:latest | 27018 | ML Predictions & Alerts |

---

## 🧠 ML Models

FinFlowy implements **5 genuine scikit-learn Machine Learning models** — no rule-based heuristics, no fake randomness. Each model is trained on the user's own real financial data on every request.

### Model 1 — Linear Regression: Expense Forecaster
- **Purpose:** Predict next month's total expense
- **Features:** Month index (1, 2, 3…) → monthly expense totals
- **Output:** `predictedExpense`, `trend` (increasing/stable/decreasing), `confidence`, R² score
- **Endpoint:** `POST /api/ml/predict-expense`

### Model 2 — Isolation Forest: Anomaly Detection
- **Purpose:** Flag statistically unusual transactions
- **Features:** `[amount, category_encoded]` per expense
- **Contamination:** Adaptive (3–15% based on data size)
- **Output:** List of flagged transactions with anomaly scores + severity
- **Endpoint:** `POST /api/ml/behavior-analysis`

### Model 3 — Gradient Boosting Regressor: Goal Predictor
- **Purpose:** Predict probability (%) of achieving a financial goal
- **Features:** progress ratio, savings rate, expense ratio, feasibility ratio, months remaining, net cash ratio
- **Training:** Synthetic representative financial scenarios (20 samples)
- **Output:** `probability`, `monthlySavingsNeeded`, `recommendations[]`
- **Endpoint:** `POST /api/ml/goal-prediction`

### Model 4 — KMeans Clustering: Spending Patterns
- **Purpose:** Group spending categories into behaviour clusters
- **Features:** `[total_amount, transaction_count, avg_amount]` per category
- **Clusters:** Up to 3 — 🔴 High Spend / 🟡 Moderate / 🟢 Low Spend
- **Output:** Cluster map with labels, categories, totals
- **Endpoint:** `POST /api/ml/spending-patterns`

### Model 5 — Ridge Regression: Budget Recommender
- **Purpose:** Recommend optimal monthly budget per spending category
- **Features:** Monthly spend history per category (time series)
- **Guardrail:** 50/30/20 rule cap — max 25% of income per category
- **Output:** `recommendedBudget`, `potentialSaving`, confidence per category
- **Endpoint:** `POST /api/ml/budget-recommendation`

---

## 📐 Diagrams

### 1️⃣ Context Flow Diagram (CFD) — Level 0

The CFD shows the system as a single process and all external entities interacting with it.

```mermaid
flowchart LR
    USER["👤 USER\n(Authenticated)"]
    ADMIN["🛡️ ADMIN\n(Privileged User)"]
    SYSTEM(("🧠 FINFLOWY\nSYSTEM"))
    DB1[("🗄️ Auth DB\nmongodb:27017")]
    DB2[("🗄️ Transaction DB\nmongodb:27019")]
    DB3[("🗄️ Goal DB\nmongodb:27020")]
    DB4[("🗄️ ML DB\nmongodb:27018")]

    USER -- "Register / Login" --> SYSTEM
    USER -- "Add Transaction / Set Goal" --> SYSTEM
    USER -- "Request ML Insights" --> SYSTEM
    SYSTEM -- "JWT Token / Dashboard / Alerts / Forecasts" --> USER

    ADMIN -- "Admin Login / Manage Users" --> SYSTEM
    SYSTEM -- "User List / Delete Confirmation" --> ADMIN

    SYSTEM -- "Store / Retrieve Users" --> DB1
    SYSTEM -- "Store / Retrieve Transactions" --> DB2
    SYSTEM -- "Store / Retrieve Goals" --> DB3
    SYSTEM -- "Store ML Predictions & Alert Logs" --> DB4

    classDef entity fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#e0e7ff
    classDef process fill:#0f172a,stroke:#8b5cf6,stroke-width:3px,color:#fff
    classDef db fill:#052e16,stroke:#22c55e,stroke-width:2px,color:#dcfce7
    class USER,ADMIN entity
    class SYSTEM process
    class DB1,DB2,DB3,DB4 db
```

---

### 2️⃣ Data Flow Diagram (DFD) — Level 1

Breaks the system into its core sub-processes and shows data movement between each process and data store.

```mermaid
flowchart TD
    USER["👤 USER"]
    ADMIN["🛡️ ADMIN"]

    P1(("1.0\nAUTH\nSERVICE"))
    P2(("2.0\nTRANSACTION\nSERVICE"))
    P3(("3.0\nGOAL\nTRACKING"))
    P4(("4.0\nML INSIGHT\nENGINE"))
    P5(("5.0\nADMIN\nSERVICE"))

    D1[/"D1 — users\n(auth_finflowy)"/]
    D2[/"D2 — transactions\n(transaction_finflowy)"/]
    D3[/"D3 — goals\n(goal_finflowy)"/]
    D4[/"D4 — predictions + alert_logs\n(ml_finflowy)"/]

    USER -- "email + password" --> P1
    P1 -- "JWT token" --> USER
    P1 -- "store user" --> D1
    D1 -- "retrieve user" --> P1

    USER -- "amount, type, category, date" --> P2
    P2 -- "updated balance + history" --> USER
    P2 -- "save transaction" --> D2
    D2 -- "fetch transactions" --> P2

    USER -- "goal name, target, deadline, weight" --> P3
    P3 -- "progress % + probability" --> USER
    P3 -- "save goal" --> D3
    D3 -- "fetch goals" --> P3
    D2 -- "transaction history" --> P3

    USER -- "request insights" --> P4
    D2 -- "transaction data" --> P4
    D3 -- "goal data" --> P4
    P4 -- "forecasts + anomalies + clusters + budgets" --> USER
    P4 -- "store predictions + alert logs" --> D4

    ADMIN -- "admin credentials" --> P5
    P5 -- "user list" --> ADMIN
    ADMIN -- "delete user request" --> P5
    P5 -- "read/delete users" --> D1

    classDef entity fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#e0e7ff
    classDef process fill:#1e3a5f,stroke:#3b82f6,stroke-width:2px,color:#bfdbfe
    classDef store fill:#052e16,stroke:#22c55e,stroke-width:2px,color:#dcfce7
    class USER,ADMIN entity
    class P1,P2,P3,P4,P5 process
    class D1,D2,D3,D4 store
```

---

### 3️⃣ Control Flow Diagram — System Logic

Shows the complete execution path from app launch through every user action.

```mermaid
flowchart TD
    classDef start fill:#1e3a8a,stroke:#60a5fa,color:#fff
    classDef process fill:#1e293b,stroke:#94a3b8,color:#fff
    classDef decision fill:#4c1d95,stroke:#a855f7,color:#fff
    classDef db fill:#064e3b,stroke:#34d399,color:#fff
    classDef error fill:#7f1d1d,stroke:#f87171,color:#fff
    classDef ml fill:#451a03,stroke:#f59e0b,color:#fff

    START([🚀 User Opens FinFlowy]):::start
    CHK{Valid JWT\nin localStorage?}:::decision
    LOGIN[Show Login / Register Page]:::process
    CREDS[Submit email + password]:::process
    VALID{Credentials\nValid?}:::decision
    ERR1[❌ Show Error Toast]:::error
    TOKEN[Issue JWT Token — 30 days]:::process
    DASH[Load Dashboard]:::process
    FETCHDB[(Load Transactions + Goals\nfrom MongoDB)]:::db

    ACTION{User\nAction?}:::decision

    TX[Fill Transaction Form]:::process
    TXVAL{Valid\nPayload?}:::decision
    TXERR[❌ Validation Error]:::error
    TXSAVE[(Save to Transaction DB)]:::db
    TXUI[Update Balance + Charts]:::process

    GOAL[Set Financial Goal]:::process
    GVAL{Valid\nGoal?}:::decision
    GSAVE[(Save to Goal DB)]:::db
    GMLCALL[Call ML: GradientBoosting\nGoal Predictor]:::ml
    GUPDATE[Update Goal Probability %]:::process

    INSIGHT[Request AI Insights]:::process
    MLALL[Call ML Service:\nLinearRegression + IsolationForest\n+ KMeans + Ridge]:::ml
    MLSAVE[(Store Predictions\nin ML DB)]:::db
    MLUI[Render Insight Panels]:::process

    LOGOUT([👋 Logout — Clear Token]):::start

    START --> CHK
    CHK -- No --> LOGIN
    CHK -- Yes --> DASH
    LOGIN --> CREDS --> VALID
    VALID -- No --> ERR1 --> LOGIN
    VALID -- Yes --> TOKEN --> DASH
    DASH --> FETCHDB --> ACTION

    ACTION -- Add Transaction --> TX
    TX --> TXVAL
    TXVAL -- No --> TXERR --> TX
    TXVAL -- Yes --> TXSAVE --> TXUI --> ACTION

    ACTION -- Set Goal --> GOAL
    GOAL --> GVAL
    GVAL -- No --> TXERR
    GVAL -- Yes --> GSAVE --> GMLCALL --> GUPDATE --> ACTION

    ACTION -- View Insights --> INSIGHT
    INSIGHT --> MLALL --> MLSAVE --> MLUI --> ACTION

    ACTION -- Logout --> LOGOUT
```

---

## 📂 Project Structure

```
📦 FinFlowy/
├── 📁 Frontend/                    # React 18 + TypeScript + Vite
│   ├── 📁 src/
│   │   ├── 📁 pages/               # Dashboard, Transactions, Insights, Goals, Profile, Admin, Login, Register
│   │   ├── 📁 components/
│   │   │   ├── 📁 ui/              # Card, Button, Input, Label (custom design system)
│   │   │   └── 📁 layout/          # Layout, Navbar, Sidebar
│   │   ├── 📁 store/               # Zustand: useAuthStore, useFinanceStore
│   │   ├── 📁 services/            # api.ts (axios + interceptors), mlService.ts
│   │   └── 📁 lib/                 # utils.ts
│   ├── 📄 nginx.conf               # Reverse proxy config for Docker
│   ├── 📄 Dockerfile               # Multi-stage: Node build → Nginx serve
│   └── 📄 vite.config.ts
│
├── 📁 Backend/                     # Node.js + Express.js REST API
│   ├── 📁 config/
│   │   └── 📄 db.js                # 3 isolated Mongoose connections
│   ├── 📁 controllers/
│   │   ├── 📄 authController.js    # Register, Login, Profile, Admin CRUD
│   │   └── 📄 financeController.js # Transactions, Goals, ML proxy calls
│   ├── 📁 middleware/
│   │   └── 📄 authMiddleware.js    # JWT protect + admin guard
│   ├── 📁 models/
│   │   ├── 📄 User.js              # authDB model
│   │   ├── 📄 Transaction.js       # transactionDB model
│   │   └── 📄 Goal.js              # goalDB model
│   ├── 📁 routes/
│   │   ├── 📄 authRoutes.js
│   │   └── 📄 financeRoutes.js
│   ├── 📄 server.js
│   └── 📄 Dockerfile
│
├── 📁 ML_Service/                  # Python FastAPI + scikit-learn
│   ├── 📄 main.py                  # 5 ML model endpoints
│   ├── 📄 requirements.txt
│   └── 📄 Dockerfile
│
├── 📄 docker-compose.yml           # 8-container orchestration
├── 📄 .env                         # Environment variables
└── 📄 README.md
```

---

## 🗃️ Database Schema

### DB 1 — `auth_finflowy` (Port 27017)
```
users collection:
  _id         ObjectId
  name        String (required)
  email       String (required, unique)
  password    String (bcrypt hashed)
  isAdmin     Boolean (default: false)
  avatar      String (optional)
  createdAt   Date
  updatedAt   Date
```

### DB 2 — `transaction_finflowy` (Port 27019)
```
transactions collection:
  _id          ObjectId
  user         ObjectId (ref: User._id via JWT)
  amount       Number (required)
  type         String (enum: 'income' | 'expense')
  category     String (required)
  date         Date (required)
  description  String
  createdAt    Date
```

### DB 3 — `goal_finflowy` (Port 27020)
```
goals collection:
  _id            ObjectId
  user           ObjectId
  name           String (required)
  targetAmount   Number (required)
  currentAmount  Number (default: 0)
  probability    Number (ML-updated, default: 0)
  deadline       Date (required)
  priorityWeight Number (default: 50)
  createdAt      Date
```

### DB 4 — `ml_finflowy` (Port 27018)
```
alert_logs collection:
  userId, type, message, severity, model, createdAt

predictions collection:
  userId, type, predictedExpense, trend, r2Score, model, createdAt
```

---

## 🌐 API Reference

### Auth Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/profile` | Private | Get current user profile |
| GET | `/api/auth/users` | Admin | Get all users |
| DELETE | `/api/auth/users/:id` | Admin | Delete a user |

### Finance Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/finance/transactions` | Private | Get all user transactions |
| POST | `/api/finance/transactions` | Private | Create a transaction |
| DELETE | `/api/finance/transactions/:id` | Private | Delete a transaction |
| GET | `/api/finance/goals` | Private | Get all user goals |
| POST | `/api/finance/goals` | Private | Create a goal |
| GET | `/api/finance/insights` | Private | Anomaly detection (IsolationForest) |
| GET | `/api/finance/insights/forecast` | Private | Expense forecast (LinearRegression) |
| GET | `/api/finance/insights/spending-patterns` | Private | Clusters (KMeans) |
| GET | `/api/finance/insights/budget-recommendation` | Private | Budgets (Ridge) |
| GET | `/api/finance/goals/:id/predict` | Private | Goal probability (GradientBoosting) |

### ML Service Endpoints (Internal — via Backend proxy)

| Method | Endpoint | ML Model |
|--------|----------|----------|
| POST | `/api/ml/predict-expense` | LinearRegression |
| POST | `/api/ml/behavior-analysis` | IsolationForest |
| POST | `/api/ml/goal-prediction` | GradientBoostingRegressor |
| POST | `/api/ml/spending-patterns` | KMeans |
| POST | `/api/ml/budget-recommendation` | Ridge Regression |

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### Run with Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/shreyas-bhandari/FinFlowy.git
cd FinFlowy

# 2. Start all 8 services
docker compose up -d --build

# 3. Open in browser
http://localhost
```

> ⏱️ First build takes ~3–5 minutes (downloads Docker images). Subsequent starts take ~10 seconds.

### Stop the Application
```bash
docker compose down
```

### View Logs
```bash
docker logs backend-api -f       # Backend logs
docker logs ml-service -f        # ML service logs
docker logs frontend-ui -f       # Nginx access logs
```

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Regular User** | `xyz@gmail.com` | `789456` |
| **Admin** | `xyz@gmail.com` | `789456` (isAdmin promoted) |

> Admin panel: `http://localhost/admin`

---

## ⚙️ Environment Variables

```env
# Backend API
PORT=5000
NODE_ENV=development

# Database-per-Service URIs (Docker internal)
AUTH_DB_URI=mongodb://mongodb-auth:27017/auth_finflowy
TRANSACTION_DB_URI=mongodb://mongodb-transaction:27017/transaction_finflowy
GOAL_DB_URI=mongodb://mongodb-goal:27017/goal_finflowy
MONGO_URI=mongodb://mongodb-ml:27017/ml_finflowy

# Security
JWT_SECRET=finflowy_super_secret_jwt_2026

# ML Service
ML_API_URL=http://ml-service:5001/api/ml
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 8 | Build tool |
| Tailwind CSS | 4 | Styling |
| Zustand | 5 | State management |
| React Router DOM | 6 | Client-side routing |
| Recharts | 2 | Data visualizations |
| Framer Motion | 11 | Animations |
| React Hook Form | 7 | Form handling |
| Axios | 1.6 | HTTP client |
| Lucide React | — | Icon library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22 | Runtime |
| Express.js | 4 | REST framework |
| Mongoose | 8 | MongoDB ODM |
| JSON Web Token | 9 | Authentication |
| bcryptjs | 3 | Password hashing |
| Axios | 1.6 | ML service calls |
| dotenv | 16 | Environment config |
| CORS | 2.8 | Cross-origin headers |

### ML Service
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11 | Runtime |
| FastAPI | 0.104 | REST framework |
| scikit-learn | 1.3.2 | ML models |
| Pandas | 2.1.3 | Data processing |
| NumPy | 1.26.2 | Numerical computing |
| PyMongo | 4.6.1 | MongoDB client |
| Uvicorn | 0.24 | ASGI server |

---

## 🔄 How It Works — End to End

```
1. User opens http://localhost
   → Nginx serves React SPA from /usr/share/nginx/html

2. User logs in (POST /api/auth/login via Nginx proxy)
   → Express verifies password with bcrypt
   → Signs JWT (30d expiry) with JWT_SECRET
   → Stores in browser localStorage

3. User adds a transaction
   → React calls POST /api/finance/transactions (Bearer JWT)
   → Express authMiddleware verifies JWT
   → Mongoose saves to transaction_finflowy DB

4. User views Insights
   → React calls GET /api/finance/insights/forecast
   → Express fetches ALL user transactions from DB
   → Express POSTs them to FastAPI ML service
   → FastAPI trains LinearRegression on the fly
   → Returns prediction → Express → React renders chart

5. Goal probability update
   → Express fetches goal + transactions
   → POSTs to FastAPI /api/ml/goal-prediction
   → GradientBoosting predicts % → stored back in Goal DB
```

---

## 📊 ML Pipeline Detail

```
User Transaction Data
        │
        ▼
  FastAPI receives JSON payload
        │
        ▼
  Pandas DataFrame construction
        │
        ├──► LinearRegression  ──► Next Month Expense
        ├──► IsolationForest   ──► Anomaly Scores
        ├──► KMeans            ──► Spending Clusters
        ├──► Ridge Regression  ──► Budget per Category
        └──► GradientBoosting  ──► Goal Achievement %
                │
                ▼
        Results stored in ml_finflowy MongoDB
                │
                ▼
        JSON response → Node.js → React UI
```

---

## 👥 Contributing

This is a final year academic project. For suggestions or improvements, feel free to open an issue or pull request.

---

<div align="center">

**Built with ❤️ as a Final Year Engineering Project**

*FinFlowy — Where Machine Learning meets Personal Finance*

⭐ Star this repo if you found it helpful!

</div>
