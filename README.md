# SkyleBank — Premium Digital Banking & PWA Platform

SkyleBank is a high-fidelity digital banking web application and Progressive Web App (PWA) designed to provide users with a secure, frictionless, and premium financial experience. The architecture showcases strict transactional consistency, pessimistic locking systems, automated multi-tier KYC validation, and a real-time fraud risk assessment engine.

---

## 🚀 Core Features

### 1. Account & Security Layer
* **Automated Wallet Provisioning:** Registers a unique 10-digit NUBAN (Central Bank of Nigeria check-digit compliant algorithm) account number instantly upon registration.
* **4-Digit Transaction PIN:** Protects outbound payouts with an independent hashed transaction signature pin configuration.
* **Session Token Rotation:** High-speed JWT access tokens paired with HttpOnly SameSite Lax refresh cookies ensuring secure session continuity.

### 2. Multi-Tier KYC Engine
* **Tier-Based SAVINGS Accounts:** Dynamic transaction ceilings mapped across three KYC levels:
  * **Tier 1:** Daily Transfer Limit: ₦500,000.00
  * **Tier 2:** Daily Transfer Limit: ₦1,000,000.00
  * **Tier 3:** Unlimited Savings Transfers
* **Upgrade Review Dashboard:** Customers upload BVN, NIN, and identity documents to request upgrades, processed via the Admin Control Center.

### 3. Risk Engine & Fraud Oversight (Milestone 6)
* **Real-Time Risk Scoring:** Outbound transfers are intercept-assessed against security parameters:
  * **High-Value Thresholds:** Flagging transactions exceeding ₦100,000.00.
  * **Velocity Checking:** Flagging accounts attempting more than 3 transfers within 5 minutes.
  * **Device Fingerprint Swapping:** Flagging changes in incoming request `User-Agent` headers compared to previous transfers.
* **Oversight Admin Console:** Flagged transfers are deferred to a pending state and sent to an administrative fraud queue where admins approve or reject the transactions.
* **Database Deadlock Safeguards:** Sorts locked wallet IDs lexicographically prior to acquiring pessimistic write locks (`SELECT ... FOR UPDATE`), preventing circular wait conditions under heavy concurrency.

### 4. Notification Center & Mailers (Milestone 7)
* **In-App Alerts:** Interactive bell notification UI displaying credit/debit alerts and security events.
* **Asynchronous Mailers:** Dynamic HTML email templates dispatching welcome messages, login alerts, and password reset tokens.

### 5. PWA Capability & Cold-Start Keep Alive (Milestone 8)
* **Offline Asset Caching:** Fully configured service worker offline shell enabling rapid load times and standard mobile install options.
* **Keep-Alive Uptime Scheduler:** Built-in scheduler executing periodic pings to health actuator paths to prevent container dormancy in production free tiers.

---

## 🛠️ Technology Stack

* **Backend Mono-Core:** Java 21, Spring Boot 3, Spring Security, JPA/Hibernate, Caffeine Cache, Spring Event Bus, Flyway Migrations, Spring Actuator health monitoring.
* **Frontend SPA:** React 19, TypeScript, Vite 8, Zustand state store, React Router, Tailwind CSS, TanStack Query.
* **Database & Hosting:** PostgreSQL, Docker Compose, Nginx container packaging.

---

## 📚 Portfolio Resources & Documentation

Detailed blueprints and setup guides are compiled in the **`Docs/`** directory:
* 🗺️ **[System Architecture & DB ER Diagram](Docs/SYSTEM_DESIGN.md):** Architectural blueprints mapping client CDN static paths, container clusters, event buses, and table schemas.
* 📦 **[Production Deployment Guide](Docs/DEPLOYMENT_GUIDE.md):** 1-click guides to host the frontend on Vercel, API monolith on Render, database on Supabase, and emails on Resend at exactly $0.00 cost.
* 🌐 **[Postman REST API Collection](skylebank-postman-collection.json):** Importable Postman file detailing all 20+ registration, login, wallet, transfer, complaint, and admin endpoints.

---

## 💻 Local Development Setup

Follow the step-by-step launch commands to run SkyleBank locally:

### Step 1: Launch Infrastructure Containers
Ensure Docker is active and run:
```bash
docker compose up -d
docker compose ps
```
*This starts local instances of PostgreSQL (port 5432), Redis (port 6379), and MailHog SMTP Mail Catcher (Web UI port 8025).*

### Step 2: Configure Environment
Copy `.env.example` to `.env` in the root workspace folder:
```bash
cp .env.example .env
```

### Step 3: Run the Backend Services
To boot the Spring Boot API:
```bash
./run-backend.sh dev
```
*Verify backend health checks at: `http://localhost:8080/actuator/health`.*

### Step 4: Run the Frontend Client
Open a new terminal window, navigate into the frontend folder, and launch Vite:
```bash
cd skylebank-frontend
npm install
npm run dev
```
*Visit the application interface at: `http://localhost:5173`.*
