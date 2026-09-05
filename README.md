# Meapal LogBook — Frontend

A modern React-based daily activities reporting dashboard for **Corelia (Ricoh Company)**.
Employees log their daily work, managers track project progress, and admins manage the full organizational workflow.

---

## 🚀 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.x |
| Language | TypeScript | ~5.7 |
| Build Tool | Vite | 6.x |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 12.x |
| Charts | Recharts | 2.15 |
| Icons | Lucide React | 0.542 |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Notifications | React Hot Toast + Sonner | 2.6 / 2.x |
| HTTP Client | Fetch API (custom wrapper) | — |
| Auth | JWT (cookie-based via `cookie-universal`) | — |
| Drag & Drop | dnd-kit | 6.x |

---

## ✨ Features

- 📊 **Dashboard** — Activity feed with date filtering, project progress cards, quick activity creation, recurring activities management
- 📈 **Analytics** — Interactive charts for hours by project, activity status distribution, team performance, and daily/weekly/monthly trends
- 📋 **Reports** — Employee, project, team, and payroll reports with CSV export, date range filtering, and custom payroll period (21st–20th)
- 🔧 **Admin Panel** — Full CRUD management for users, teams, projects, and competencies; bulk user import via CSV
- 👤 **My Profile** — Personal info display, skill management with proficiency levels (beginner → expert)
- 🔐 **Authentication** — JWT-based login with OTP password recovery flow
- 🔁 **Recurring Activities** — Create daily, weekly, monthly, or custom recurring tasks
- 🎙️ **Voice Activity Log** — Record voice descriptions of your work; audio is sent to the backend for AI processing, and the parsed fields pre-fill the activity form
- 📱 **Responsive** — Mobile-first design with bottom navigation on small screens

---

## 📁 Project Structure

The codebase follows a **feature-based architecture** with clear separation of concerns:

```
src/
├── App.tsx                              # Root component (theme + Toaster wrapper)
├── main.tsx                             # Entry point (light mode enforcement)
├── index.css                            # Global styles, Tailwind v4 theme tokens
│
├── app/                                 # App Shell & Orchestration
│   ├── ActivityReportApp.tsx            # Root orchestrator (auth → layout → content)
│   ├── ActivityReportContent.tsx        # View router (dashboard | analytics | reports | admin)
│   ├── ActivityReportModals.tsx         # All modal coordination
│   ├── appMappers.ts                    # App-level data mapping
│   ├── useActivityReportAppState.ts     # Combines data + UI + admin hooks
│   ├── useActivityReportData.ts         # Centralized data fetching & state
│   ├── useActivityReportUiState.ts      # UI state (modals, view mode, etc.)
│   ├── useActivityReportAdminActions.ts # Admin CRUD orchestration
│   ├── bootstrap/
│   │   └── useAuthBootstrap.ts          # Login/logout + token management
│   └── layout/
│       ├── AppLayout.tsx                # Shell: Header + content + MobileNav
│       ├── AppStateScreen.tsx           # Loading/error splash screens
│       ├── Header.tsx                   # Top navigation bar
│       ├── MobileMenu.tsx               # Slide-out mobile menu
│       └── MobileNav.tsx                # Bottom mobile navigation
│
├── entities/                            # Domain Models & Types
│   ├── activity/                        # ActivityEntry interface
│   ├── project/                         # Project entity types
│   ├── user/                            # User entity types
│   ├── team/                            # Team/TeamType
│   └── competency/                      # CompetencyTag
│
├── features/                            # Feature Modules
│   ├── activity/                        # Core activity domain
│   │   ├── components/                  # ActivityModal
│   │   ├── hooks/                       # useActivityForm
│   │   ├── services/                    # activity.service (CRUD)
│   │   ├── mappers/                     # Backend ↔ frontend conversion
│   │   ├── model/                       # ActivityDraft, schema, types
│   │   └── voice/                       # Voice sub-feature
│   │       ├── components/              # VoiceActivityModal
│   │       ├── hooks/                   # useVoiceRecorder
│   │       ├── services/               # voice.service
│   │       └── mappers/                # voice.mapper
│   ├── dashboard/                       # Dashboard view
│   ├── analytics/                       # Charts & visualizations
│   ├── reports/                         # Reports & CSV export
│   ├── admin/                           # Admin management panel
│   ├── auth/                            # Login, password recovery
│   ├── profile/                         # User profile & skill management
│   └── recurring-activities/            # Recurring activity management
│
├── shared/                              # Shared Utilities
│   └── ui/
│       └── dialogs/                     # ConfirmDialog
│
├── lib/                                 # API Layer
│   ├── api/
│   │   ├── core.ts                      # Fetch wrapper, auth token management
│   │   ├── types.ts                     # All backend API interfaces
│   │   ├── clients.ts                   # Aggregated API client barrel
│   │   ├── auth.client.ts              # Auth endpoints
│   │   ├── users.client.ts             # User CRUD
│   │   ├── teams.client.ts             # Team CRUD
│   │   ├── projects.client.ts          # Project CRUD
│   │   ├── activities.client.ts        # Activity CRUD + recurrence
│   │   ├── competencies.client.ts      # Competency CRUD
│   │   ├── reports.client.ts           # Report queries
│   │   ├── skills.client.ts            # Skill management
│   │   └── voice.client.ts             # Voice upload
│   ├── api.ts                           # Re-export barrel
│   └── utils.ts                         # cn(), calculateActualHours(), etc.
│
├── hooks/
│   └── use-mobile.ts                    # Mobile breakpoint detection hook
│
└── settings/
    ├── theme.ts                         # Theme configuration
    └── types.d.ts                       # Theme/Container type declarations
```

Each feature module follows a consistent internal structure:
`components/` · `hooks/` · `services/` · `mappers/` · `model/`

---

## 🛠️ Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- Backend API running (default: `http://localhost:3000/api/v1`)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create or edit the `.env` file:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📜 Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Vite dev server |
| `build` | `npm run build` | Type-check + production build → `dist/` |
| `preview` | `npm run preview` | Preview the production build locally |
| `lint` | `npm run lint` | Run ESLint |
| `format` | `npm run format` | Format code with Prettier |
| `format:check` | `npm run format:check` | Check formatting without modifying |

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | mmd@corelia.ai | Admin@123! |
| Project Manager | aka@corelia.ai | Admin@123! |
| User | [any]@corelia.ai | Admin@123! |

---

## 🔌 API Architecture

The frontend communicates with the backend through a modular API layer (`src/lib/api/`) using the Fetch API with JWT Bearer authentication. Each domain has its own client file, aggregated via `clients.ts`.

### API Modules

| Module | Base Endpoint | Description |
|--------|--------------|-------------|
| `authApi` | `/users/login`, `/users/forgot-password`, `/users/verify-otp`, `/users/reset-password` | Authentication & password recovery |
| `usersApi` | `/users` | User CRUD with pagination & search |
| `teamsApi` | `/teams` | Team CRUD + member listing |
| `projectsApi` | `/projects` | Project CRUD + status/progress updates |
| `activitiesApi` | `/activities` | Activity CRUD + date range queries |
| `recurrenceActivitiesApi` | `/recurring` | Recurring activity management |
| `competenciesApi` | `/competencies` | Competency/skill catalog CRUD |
| `reportsApi` | `/reports/overall`, `/reports/project/:id`, `/reports/team/:id`, `/reports/employee/:id` | Period-based analytics reports |
| `skillsApi` | `/skills/me`, `/skills/user/:id`, `/skills/team/:id`, `/skills/matrix` | User skill management |
| `voiceApi` | `/voice/activity` | Upload voice recording, returns parsed activity fields |

### Authentication Flow

1. User submits credentials → `POST /users/login`
2. JWT token stored in browser cookie (1-day expiry)
3. All subsequent requests include `Authorization: Bearer <token>`
4. Token expiration → automatic logout with redirect

### Password Recovery

1. User enters email → `POST /users/forgot-password`
2. OTP sent to email → `POST /users/verify-otp`
3. New password submitted with reset token → `POST /users/reset-password`

---

## 👥 Roles & Permissions

| Role | Dashboard | Analytics | Reports | Admin Panel | Manage Activities |
|------|-----------|-----------|---------|-------------|-------------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ (all users) |
| **Project Manager** | ✅ | ✅ | ✅ | ❌ | ✅ (own + team) |
| **Employee** | ✅ | ✅ | ✅ | ❌ | ✅ (own only) |

---

## 🎨 Design System

- **Font**: [Inter](https://fonts.google.com/specimen/Inter) with system fallback
- **Theme**: Light mode (enforced at runtime)
- **Colors**: HSL-based CSS custom properties with semantic tokens (`--primary`, `--background`, `--destructive`, etc.)
- **Components**: Glassmorphic cards, gradient accents, rounded corners (`rounded-2xl`)
- **Animations**: CSS keyframes + Framer Motion transitions
- **Scrollbar**: Custom thin scrollbar
- **Responsive Breakpoints**: Mobile-first with `sm`, `md`, `lg` breakpoints

---

## 🚀 Production Deployment

### Option 1: Static Build

```bash
# Build for production
npm run build

# Output: dist/ folder with optimized static files
```

Serve with any static file server (Nginx, Apache, etc.) — make sure to configure SPA fallback (`try_files $uri /index.html`).

**Nginx example:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/logbook/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Docker

```bash
# Build image
docker build -t logbook-frontend .

# Run container
docker run -p 80:80 logbook-frontend

# Or with docker-compose
docker-compose up -d
```

### Option 3: Cloud Platforms

**Vercel:**
```bash
npm i -g vercel
vercel --prod
```

**Netlify:**
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL`

---

## ❌ Troubleshooting

### API Connection Issues

```bash
# Check backend is running
curl http://localhost:3000/api/v1/health

# Verify environment variable
echo $VITE_API_URL
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### CORS Issues

Ensure the backend's `ALLOWED_ORIGINS` includes the frontend URL:

```env
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

---

## 📄 License

ISC License — Corelia (Ricoh Company)
