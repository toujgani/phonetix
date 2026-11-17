# PHONETIX — Institutional English Phonetics LMS

> **Enterprise-Grade AI-Powered English Phonetics Learning Management System**  
> Designed for Universities, Colleges, and Language Institutes.

---

## 1. System Overview

**PHONETIX** connects three dedicated stakeholder environments within a single coherent architecture:
1. **Super Administrator Governance Portal:** Multi-campus academic structures, departments, student registration approval workflows, system health telemetry, and immutable audit logging.
2. **Faculty / Teacher Suite:** Cohort management, audio recording evaluation, phoneme weakness radar diagnostics, curriculum publication, and academic grading.
3. **Student Autonomous Learning Space:** Interactive learning paths, Web Audio-based Interactive IPA Chart, AI Pronunciation Laboratory with phoneme-level assessment, AI Conversational Speaking Partner, Educational Games Engine, and Vocabulary Notebook.

---

## 2. Architecture & Tech Stack

```
phonetix/
├── backend-laravel/               # Laravel REST API and PostgreSQL backend
│   ├── app/
│   │   ├── Models/                # User, Course, PronunciationAttempt, VoiceRecording, etc.
│   │   ├── Services/AI/           # PronunciationAssessmentInterface, Azure & Mock Providers
│   │   └── Http/                  # Controllers, Requests, Resources, Policies
│   ├── database/migrations/       # 6 Core PostgreSQL Relational Migrations (42+ Entities)
│   ├── routes/api.php             # /api/v1/... Versioned REST Routes
│   └── tests/                     # Unit & Feature Test Suites
├── frontend/                      # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/layout/     # PublicLayout (SEO & Cookies), DashboardLayout (Role Navigation)
│   │   ├── components/ui/         # Design System: Button, Card, Badge, Input, Modal, WaveformVisualizer
│   │   ├── pages/                 # Public, Dashboards, IPA Lab, Pronunciation Lab, Games, AI Speaking
│   │   ├── services/api.ts        # Web Audio API Synthesizer & Client Data Layer
│   │   ├── store/authStore.ts     # Zustand Persistent Auth Store & Instant Persona Switcher
│   │   └── types/index.ts         # Strict TypeScript Interfaces
│   ├── public/                    # robots.txt, sitemap.xml, favicon.svg
│   └── dist/                      # Verified Production Build Bundle
├── docker/                        # Multi-Container Orchestration
│   ├── docker-compose.yml         # Nginx, PHP-FPM, PostgreSQL 16, Redis 7, Frontend, Horizon
│   ├── nginx.conf                 # Reverse Proxy, Gzip, Security Headers, SPA Routing
│   ├── Dockerfile.backend         # PHP 8.2 FPM with pgsql, redis, bcmath
│   └── Dockerfile.frontend        # Multi-stage Node 20 build with Nginx
└── docs/                          # Architectural & Compliance Documentation
    ├── ARCHITECTURE.md            # C4 Diagrams & Database ER Diagram (Mermaid)
    ├── openapi.yaml               # OpenAPI 3.0 / Swagger API Specification
    └── ACCEPTANCE_CHECKLIST.md    # 39 Professional Quality, SEO, UX & Compliance Items
```

---

## 3. How to Run the Platform

### Running via Docker Compose (Full Stack)
Ensure Docker Desktop is running, then execute:
```bash
docker compose --env-file docker/.env -f docker/docker-compose.yml up -d --build
```
* **Frontend Portal:** `http://localhost:8080`
* **Backend API Gateway:** `http://localhost:8080/api/v1`
* **PostgreSQL Relational DB:** `localhost:5432`
* **Redis Cache & Broker:** `localhost:6379`

Create `docker/.env` from `docker/.env.example` first. Keep it private; it contains database credentials and is excluded from Git. Generate a unique Laravel `APP_KEY` before running the stack.

### Running the Frontend Directly (Vite Dev Server)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in any modern web browser.

### Running Backend Tests
```bash
cd backend-laravel
php artisan test
```

---

## 4. Evaluation Credentials & Roles

PHONETIX includes an **Instant Persona Switcher** in both the top navigation bar and the login screen to allow immediate evaluation across all three environments without logging in and out:

| Role | Default Name | Institutional ID | Default Email |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | Dr. Eleanor Vance | `ADM-2026-001` | `admin@phonetix-institution.edu` |
| **Faculty Instructor** | Prof. Arthur Holloway | `FAC-2026-104` | `a.holloway@phonetix-institution.edu` |
| **Student** | Sophia Chen | `STU-2026-8842` | `s.chen@student.phonetix-institution.edu` |

---

## 5. Professional Quality & Compliance Highlights (Section 29)

* **Phoneme-Level Pronunciation Assessment:** Granular accuracy, fluency, completeness, and prosody scores with individual phoneme breakdowns (`/θ/`, `/ɪ/`, `/ŋ/`, `/k/`) and articulatory remediation advice.
* **Acoustically Synthesized IPA Chart:** Uses native browser Web Audio API oscillator harmonics to synthesize formants on click, with zero latency or external audio dependency.
* **Student Registration Approval Workflow:** Submissions create accounts in `PENDING` status. Administrative review queue allows approving or rejecting accounts in real time.
* **Enterprise SEO & Metadata:** Customized `robots.txt`, auto-generated `sitemap.xml`, Open Graph tags, route-specific titles, and custom 404 page.
* **WCAG 2.2 AA Accessibility:** Accessible focus visible rings, keyboard navigability, semantic HTML, and high-contrast color tokens (> 4.5:1).
* **Privacy & Cookie Consent:** Institutional privacy policy detailing voice recording handling, absence of commercial trackers, and interactive cookie banner.
