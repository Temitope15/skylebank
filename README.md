# SkyleBank

SkyleBank is a digital banking web application and Progressive Web App (PWA) designed to provide users with a secure, intelligent, and frictionless banking experience.

## Project Vision & Mission
Enable users to perform financial operations securely and effortlessly while reducing friction and increasing trust, using clean design, in-memory caching, atomic database locks, and integrated fraud risk calculations.

## Technology Stack
* **Backend:** Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Hibernate, PostgreSQL, Caffeine Cache (In-Memory), AOP, and Flyway.
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, React Router, React Hook Form, Zod, and TanStack Query.
* **Infrastructure:** Docker Compose, multi-stage Dockerfiles.

## Project Structure
* `/skylebank-backend`: Core API built as a modular monolith.
* `/skylebank-frontend`: Responsive mobile-first React client application.
* `/Docs`: In-depth architecture specification documents (local only).

## Local Development Quickstart
Refer to the untracked `SETUP.md` file in this directory for detailed instructions on launching development containers, initializing local database schemas, configuring active profiles, and running the development servers.
