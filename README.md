# SkyleBank

SkyleBank is a digital banking web application and Progressive Web App (PWA) designed to provide users with a secure, intelligent, and frictionless banking experience.

## Project Vision & Mission
Enable users to perform financial operations securely and effortlessly while reducing friction and increasing trust, using clean design, in-memory caching, atomic database locks, and integrated fraud risk calculations.

## Technology Stack
* **Backend:** Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Hibernate, PostgreSQL, Caffeine Cache (In-Memory), AOP, and Flyway.
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, React Router, React Hook Form, Zod, and TanStack Query.
* **Infrastructure:** Docker Compose, multi-stage Dockerfiles.

## Project Structure
* `/skylebank-backend`: Core API built as a monolith.
* `/skylebank-frontend`: Responsive mobile-first React client application.

## Getting Started

### Running the Backend (Automated)
From the root directory, run the helper script:
```bash
./run-backend.sh
```
This script will automatically:
1. Spin up Postgres, Redis, and MailHog containers via Docker Compose.
2. Prompt you to select a Spring profile (`dev` or `prod`).
3. Compile and boot the backend using a Dockerized Java 21 environment.

To run it directly without a prompt, pass the profile name as an argument:
```bash
./run-backend.sh dev
# or
./run-backend.sh prod
```

### Running the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd skylebank-frontend
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```


