<div align="center">

<h1>🌍 FinFlowy - Intelligent Personal FinFlowy</h1>
  <p><em>“Not just tracking money — understanding it.”</em></p>
  <p><strong>Experience the next generation of financial tracking with predictive ML insights, dynamic goal allocation, and real-time visualization.</strong></p>
  
  <p>
    <a href="#features"><strong>Features</strong></a> ·
    <a href="#architecture"><strong>Architecture</strong></a> ·
    <a href="#quick-start-docker"><strong>Quick Start</strong></a> ·
    <a href="#manual-setup"><strong>Manual Setup</strong></a>
  </p>
=======
  <img alt="FinFlowy Hero Banner" src="./assets/FinFlowy_banner.png" width="100%" style="border-radius: 12px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"/>
  <h1>✨ FinFlowy ✨</h1>
  <p>A next-generation, AI-powered Personal Finance Intelligence System designed to empower users with predictive analytics, transaction management, and intelligent goal tracking.</p>


  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react" alt="React">
    <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" alt="Node JS">
    <img src="https://img.shields.io/badge/Python-ML_Service-yellow?style=for-the-badge&logo=python" alt="Python">
    <img src="https://img.shields.io/badge/Microservices-Architecture-orange?style=for-the-badge&logo=docker" alt="Microservices">
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker">
  </p>

</div>

---

## 🌟 Overview

Welcome to **FinFlowy**, a premier financial intelligence suite.
This project is built on a scalable microservice architecture bringing together a lightning-fast React frontend, a robust Node.js backend, and a dedicated Python Machine Learning service.

It is designed to:

* Track income and expenses
* Categorize transactions
* Deliver proactive financial insights

---

## 🚀 Key Features

* **AI Predictive Analytics** — Behavioral analysis and spending forecasts
* **Comprehensive Dashboard** — Interactive, glassmorphism UI
* **Intelligent Goal Tracking** — Dynamic savings allocation
* **Transaction Management** — Secure categorized transactions
* **Fully Containerized Environment** — Docker-based deployment

---

## 🛠️ Technology Stack & Libraries

### 💻 Frontend Ecosystem
* **Framework:** React 18 with TypeScript
* **State Management:** Zustand / React Context API
* **Routing:** React Router DOM
* **Styling & UI:** Tailwind CSS, Framer Motion (Animations), Lucide React (Icons)
* **Build Tool:** Vite

### ⚙️ Backend Architecture
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose ODM
* **Security:** JWT Authentication, Bcrypt (Password Hashing), CORS, Helmet

### 🧠 Machine Learning & Data Science
* **Language:** Python 3.10+
* **Framework:** FastAPI
* **Data Processing:** Pandas, NumPy
* **Machine Learning:** Scikit-Learn (Predictive Modeling, Clustering)

---

## 🤖 Machine Learning Models

FinFlowy leverages advanced Machine Learning algorithms to provide proactive financial intelligence:
1. **Spending Categorization Model:** An NLP-based classifier that automatically assigns tags to new transactions based on historical patterns.
2. **Predictive Forecasting:** Time-series forecasting (e.g., ARIMA or Prophet) to estimate future end-of-month balances and upcoming expenses.
3. **Behavioral Anomaly Detection:** Isolation Forests to identify unusual spending behavior and alert the user immediately.

---

## 🏗️ Detailed System Diagrams

FinFlowy follows a **containerized microservices architecture** ensuring scalability and separation of concerns.

### 1️⃣ Context Diagram (DFD Level 0)

Provides a high-level view of the entire FinFlowy system and how it interacts with external entities (Users).

```mermaid
flowchart LR
    %% External Entity
    USER[USER]
    
    %% Main System Process
    SYSTEM(("FINFLOWY<br/>SYSTEM"))
    
    %% Database
    DB[(FINFLOWY<br/>DATABASE)]
    
    %% User Interactions
    USER -- "Input transactions / Set goals / Request insights" --> SYSTEM
    SYSTEM -- "Dashboard views / Predictive alerts" --> USER
    
    %% System to DB
    SYSTEM -- "Stores credentials, transactions, goals" --> DB
    DB -- "Retrieves historical data for ML models" --> SYSTEM

    classDef process fill:#0f172a,stroke:#3b82f6,stroke-width:3px,color:#fff;
    classDef datastore fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef entity fill:#1e293b,stroke:#a855f7,stroke-width:2px,color:#fff;
    
    class SYSTEM process;
    class DB datastore;
    class USER entity;
```

---

### 2️⃣ Data Flow Diagram (DFD Level 1)

Breaks down the main system into distinct sub-processes and shows the flow of data between these processes and the MongoDB data stores.

```mermaid
flowchart LR
    %% External Entity
    USER[USER]
    
    %% Processes
    P1(("REGISTRATION /<br/>LOGIN FORM"))
    P2(("TRANSACTION<br/>DASHBOARD"))
    P3(("GOAL TRACKING<br/>SYSTEM"))
    P4(("AI PREDICTIVE<br/>ANALYZER"))
    P5(("ANOMALY ALERT<br/>ENGINE"))
    
    %% Data Stores
    D1[(users table)]
    D2[(transactions table)]
    D3[(goals table)]
    D4[(alert logs table)]
    
    %% User <--> Processes
    USER -- "Login / Register" --> P1
    P1 -- "Auth confirmation" --> USER
    
    USER -- "Add transaction" --> P2
    P2 -- "View balance" --> USER
    
    USER -- "Set financial goal" --> P3
    P3 -- "Goal status" --> USER
    
    USER -- "Request forecast" --> P4
    P4 -- "Predictive report" --> USER
    
    USER -- "Acknowledge alert" --> P5
    P5 -- "Unusual spending alert" --> USER
    
    %% Processes <--> Data Stores
    P1 -- "store" --> D1
    D1 -- "retrieve" --> P1
    
    P2 -- "store" --> D2
    D2 -- "retrieve" --> P2
    
    P3 -- "store" --> D3
    D3 -- "retrieve" --> P3
    
    D2 -- "provide data" --> P4
    D3 -- "provide goals" --> P4
    
    D2 -- "stream data" --> P5
    P5 -- "store incident" --> D4

    classDef process fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff;
    classDef datastore fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef entity fill:#1e293b,stroke:#a855f7,stroke-width:2px,color:#fff;
    
    class P1,P2,P3,P4,P5 process;
    class D1,D2,D3,D4 datastore;
    class USER entity;
```

---

### 3️⃣ Control Flow Diagram (CFD)

Illustrates the logical sequence of operations and execution paths, focusing on the microservice routing between the Node.js API and the Python ML Service.

```mermaid
flowchart TD
    %% Premium Styling for Presentation
    classDef central fill:#2d1b2e,stroke:#ec4899,stroke-width:4px,color:#fff,font-size:18px,font-weight:bold
    classDef userbox fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#fff,font-size:16px
    classDef dbbox fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff,font-size:16px
    
    %% Central Hub
    SYS(("🤖 FINFLOWY AI<br/>SYSTEM 1.0")):::central
    
    %% External Entities (Top)
    USER["👤 Client / Public User"]:::userbox
    
    %% Databases (Bottom)
    DB_MAIN[("🗄️ Main FinFlowy Database")]:::dbbox
    DB_ML[("🚨 ML Alert Logs Database")]:::dbbox

    %% Inputs from User (Flowing Down to System)
    USER -- "Register Account / Secure Login" --> SYS
    USER -- "Input Income & Expenses" --> SYS
    USER -- "Set Custom Financial Goals" --> SYS
    USER -- "Request AI Predictive Insights" --> SYS

    %% Outputs from System (Flowing Up to User)
    SYS -- "Render Glassmorphism Dashboard" --> USER
    SYS -- "Push Real-Time Anomaly Alerts" --> USER
    SYS -- "Show Goal Progress & Forecasts" --> USER

    %% System Storage Actions (Flowing Down to DB)
    SYS -- "Store User Credentials & Hashes" --> DB_MAIN
    SYS -- "Store Transaction Ledger" --> DB_MAIN
    SYS -- "Update Active Goals" --> DB_MAIN
    SYS -- "Log Detected Spending Anomalies" --> DB_ML

    %% System Retrieval Actions (Flowing Up from DB)
    DB_MAIN -- "Fetch Transaction History for ML" --> SYS
    DB_ML -- "Retrieve Past Alert History" --> SYS
```

---

## 📂 System Topology

```text
📦 FinFlowy
 ┣ 📂 Frontend
 ┃ ┣ 📂 src/pages
 ┃ ┗ 📂 src/components
 ┣ 📂 Backend
 ┣ 📂 ML_Service
 ┗ 📜 docker-compose.yml
```

---

## 🚦 Getting Started (Docker Compose)

```bash
git clone https://github.com/shreyas-bhandari/FinFlowy.git
cd FinFlowy
docker-compose up -d --build
```

> Stop containers using: `docker-compose down`

---

<div align="center">
  <b>🚀 Architected for next-generation financial intelligence</b>
</div>
