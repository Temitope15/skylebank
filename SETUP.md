# Local Development Setup Guide: SkyleBank

This document contains step-by-step setup instructions to launch and verify the local development workspace of SkyleBank.

---

## 1. System Requirements

Ensure you have the following tools installed locally on your system:
* **Java Development Kit (JDK):** Version 21 (e.g., Eclipse Temurin)
* **Maven:** Version 3.9+ (or use the packaged wrapper)
* **Node.js:** Version 20.x (LTS) & NPM
* **Docker & Docker Compose:** For running local infrastructure containers

---

## 2. Infrastructure Setup (Docker Compose)

Launch local database, cache, and email testing servers using Docker Compose.

In the project root, run:
```bash
# Start containers in background
docker compose up -d

# Verify all containers are active and healthy
docker compose ps
```

This launches:
* **PostgreSQL** on port `5432` (Username: `skylebank_user`, DB: `skylebank_db`)
* **Redis** on port `6379`
* **MailHog** SMTP server on port `1025` and Web UI on port `8025`

---

## 3. Environment Configurations

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
2. Inspect and adapt credentials or settings inside `.env` if necessary.

---

## 4. Run Backend Services (Spring Boot)

Navigate into the backend folder, configure properties, and boot the application:

```bash
cd skylebank-backend

# Clean, compile, and run tests
mvn clean install

# Launch the application under the 'dev' profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Verification Endpoints
* **API Home:** `http://localhost:8080`
* **System Actuator health metrics:** `http://localhost:8080/actuator/health`
* **OpenAPI Specs / Swagger UI:** `http://localhost:8080/swagger-ui/index.html`

---

## 5. Run Frontend Client (React Vite)

Open a new terminal window, navigate to the frontend folder, and launch:

```bash
cd skylebank-frontend

# Install dependencies (already executed during init)
npm install

# Run the local Vite dev server
npm run dev
```

### Verification Endpoints
* **App Client interface:** `http://localhost:5173`

---

## 6. Development Tools & Troubleshooting
* **Mock Emails:** Navigate to `http://localhost:8025` in your browser to inspect email notifications sent by the backend service.
* **Database client:** Connect to `localhost:5432` with username `skylebank_user`, password `skylebank_secure_password`, and database `skylebank_db`.
