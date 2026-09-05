# Meapal LogBook — Frontend

A modern React-based daily activities reporting dashboard for **Corelia (Ricoh Company)**.
Employees log their daily work, managers track project progress, and admins manage the full organizational workflow.

---

## 🚀 Tech Stack

| Layer         | Technology                                | Version   |
| ------------- | ----------------------------------------- | --------- |
| Framework     | React                                     | 19.x      |
| Language      | TypeScript                                | ~5.7      |
| Build Tool    | Vite                                      | 6.x       |
| Styling       | Tailwind CSS                              | 4.x       |
| Animations    | Framer Motion                             | 12.x      |
| Charts        | Recharts                                  | 2.15      |
| Icons         | Lucide React                              | 0.542     |
| Forms         | React Hook Form + Zod                     | 7.x / 4.x |
| Notifications | React Hot Toast + Sonner                  | 2.6 / 2.x |
| HTTP Client   | Fetch API (custom wrapper)                | —         |
| Auth          | JWT (cookie-based via `cookie-universal`) | —         |
| Drag & Drop   | dnd-kit                                   | 6.x       |

---

## ✨ Features

* 📊 Dashboard (activity feed, filters, quick creation)
* 📈 Analytics (charts & trends)
* 📋 Reports (CSV export + payroll period logic)
* 🔧 Admin Panel (users, teams, projects, competencies)
* 👤 Profile (skills & personal info)
* 🔐 Authentication (JWT + OTP recovery)
* 🔁 Recurring Activities
* 🎙️ Voice Activity Log (AI-based activity creation)
* 📱 Fully responsive UI

---

## 🧠 Voice Activity Flow

Users can record their work description using voice:

1. Record audio (MediaRecorder)
2. Upload audio to backend
3. Backend parses audio using AI
4. Parsed fields returned
5. Activity form is pre-filled
6. User reviews/edits
7. Submit activity

⚠️ Voice input does NOT replace the form — it feeds into the same activity pipeline.

---

## 📁 Project Structure (Current)

```bash
src/
  components/generated/
    ActivityReportApp.tsx
    DashboardPage.tsx
    AnalyticsPage.tsx
    ReportsPage.tsx
    AdminPage.tsx
    ActivityModal.tsx
    VoiceActivityModal.tsx
    ...
  lib/
    api.ts
  hooks/
    use-mobile.ts
    useVoiceRecorder.ts
```

---

# 🔄 Refactor Roadmap (Spec Kit Phases)

This project is being refactored using **Spec-Driven Development (Spec Kit)**
to improve scalability, maintainability, and architecture clarity.

---

## 🟢 Phase 0 — Discovery & Baseline

### Goal

Understand the current system before refactoring.

### Tasks

* Identify critical flows:

  * login / auth
  * dashboard
  * activity creation (manual + voice)
  * reports / analytics
  * admin CRUD
* Capture screenshots / flows
* Ensure build & lint pass

---

## 🟢 Phase 1 — App Shell Extraction

### Goal

Separate layout and navigation from business logic

### Tasks

* Extract:

  * Header
  * MobileNav
  * MobileMenu
  * ConfirmDialog
* Create:

  * `app/layout`
  * `shared/ui`
* Reduce responsibilities of `ActivityReportApp.tsx`

---

## 🟢 Phase 2 — Shared Foundations

### Goal

Create clean shared layer

### Tasks

* Create:

  * `shared/ui`
  * `shared/hooks`
  * `shared/utils`
  * `shared/types`
* Move only truly reusable code
* Avoid feature leakage into shared

---

## 🟢 Phase 3 — Activity Core

### Goal

Establish activity as a proper domain

### Tasks

* Create:

  * `features/activity`
* Move:

  * ActivityModal
* Extract:

  * form schema
  * submit logic
  * normalization
  * types

### Result

Single activity pipeline

---

## 🟢 Phase 4 — Voice Activity Integration

### Goal

Integrate voice into activity domain

### Tasks

* Create:

  * `features/activity/voice`
* Move:

  * VoiceActivityModal
  * useVoiceRecorder
* Implement flow:

  * record → upload → parse → normalize → prefill → submit

### Important

Voice must reuse the SAME activity logic (no duplication)

---

## 🟢 Phase 5 — Dashboard

### Goal

Modularize dashboard

### Tasks

* Move DashboardPage
* Extract:

  * filters
  * cards
  * hooks
  * services

---

## 🟢 Phase 6 — Profile

### Goal

Isolate user profile & skills

### Tasks

* Move MyProfileModal
* Extract skill logic

---

## 🟢 Phase 7 — Recurring Activities

### Goal

Separate recurring logic

### Tasks

* Move RecurringActivitiesModal
* Isolate recurrence services

---

## 🟢 Phase 8 — Analytics

### Goal

Clean analytics module

### Tasks

* Move AnalyticsPage
* Extract:

  * charts
  * data transformations
  * filters

---

## 🟢 Phase 9 — Reports

### Goal

Organize reports system

### Tasks

* Move ReportsPage
* Extract:

  * filters
  * export logic
  * payroll logic

---

## 🟢 Phase 10 — Admin

### Goal

Split admin into subdomains

### Tasks

* users
* teams
* projects
* competencies
* bulk import

Move all related modals under each domain

---

## 🟢 Phase 11 — Auth

### Goal

Clean authentication module

### Tasks

* Move LoginPage
* Move ForgotPasswordModal
* Extract auth services

---

## 🟢 Phase 12 — Final Cleanup

### Goal

Stabilize project

### Tasks

* remove dead code
* normalize imports
* verify shared layer purity
* full QA

---

# 🏗️ Target Architecture

```bash
src/
  app/
  shared/
  entities/
  features/
    activity/
      voice/
    dashboard/
    analytics/
    reports/
    admin/
    profile/
    auth/
```

---

# 🧩 Key Architectural Rules

* ❌ No big-bang rewrite
* ✅ Incremental refactor
* ✅ Feature-based structure
* ✅ Shared only when necessary
* ✅ Voice = sub-feature of activity
* ✅ One activity pipeline (manual + voice)
* ✅ UI ≠ business logic

---

# ⚠️ Risks & Considerations

* Auth flow is sensitive
* Reports & analytics contain complex data logic
* Voice AI responses may be partial or invalid
* Activity pipeline must remain consistent

---

# 🧪 Verification Strategy

After each phase:

* App builds successfully
* No broken navigation
* Activity creation works
* Voice flow works
* Auth works
* Role permissions unchanged

---

# 🚀 Running the Project

```bash
npm install
npm run dev
```

---

# 🧾 License

ISC License — Corelia (Ricoh Company)
