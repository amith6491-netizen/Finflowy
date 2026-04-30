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
flowchart TD
    %% External Entities (Rectangles)
    User[User]
    
    %% Main System Process (Circle)
    System(("0.0<br/>FinFlowy Microservices System"))

    %% Data Flows
    User -- "User Credentials (Login/Register)" --> System
    System -- "Authentication Token & Profile Data" --> User
    
    User -- "Transaction Data (Income/Expense)" --> System
    System -- "Categorized Transactions & Balances" --> User
    
    User -- "Financial Goals & Targets" --> System
    System -- "Goal Progress & Notifications" --> User
    
    User -- "Requests Insights" --> System
    System -- "AI-Generated Predictive Analytics & Insight Alerts" --> User

    classDef process fill:#0f172a,stroke:#3b82f6,stroke-width:3px,color:#fff;
    classDef entity fill:#1e293b,stroke:#a855f7,stroke-width:2px,color:#fff;
    
    class System process;
    class User entity;
```

---

### 2️⃣ Data Flow Diagram (DFD Level 1)

Breaks down the main system into distinct sub-processes and shows the flow of data between these processes and the MongoDB data stores.

```mermaid
flowchart LR
    %% External Entity (Rectangle)
    User[User]
    
    %% Microservice Processes (Circles)
    P1(("1.0<br/>Authentication<br/>Management<br/>(Node.js API)"))
    P2(("2.0<br/>Transaction<br/>Processing<br/>(Node.js API)"))
    P3(("3.0<br/>Goal<br/>Tracking<br/>(Node.js API)"))
    P4(("4.0<br/>AI Predictive<br/>Analytics<br/>(Python ML)"))
    P5(("5.0<br/>Anomaly & Insight<br/>Alert Engine<br/>(Python ML)"))
    
    %% Data Stores
    D1[(D1: Users DB)]
    D2[(D2: Transactions DB)]
    D3[(D3: Goals DB)]
    D4[(D4: Alert Logs DB)]
    
    %% Flows for Authentication
    User -- "Credentials" --> P1
    P1 -- "Auth Token" --> User
    P1 -- "User Data" --> D1
    D1 -. "Verification" .-> P1
    
    %% Flows for Transactions
    User -- "Input Transaction" --> P2
    P2 -- "View Transactions" --> User
    P2 -- "Store Record" --> D2
    D2 -. "Fetch Records" .-> P2
    
    %% Flows for Goals
    User -- "Set/Update Goal" --> P3
    P3 -- "Goal Progress" --> User
    P3 -- "Store Goal" --> D3
    D3 -. "Fetch Goals" .-> P3
    
    %% Flows for Analytics
    User -- "Request Forecasts" --> P4
    P4 -- "Predictive Reports" --> User
    D2 -. "Transaction History" .-> P4
    
    %% Flows for Alerts
    D2 -. "New Transactions" .-> P5
    P5 -- "Log Insight" --> D4
    P5 -- "Trigger Insight Alert" --> User

    classDef process fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff;
    classDef datastore fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef entity fill:#1e293b,stroke:#a855f7,stroke-width:2px,color:#fff;
    
    class P1,P2,P3,P4,P5 process;
    class D1,D2,D3,D4 datastore;
    class User entity;
```

---

### 3️⃣ Control Flow Diagram (CFD)

Illustrates the logical sequence of operations and execution paths, focusing on the microservice routing between the Node.js API and the Python ML Service.

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant F as Frontend (React)
    participant B as Backend API (Node.js)
    participant ML as ML Service (Python)
    participant DB as MongoDB

    U->>F: Access Dashboard / Submit Action
    
    alt is Authentication Request
        F->>B: POST /api/auth (Credentials)
        B->>DB: Query User
        DB-->>B: Return User Record
        B-->>F: JWT Token & Profile
    else is Standard Data Request (e.g., Add Transaction)
        F->>B: POST /api/finance/transactions (JWT)
        B->>B: Validate JWT & Payload
        B->>DB: Insert Document
        DB-->>B: Acknowledge
        B-->>F: Success Response
    else is ML Insight Request
        F->>B: GET /api/finance/insights (JWT)
        B->>DB: Fetch User History
        DB-->>B: Return Transaction Data
        B->>ML: POST /predict (Data Payload)
        Note over B,ML: Microservice Communication
        ML->>ML: Run Predictive Model
        ML-->>B: Return AI Insights
        B-->>F: Format & Send Insights
    end
    
    F-->>U: Update UI State & Render Visuals
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
