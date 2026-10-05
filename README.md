# Banalna

**Banalna** is a full-stack editorial blog with a dedicated author dashboard. Visitors can browse and search published articles, while the author can manage content and upload images through a protected interface.

## What it does

- Presents published articles with categories, featured content, and individual article pages.
- Provides an author area for creating, editing, filtering, and deleting posts.
- Supports draft and published post statuses and image uploads.
- Keeps public content separate from authenticated editorial operations.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Oxlint |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Spring Security, Spring Data JPA |
| Database | MySQL, Flyway migrations |
| Authentication | Server-side sessions, CSRF protection |

## Repository structure

```text
backend/   Spring Boot REST API and database migrations
frontend/  React and TypeScript web application
```

## Run locally

### Run with Docker Compose

Install and start Docker Desktop, then open PowerShell in the repository root:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and replace all placeholder passwords. Start the blog with:

```powershell
docker compose up --build -d
```

Open `http://localhost:8088`; the author dashboard is at `http://localhost:8088/autorka`. Sign in using `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`. MySQL and the backend are private to the Compose network; only the frontend is published to the host.

Stop the containers without removing saved posts or uploaded images:

```powershell
docker compose down
```

The database and uploaded images are kept in Docker volumes. Do not use `docker compose down -v` unless you want to permanently delete that local content.

### Prerequisites

- JDK 21 and Maven
- Node.js and npm
- MySQL with a database named `banalna`

### 1. Start the backend

Create the database and a MySQL user with access to it, then open a PowerShell terminal in `backend/`:

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/banalna'
$env:DB_USERNAME = 'banalna'
$env:DB_PASSWORD = 'your_database_password'
$env:ADMIN_USERNAME = 'author'
$env:ADMIN_PASSWORD = 'choose_a_strong_password'
$env:SESSION_COOKIE_SECURE = 'false'
mvn spring-boot:run
```

Flyway applies the database migrations on startup. The API is available at `http://localhost:8080`; check `http://localhost:8080/api/health` to verify it is running.

### 2. Start the frontend

Open another PowerShell terminal in `frontend/`:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (by default `http://localhost:5173`). The Vite development server proxies `/api` and `/uploads` to the backend at `http://localhost:8080`. The author dashboard is available at `/autorka` and uses the credentials configured for the backend.

## Useful commands

Run these from their respective directories:

```powershell
# backend/
mvn test
```

```powershell
# frontend/
npm run lint
npm run build
npm run preview
```

## Configuration

The backend reads configuration from environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_URL` | `jdbc:mysql://localhost:3306/banalna` | MySQL connection URL |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | empty | MySQL password |
| `ADMIN_USERNAME` | unset | Required author account username |
| `ADMIN_PASSWORD` | unset | Required author account password |
| `PORT` | `8080` | Backend HTTP port |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed frontend origin for CORS |
| `SESSION_COOKIE_SECURE` | `false` | Enables the secure session-cookie flag |
| `UPLOAD_DIR` | `uploads` | Directory for uploaded images |

For production, use HTTPS, set `SESSION_COOKIE_SECURE=true`, provide secrets through the deployment environment, and store uploads on persistent storage. The frontend can target a custom API base URL with `VITE_API_URL`.
