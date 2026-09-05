# Tasks: Feature-Based Architecture Refactor

**Input**: Design documents from `/specs/001-feature-architecture-refactor/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: No new automated test tasks are generated here because the specification did not require a TDD workflow. Verification tasks are included after each major task group using the build, lint, and manual regression checks defined in the plan and constitution.

**Organization**: Tasks are grouped by phase and mapped to user stories so each increment remains safe, independently reviewable, and behavior-preserving.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: User story label for story-specific work
- Risky tasks are marked inline with `RISK:`

## Path Conventions

- Single project frontend at repository root
- Source paths use `src/`
- Planning artifacts use `specs/001-feature-architecture-refactor/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish migration scaffolding and documentation before moving runtime code.

- [ ] T001 Create initial target directories in `src/app/`, `src/shared/`, `src/entities/`, and `src/features/` per `specs/001-feature-architecture-refactor/plan.md`
- [ ] T002 [P] Create barrel export placeholders in `src/app/index.ts`, `src/shared/index.ts`, `src/entities/index.ts`, and `src/features/index.ts`
- [ ] T003 [P] Add feature migration notes and current ownership comments to `src/components/generated/ActivityReportApp.tsx`
- [ ] T004 [P] Create architecture readme stubs in `src/app/README.md`, `src/shared/README.md`, `src/entities/README.md`, and `src/features/README.md`
- [ ] T005 Capture baseline verification checklist and migration checkpoints in `specs/001-feature-architecture-refactor/quickstart.md`

**Checkpoint**: Setup scaffolding exists and documents the target boundaries without changing runtime behavior.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared contracts and migration seams required by every later story.

**CRITICAL**: No user story migration begins until this phase is complete.

- [ ] T006 Create canonical entity modules for shared contracts in `src/entities/activity/`, `src/entities/project/`, `src/entities/user/`, `src/entities/team/`, and `src/entities/competency/`
- [ ] T007 [P] Extract non-feature-specific utilities from `src/components/generated/types.ts` and `src/lib/utils.ts` into `src/entities/index.ts` and `src/shared/utils/`
- [ ] T008 [P] Create shared UI shell primitives and dialog boundary exports in `src/shared/ui/index.ts` and `src/shared/ui/dialogs/`
- [ ] T009 Create feature service wrapper conventions and shared API usage notes in `src/shared/api/README.md` while preserving `src/lib/api.ts` as the centralized transport boundary
- [ ] T010 [P] Create migration-safe public feature entry points in `src/features/activity/index.ts`, `src/features/dashboard/index.ts`, `src/features/profile/index.ts`, `src/features/recurring-activities/index.ts`, `src/features/analytics/index.ts`, `src/features/reports/index.ts`, `src/features/admin/index.ts`, and `src/features/auth/index.ts`
- [ ] T011 Document and extract reusable backend-to-frontend mapper seams from `src/components/generated/ActivityReportApp.tsx` into placeholder files under `src/features/activity/mappers/` and `src/features/admin/`
- [ ] T012 Run foundational verification by checking `npm run build`, `npm run lint`, and a quick smoke walkthrough of login, navigation, manual activity, and voice entry after seam-only changes

**Checkpoint**: Shared contracts, shared UI seams, and feature/public entry points exist, and the app still behaves exactly the same.

---

## Phase 3: User Story 1 - App Shell and Layout Extraction (Priority: P1) 🎯 MVP

**Goal**: Extract the app shell so layout and navigation stop living inside the monolithic orchestrator.

**Independent Test**: The app builds and runs with identical layout, navigation, mobile behavior, and auth gate screens while `ActivityReportApp.tsx` no longer owns shell rendering details.

### Implementation for User Story 1

- [X] T013 [P] [US1] Create shell components in `src/app/layout/Header.tsx`, `src/app/layout/MobileNav.tsx`, and `src/app/layout/MobileMenu.tsx` from the current generated components
- [X] T014 [P] [US1] Create `src/app/layout/AppLayout.tsx` to compose shell layout, top navigation, mobile navigation, and shell-level slots
- [X] T015 [US1] Move confirm dialog patterns into `src/shared/ui/dialogs/ConfirmDialog.tsx` and export through `src/shared/ui/index.ts`
- [ ] T016 [US1] Create auth/loading/error shell composition helpers in `src/app/bootstrap/` for the current authenticated, loading, and error entry states
- [X] T017 [US1] Update `src/components/generated/ActivityReportApp.tsx` to consume `src/app/layout/AppLayout.tsx` and the moved shell components while preserving existing handlers through props
- [X] T018 [US1] Reduce shell-owned modal and navigation state in `src/components/generated/ActivityReportApp.tsx` to orchestration-only responsibilities consistent with `src/app/`
- [ ] T019 [US1] Run shell verification with `npm run build`, `npm run lint`, and manual checks for login screen, authenticated shell, desktop header, mobile nav, mobile menu, and confirm dialog behavior

**Checkpoint**: User Story 1 is independently complete and shell extraction is behaviorally neutral.

---

## Phase 4: User Story 2 - Shared Foundations Layer (Priority: P2)

**Goal**: Establish clean shared and entity boundaries without leaking feature-specific logic.

**Independent Test**: Shared modules are reused by multiple features, entity contracts are centralized, and no feature-specific business logic has leaked into `shared/`.

### Implementation for User Story 2

- [ ] T020 [P] [US2] Move generic hooks from `src/hooks/use-mobile.ts` into `src/shared/hooks/use-mobile.ts` and expose via `src/shared/hooks/index.ts`
- [ ] T021 [P] [US2] Move shared presentational primitives from `src/components/generated/` into `src/shared/ui/` only where they are consumed by two or more features
- [X] T022 [US2] Split legacy type definitions in `src/components/generated/types.ts` into canonical shared contracts under `src/entities/` and leave feature-local types for later feature migration
- [X] T023 [US2] Update imports in `src/components/generated/ActivityReportApp.tsx` and already-extracted shell files to use `src/shared/` and `src/entities/` boundaries instead of legacy mixed paths
- [X] T024 [US2] Validate shared layer purity by checking imports and removing any feature-specific helper accidentally placed under `src/shared/`
- [ ] T025 [US2] Run shared-foundations verification with `npm run build`, `npm run lint`, and a navigation plus activity smoke walkthrough to confirm no shared refactor regression

**Checkpoint**: User Story 2 is independently complete and shared foundations are ready for feature extraction.

---

## Phase 5: User Story 3A - Activity Core Extraction (Priority: P3)

**Goal**: Create a dedicated activity feature with one canonical draft, validation, normalization, and submit path for manual activity flows.

**Independent Test**: Manual activity create/edit behaves identically, recurrence editing still works, and activity submission now flows through `features/activity/`.

### Implementation for User Story 3A

- [X] T026 [P] [US3] Create activity feature structure in `src/features/activity/components/`, `src/features/activity/hooks/`, `src/features/activity/services/`, `src/features/activity/model/`, and `src/features/activity/mappers/`
- [X] T027 [P] [US3] Create activity domain contracts in `src/features/activity/model/activity.types.ts`, `src/features/activity/model/activity.draft.ts`, and `src/features/activity/model/activity.schema.ts`
- [X] T028 [P] [US3] Extract activity mapper logic from `src/components/generated/ActivityReportApp.tsx` into `src/features/activity/mappers/activity.mapper.ts`
- [X] T029 [US3] Create centralized activity wrapper services in `src/features/activity/services/activity.service.ts` that call `activitiesApi` and `recurrenceActivitiesApi` from `src/lib/api.ts`
- [X] T030 [US3] Create `src/features/activity/hooks/useActivityForm.ts` to own `ActivityDraft`, validation, normalization, and submit orchestration for manual entry
- [X] T031 [US3] Move `src/components/generated/ActivityModal.tsx` into `src/features/activity/components/ActivityModal.tsx` and wire it to the activity feature hook
- [X] T032 [US3] Update `src/components/generated/ActivityReportApp.tsx` to use `features/activity` for manual activity create/edit/delete and recurrence editing paths instead of inline handlers
- [ ] T033 [US3] Run activity-core verification with `npm run build`, `npm run lint`, and manual checks for manual create, edit, recurrence edit, delete, and post-submit refresh behavior

**Checkpoint**: Manual activity creation now has a dedicated feature module and one canonical submit pipeline.

---

## Phase 6: User Story 3B - Voice Activity Integration (Priority: P3)

**Goal**: Integrate voice as a nested sub-feature under activity and force it through the same final activity pipeline.

**Independent Test**: Voice recording, upload, parsing, prefill, failure fallback, and final submission behave identically while all final writes go through the activity feature pipeline.

### Implementation for User Story 3B

- [X] T034 [P] [US3] Create voice sub-feature structure in `src/features/activity/voice/components/`, `src/features/activity/voice/hooks/`, `src/features/activity/voice/services/`, and `src/features/activity/voice/mappers/`
- [X] T035 [P] [US3] Move `src/hooks/useVoiceRecorder.ts` to `src/features/activity/voice/hooks/useVoiceRecorder.ts` and preserve recorder behavior behind the same public interface
- [X] T036 [US3] Create voice upload wrapper in `src/features/activity/voice/services/voice.service.ts` that delegates to `voiceApi` in `src/lib/api.ts`
- [X] T037 [US3] Create `src/features/activity/voice/mappers/voiceParse.adapter.ts` to sanitize `ParsedVoiceActivity` into validated partial `ActivityDraft` patches with recoverable warnings
- [X] T038 [US3] Move `src/components/generated/VoiceActivityModal.tsx` to `src/features/activity/voice/components/VoiceActivityModal.tsx` and connect it to the voice hook and service wrapper
- [X] T039 [US3] Update `src/components/generated/ActivityReportApp.tsx` so voice prefill merges into `useActivityForm` draft state and final save uses the same activity submit command as manual entry
- [X] T040 [US3] RISK: Verify that invalid or partial AI parse values are dropped before draft merge and that manual fallback remains available after microphone, upload, or parse failure in `src/features/activity/voice/`
- [ ] T041 [US3] Run voice-integration verification with `npm run build`, `npm run lint`, and manual checks for record/upload/prefill/submit plus denied-microphone and invalid-parse fallback paths

**Checkpoint**: User Story 3 is complete only when manual and voice-assisted activity creation converge on one final submit pipeline.

---

## Phase 7: User Story 4A - Dashboard Migration (Priority: P4)

**Goal**: Move dashboard logic into its own feature module using the established activity pattern.

**Independent Test**: Dashboard rendering, filters, quick-create entry points, and recurring-activities entry still behave identically.

### Implementation for User Story 4A

- [X] T042 [P] [US4] Create `src/features/dashboard/components/`, `src/features/dashboard/hooks/`, and `src/features/dashboard/services/`
- [X] T043 [US4] Move `src/components/generated/DashboardPage.tsx` into `src/features/dashboard/components/DashboardPage.tsx`
- [X] T044 [US4] Extract dashboard-specific filters, derived lists, and quick-action handlers into `src/features/dashboard/hooks/`
- [X] T045 [US4] Update `src/components/generated/ActivityReportApp.tsx` to render the dashboard through `src/features/dashboard/`
- [ ] T046 [US4] Run dashboard verification with `npm run build`, `npm run lint`, and manual checks for dashboard feed, filters, add-activity entry, and recurring-activities entry behavior

---

## Phase 8: User Story 4B - Profile Migration (Priority: P4)

**Goal**: Move profile and skills behavior into a dedicated feature module.

**Independent Test**: Profile modal display and skill management behavior remain unchanged.

### Implementation for User Story 4B

- [X] T047 [P] [US4] Create `src/features/profile/components/`, `src/features/profile/hooks/`, and `src/features/profile/services/`
- [X] T048 [US4] Move `src/components/generated/MyProfileModal.tsx` into `src/features/profile/components/MyProfileModal.tsx`
- [X] T049 [US4] Create feature-facing profile and skills wrappers in `src/features/profile/services/profile.service.ts` using `skillsApi` and any related shared contracts
- [X] T050 [US4] Update `src/components/generated/ActivityReportApp.tsx` to render profile through `src/features/profile/`
- [ ] T051 [US4] Run profile verification with `npm run build`, `npm run lint`, and manual checks for profile open/close and skills update flows

---

## Phase 9: User Story 4C - Recurring Activities Migration (Priority: P4)

**Goal**: Move recurring activity management into its own feature while reusing activity contracts.

**Independent Test**: Recurring activity list, edit, delete, and handoff back into the activity form all behave identically.

### Implementation for User Story 4C

- [X] T052 [P] [US4] Create `src/features/recurring-activities/components/`, `src/features/recurring-activities/hooks/`, and `src/features/recurring-activities/services/`
- [X] T053 [US4] Move `src/components/generated/RecurringActivitiesModal.tsx` into `src/features/recurring-activities/components/RecurringActivitiesModal.tsx`
- [X] T054 [US4] Create recurring-activities wrapper service in `src/features/recurring-activities/services/recurring-activities.service.ts` using `recurrenceActivitiesApi`
- [X] T055 [US4] Update `src/components/generated/ActivityReportApp.tsx` and dashboard integrations to consume `src/features/recurring-activities/`
- [ ] T056 [US4] Run recurring-activities verification with `npm run build`, `npm run lint`, and manual checks for open/list/edit/delete/return-to-activity-form behavior

---

## Phase 10: User Story 4D - Analytics Migration (Priority: P4)

**Goal**: Move analytics into its own feature and isolate transformation logic.

**Independent Test**: Analytics charts, filters, and aggregates render identically for the same input data.

### Implementation for User Story 4D

- [X] T057 [P] [US4] Create `src/features/analytics/components/`, `src/features/analytics/hooks/`, `src/features/analytics/services/`, and `src/features/analytics/mappers/`
- [X] T058 [US4] Move `src/components/generated/AnalyticsPage.tsx` into `src/features/analytics/components/AnalyticsPage.tsx`
- [X] T059 [US4] RISK: Extract chart transforms and derived analytics datasets into `src/features/analytics/mappers/analytics.mapper.ts` without changing current aggregates
- [X] T060 [US4] Update `src/components/generated/ActivityReportApp.tsx` to render analytics through `src/features/analytics/`
- [ ] T061 [US4] Run analytics verification with `npm run build`, `npm run lint`, and manual checks for filters and chart outputs against baseline screenshots or baseline data views

---

## Phase 11: User Story 4E - Reports Migration (Priority: P4)

**Goal**: Move reports into its own feature while preserving payroll-period and export behavior.

**Independent Test**: Reports filters, payroll logic, and CSV export behave identically to baseline.

### Implementation for User Story 4E

- [X] T062 [P] [US4] Create `src/features/reports/components/`, `src/features/reports/hooks/`, `src/features/reports/services/`, and `src/features/reports/mappers/`
- [ ] T063 [US4] Move `src/components/generated/ReportsPage.tsx` into `src/features/reports/components/ReportsPage.tsx`
- [X] T064 [US4] RISK: Extract payroll-period calculations, export shaping, and report filters into feature-local hooks and mappers under `src/features/reports/`
- [X] T065 [US4] Create feature-facing report wrapper service in `src/features/reports/services/reports.service.ts` using `reportsApi`
- [X] T066 [US4] Update `src/components/generated/ActivityReportApp.tsx` to render reports through `src/features/reports/`
- [ ] T067 [US4] Run reports verification with `npm run build`, `npm run lint`, and manual checks for date filters, payroll views, and CSV export outputs

---

## Phase 12: User Story 4F - Admin Migration (Priority: P4)

**Goal**: Move admin into a single feature with internal subdomains for users, teams, projects, and competencies.

**Independent Test**: Admin CRUD and bulk import entry points behave identically for all current roles.

### Implementation for User Story 4F

- [X] T068 [P] [US4] Create `src/features/admin/users/`, `src/features/admin/teams/`, `src/features/admin/projects/`, and `src/features/admin/competencies/` plus `src/features/admin/index.ts`
- [ ] T069 [US4] Move `src/components/generated/AdminPage.tsx` into `src/features/admin/components/AdminPage.tsx`
- [ ] T070 [P] [US4] Move related admin modals from `src/components/generated/` into their owning admin subdirectories under `src/features/admin/`
- [X] T071 [US4] Create admin feature service wrappers in `src/features/admin/` for users, teams, projects, competencies, and bulk-import-related flows using `src/lib/api.ts`
- [X] T072 [US4] RISK: Extract shared admin mapping logic and mutation handlers from `src/components/generated/ActivityReportApp.tsx` into typed admin-local hooks and mappers without changing role-gated behavior
- [X] T073 [US4] Update `src/components/generated/ActivityReportApp.tsx` to render admin through `src/features/admin/`
- [ ] T074 [US4] Run admin verification with `npm run build`, `npm run lint`, and manual checks for user/team/project/competency CRUD plus bulk import entry behavior

---

## Phase 13: User Story 4G - Auth Migration (Priority: P4)

**Goal**: Move auth UI and bootstrap orchestration into a dedicated auth feature while preserving centralized token behavior.

**Independent Test**: Login, logout, current-user bootstrap, and forgot-password entry behavior remain unchanged.

### Implementation for User Story 4G

- [X] T075 [P] [US4] Create `src/features/auth/components/`, `src/features/auth/hooks/`, and `src/features/auth/services/`
- [X] T076 [US4] Move `src/components/generated/LoginPage.tsx` and `src/components/generated/ForgotPasswordModal.tsx` into `src/features/auth/components/`
- [X] T077 [US4] Create auth feature-facing wrappers and bootstrap helpers in `src/features/auth/services/auth.service.ts` and `src/features/auth/hooks/`
- [X] T078 [US4] RISK: Move auth bootstrap composition out of `src/components/generated/ActivityReportApp.tsx` into `src/app/bootstrap/` and `src/features/auth/` without changing centralized token storage in `src/lib/api.ts`
- [X] T079 [US4] Update `src/components/generated/ActivityReportApp.tsx` and `src/app/` composition to consume the auth feature and bootstrap helpers
- [ ] T080 [US4] Run auth verification with `npm run build`, `npm run lint`, and manual checks for login, logout, current-user restoration, and forgot-password modal entry

**Checkpoint**: User Story 4 is complete only when all remaining features are moved and still independently functional.

---

## Phase 14: User Story 5 - Final Cleanup and Stabilisation (Priority: P5)

**Goal**: Remove legacy paths only after successful feature migration and stabilize the final architecture.

**Independent Test**: The app builds cleanly, lint passes, legacy paths are removed, imports are normalized, and all major flows still match baseline.

### Implementation for User Story 5

- [ ] T081 [US5] Remove obsolete legacy imports and compatibility wrappers from `src/components/generated/ActivityReportApp.tsx` only after all replacement feature entry points are verified
- [ ] T082 [US5] Remove or archive migrated legacy files from `src/components/generated/` and `src/hooks/` only after their replacements in `src/app/`, `src/shared/`, and `src/features/` are in use
- [X] T083 [US5] Normalize imports and barrel exports across `src/app/`, `src/shared/`, `src/entities/`, and `src/features/`
- [X] T084 [US5] Validate shared layer purity and cross-feature import rules by checking that feature-specific code has not leaked into `src/shared/`
- [ ] T085 [US5] Run final stabilization verification with `npm run build`, `npm run lint`, and full manual walkthrough of auth, dashboard, manual activity, voice activity, analytics, reports, admin, profile, and recurring activities

**Checkpoint**: User Story 5 is complete when legacy paths are cleaned up only after successful migration and the final architecture is stable.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1
- **Phase 3 (US1 App Shell)**: Depends on Phase 2
- **Phase 4 (US2 Shared Foundations)**: Depends on Phase 3 for shell boundaries
- **Phase 5 (US3A Activity Core)**: Depends on Phase 4
- **Phase 6 (US3B Voice Integration)**: Depends on Phase 5
- **Phase 7-13 (US4 remaining features)**: Depend on Phase 6; proceed in planned order for safety
- **Phase 14 (US5 Final Cleanup)**: Depends on completion and verification of all earlier phases

### User Story Dependencies

- **US1**: Starts first and unlocks all later feature extraction work
- **US2**: Depends on US1 because shared boundaries should be created after shell seams exist
- **US3**: Depends on US2 because activity needs stable shared/entity boundaries
- **US4**: Depends on US3 because activity is the reference pattern for later feature modules
- **US5**: Depends on US4 because cleanup happens only after successful migration

### Task-Level Critical Dependencies

- `T017` depends on `T013`, `T014`, `T015`, `T016`
- `T023` depends on `T020`, `T021`, `T022`
- `T029` depends on `T027`, `T028`
- `T030` depends on `T027`, `T029`
- `T031` depends on `T027`, `T030`
- `T032` depends on `T029`, `T030`, `T031`
- `T036` depends on `T034`
- `T037` depends on `T027`, `T036`
- `T038` depends on `T035`, `T036`, `T037`
- `T039` depends on `T030`, `T038`
- `T044` depends on `T042`, `T043`
- `T054` depends on `T052`, `T053`
- `T059` depends on `T057`, `T058`
- `T064` depends on `T062`, `T063`
- `T071` depends on `T068`, `T069`, `T070`
- `T072` depends on `T071`
- `T078` depends on `T075`, `T076`, `T077`
- `T081` and `T082` depend on successful verification through `T080`

### Parallel Opportunities

- `T002`, `T003`, and `T004` can run in parallel after `T001`
- `T007`, `T008`, `T009`, and `T010` can run in parallel after `T006`
- `T013` and `T014` can run in parallel
- `T020`, `T021`, and `T022` can run in parallel
- `T026`, `T027`, and `T028` can run in parallel
- `T034` and `T035` can run in parallel
- Feature-directory creation tasks for dashboard/profile/recurring/analytics/reports/admin/auth can run in parallel if coordinated, but runtime integration tasks should still follow the planned order

---

## Parallel Example: Activity Core + Voice Preparation

```bash
Task: "T026 Create activity feature structure in src/features/activity/components/, src/features/activity/hooks/, src/features/activity/services/, src/features/activity/model/, and src/features/activity/mappers/"
Task: "T027 Create activity domain contracts in src/features/activity/model/activity.types.ts, src/features/activity/model/activity.draft.ts, and src/features/activity/model/activity.schema.ts"
Task: "T028 Extract activity mapper logic from src/components/generated/ActivityReportApp.tsx into src/features/activity/mappers/activity.mapper.ts"
```

```bash
Task: "T034 Create voice sub-feature structure in src/features/activity/voice/components/, src/features/activity/voice/hooks/, src/features/activity/voice/services/, and src/features/activity/voice/mappers/"
Task: "T035 Move src/hooks/useVoiceRecorder.ts to src/features/activity/voice/hooks/useVoiceRecorder.ts and preserve recorder behavior behind the same public interface"
```

---

## Implementation Strategy

### MVP First

1. Complete Setup
2. Complete Foundational work
3. Complete US1 App Shell extraction
4. Validate shell behavior before continuing

### Safe Incremental Delivery

1. App shell first
2. Shared foundations second
3. Activity core third
4. Voice integration fourth
5. Remaining features in the risk-aware order: dashboard, profile, recurring activities, analytics, reports, admin, auth
6. Cleanup old imports and legacy paths only after all migrated paths are verified

### Risk Handling Strategy

1. Keep `src/lib/api.ts` centralized throughout the migration
2. Treat reports, admin, analytics, auth, mapping extraction, and voice parsing as explicit risk areas
3. Require verification after every major task group before removing any legacy path

## Notes

- All tasks are small, safe migration steps with exact paths.
- Risky tasks are marked inline with `RISK:`.
- Manual and voice-assisted activity creation are explicitly required to converge on one activity pipeline before User Story 3 is considered complete.
- Legacy imports and legacy path cleanup are intentionally deferred until after successful migration verification.
