# Implementation Plan: Feature-Based Architecture Refactor

**Branch**: `001-feature-architecture-refactor` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-feature-architecture-refactor/spec.md`

## Summary

Refactor the current generated-component frontend into a feature-based architecture without changing user-facing behavior. The plan uses an incremental migration sequence that extracts app-shell responsibilities first, introduces strict ownership boundaries for `app/`, `shared/`, `entities/`, and `features/`, preserves centralized API access, and builds the activity domain as the reference feature pattern before migrating the remaining modules.

## Technical Context

**Language/Version**: TypeScript ~5.7  
**Primary Dependencies**: React 19, Vite 6, Tailwind CSS 4, Framer Motion 12, React Hook Form 7, Zod 4, Recharts 2.15, Lucide React, React Hot Toast, Sonner, cookie-universal, dnd-kit  
**Storage**: N/A in frontend runtime; browser cookie storage for JWT token via centralized API client  
**Testing**: `npm run build`, `npm run lint`, manual regression walkthroughs for auth, navigation, activity, voice, analytics, reports, admin, profile, and recurring activities  
**Target Platform**: Responsive web application running in modern desktop and mobile browsers  
**Project Type**: Single-project frontend web application  
**Performance Goals**: Preserve current perceived performance while introducing route-level lazy loading for page features; avoid increasing initial bundle by pulling all feature code into the first load  
**Constraints**: No user-facing behavior changes, no big-bang rewrite, centralized API client must remain single-source, voice must share the same activity submit pipeline, each phase must remain buildable and navigable  
**Scale/Scope**: One React frontend with roughly a dozen page/modal surfaces, one central orchestrator component, and multiple admin/reporting/analytics flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Feature-Based Architecture**: Pass. The target structure moves domain logic into feature folders and constrains `ActivityReportApp.tsx` to an orchestration shell.
- **II. Incremental Refactoring**: Pass. The migration plan is phased and explicitly keeps the app buildable after every increment.
- **III. Type Safety First**: Pass with caution. Existing code contains `any`; the refactor plan isolates and reduces those hotspots while preserving runtime behavior.
- **IV. Single Activity Pipeline**: Pass. Activity becomes the reference feature, and voice is planned as a nested adapter into the same draft, validation, normalization, and submit flow.
- **V. Separation of Concerns**: Pass. UI, hooks, service wrappers, mappers, and browser recording APIs are split along explicit boundaries.
- **VI. Testing & Verification**: Pass. Every phase includes build, lint, and targeted flow verification.
- **VII. Shared Layer Purity**: Pass. Shared admission rules are documented and enforced in migration ordering.
- **VIII. Behavioral Preservation**: Pass. Every migration step is designed to preserve existing routes, permissions, and behaviors.
- **IX. Centralized API with Feature Services**: Pass. `src/lib/api.ts` remains centralized while features add wrapper services.
- **X. Voice Resilience & Validation**: Pass. Voice parsing and recorder failures are explicitly handled as recoverable paths.

**Post-Design Re-check**: Pass. The design artifacts below keep all constitution gates satisfied without requiring justified violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-feature-architecture-refactor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── feature-boundaries.md
│   └── migration-interfaces.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── providers/
│   ├── routing/
│   ├── shell/
│   │   ├── Header.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── MobileNav.tsx
│   │   └── AppShell.tsx
│   └── bootstrap/
├── shared/
│   ├── api/
│   ├── ui/
│   ├── hooks/
│   ├── utils/
│   └── lib/
├── entities/
│   ├── activity/
│   ├── project/
│   ├── user/
│   ├── team/
│   └── competency/
├── features/
│   ├── activity/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── model/
│   │   ├── mappers/
│   │   └── voice/
│   ├── dashboard/
│   ├── analytics/
│   ├── reports/
│   ├── admin/
│   │   ├── users/
│   │   ├── teams/
│   │   ├── projects/
│   │   └── competencies/
│   ├── profile/
│   ├── auth/
│   └── recurring-activities/
├── lib/
│   └── api.ts
├── hooks/
└── components/
```

**Structure Decision**: Use a single-project frontend structure rooted in `src/`. During migration, legacy paths (`src/components/generated`, `src/hooks`, `src/lib`) may coexist temporarily, but all new architecture work lands in `app/`, `shared/`, `entities/`, and `features/`. `src/lib/api.ts` remains the centralized API module until, and only if, it is later moved wholesale into an equivalent shared API location.

## Phase 0: Research

1. Confirm the lowest-risk migration order from the current monolithic `ActivityReportApp.tsx`.
2. Confirm the directory responsibility boundaries for `app/`, `shared/`, `entities/`, and `features/`.
3. Confirm how centralized API access remains stable while features gain service wrappers.
4. Confirm the safest voice-to-activity data flow so voice remains a sub-feature of activity.
5. Confirm which modules are high-risk and must be migrated later.

## Phase 1: Design & Contracts

### Target Architecture Decisions

- `app/` owns providers, auth bootstrap composition, route selection, shell composition, and route-level lazy loading only.
- `shared/` owns reusable UI primitives, generic utilities, generic hooks, and infrastructure wrappers shared by two or more features.
- `entities/` owns shared domain contracts and pure value-level helpers only.
- `features/` owns domain-specific components, hooks, service wrappers, mappers, schemas, and state.
- `src/lib/api.ts` remains the centralized transport/auth layer. Features call it through thin domain-facing wrappers instead of importing transport details directly into UI.
- `features/activity/` becomes the canonical example feature. The voice flow lives under `features/activity/voice/` and produces validated `ActivityDraft` patches only.

### Migration Strategy

**Phase 1 - Baseline and seam identification**
- Freeze current behavior with a manual regression baseline for login, dashboard, manual activity, voice flow, analytics, reports, admin CRUD, profile, and recurring activities.
- Document current `ActivityReportApp.tsx` responsibilities by category: shell, auth bootstrap, data loading, mapping, feature state, modal orchestration, mutation handlers.
- Add route and feature seam comments or wrapper exports where needed to support non-breaking moves.

**Phase 2 - App shell extraction first**
- Create `src/app/shell/` for `Header`, `MobileNav`, `MobileMenu`, and `AppShell`.
- Move shared dialog patterns such as confirmation dialog primitives into `src/shared/ui/`.
- Keep existing handlers in the legacy orchestrator temporarily, passing them through shell/container props.
- Reduce `ActivityReportApp.tsx` to bootstrap + shell composition + feature entry wiring.

**Phase 3 - Shared foundations**
- Move only genuinely reusable primitives into `src/shared/ui/`, `src/shared/hooks/`, and `src/shared/utils/`.
- Promote domain contracts from legacy `types.ts` into `src/entities/` only when they are reused by more than one feature or define canonical domain shape.
- Leave feature-specific helpers in their owning feature even if they look reusable prematurely.

**Phase 4 - Activity core**
- Create `features/activity/` with:
  - `model/activity.types.ts`
  - `model/activity.schema.ts`
  - `model/activity.draft.ts`
  - `services/activity.service.ts`
  - `mappers/activity.mapper.ts`
  - `hooks/useActivityForm.ts`
  - `components/ActivityModal.tsx`
- Move manual activity create/edit logic out of `ActivityReportApp.tsx`.
- Ensure recurrence editing paths also flow through the same activity feature boundaries.

**Phase 5 - Voice activity integration**
- Create `features/activity/voice/` with:
  - `components/VoiceActivityModal.tsx`
  - `hooks/useVoiceRecorder.ts`
  - `services/voice.service.ts`
  - `mappers/voiceParse.adapter.ts`
- Keep actual upload transport in centralized API.
- Convert `ParsedVoiceActivity` into validated partial `ActivityDraft` patches.
- Merge voice patches into the same activity form state used for manual entry, then submit through the same feature command.

**Phase 6 - Dashboard**
- Move `DashboardPage` and dashboard-local filtering/presentation logic into `features/dashboard/`.
- Keep it early because it is user-visible but lower risk than analytics/reports/admin/auth.

**Phase 7 - Profile**
- Move `MyProfileModal` and skills/profile orchestration into `features/profile/`.
- Keep feature service wrappers for skills/profile data, but preserve current permission behavior.

**Phase 8 - Recurring activities**
- Move `RecurringActivitiesModal` and recurring edit/delete flows into `features/recurring-activities/`.
- Reuse activity entities and selected shared UI primitives rather than duplicating form models.

**Phase 9 - Analytics**
- Move `AnalyticsPage` into `features/analytics/`.
- Isolate chart transforms, filter derivations, and analytics-specific view models.
- Treat this as medium-high risk because transform regressions can silently alter displayed metrics.

**Phase 10 - Reports**
- Move `ReportsPage` into `features/reports/`.
- Isolate payroll period logic, export shaping, and report filter state.
- Treat as high risk because payroll/export logic is easy to regress without obvious UI breakage.

**Phase 11 - Admin**
- Move `AdminPage` into `features/admin/` with internal subdomains:
  - `users/`
  - `teams/`
  - `projects/`
  - `competencies/`
- Keep bulk import and cross-entity CRUD inside admin subdirectories.
- Treat as high risk because of the breadth of mutations and ID/status mapping.

**Phase 12 - Auth**
- Move `LoginPage`, `ForgotPasswordModal`, and auth bootstrap logic into `features/auth/`.
- Preserve centralized token management and existing cookie behavior.
- Treat as high risk and late-stage because bootstrap/auth regressions can lock out the whole application.

**Phase 13 - Final cleanup**
- Remove dead legacy exports and unused compatibility wrappers.
- Normalize imports and barrel exports.
- Verify shared layer purity and feature ownership one final time.

### Verification Strategy After Each Phase

Every phase must complete the following before the next phase begins:

1. Run `npm run build`.
2. Run `npm run lint`.
3. Manually verify login and logout.
4. Manually verify dashboard navigation and page switching.
5. Manually verify manual activity creation/edit.
6. Manually verify voice activity entry from record/upload through prefill and save.
7. Manually verify role-based access remains unchanged for Admin, Project Manager, and Employee.
8. Verify the phase-owned feature still behaves identically:
   - Shell phase: header, mobile nav, mobile menu, dialogs
   - Activity phase: create/edit/recurrence/manual submit
   - Voice phase: record, upload, parse, fallback handling
   - Dashboard/profile/recurring/analytics/reports/admin/auth phases: primary flows for that feature

### High-Risk Modules and Migration Cautions

- **Authentication/session bootstrap**: Breakage blocks the whole app. Migrate last and preserve centralized token logic.
- **Reports payroll/export logic**: Small transformation errors can cause incorrect report output with little visible warning.
- **Analytics aggregations**: Chart data can drift if mappings or filters change subtly during extraction.
- **Admin CRUD and bulk import**: Multiple mutation paths, modals, and entity joins create high regression surface.
- **Cross-domain ID/status mapping**: Existing mapping tables inside `ActivityReportApp.tsx` are foundational and should be extracted deliberately into typed mappers rather than copied ad hoc.
- **Voice parsing**: AI responses are partial and unreliable; validation must happen before draft merge, never after submit.

### Deliverables From This Plan

- A phased migration roadmap aligned to the constitution and current spec
- A canonical target architecture rooted in `app/`, `shared/`, `entities/`, and `features/`
- A unified activity and voice design with one submit pipeline
- Explicit verification gates after every migration phase
- A risk-aware order for dashboard, profile, recurring activities, analytics, reports, admin, and auth

## Complexity Tracking

No constitution violations currently require justification.
