# Quickstart: Executing the Incremental Frontend Refactor

## Goal

Migrate the frontend to the target feature-based architecture without changing user-facing behavior and without breaking the app between phases.

## Before You Start

1. Install dependencies with `npm install`.
2. Confirm the backend is reachable through `VITE_API_URL`.
3. Capture a behavioral baseline for:
   - login/logout and password recovery entry
   - dashboard navigation
   - manual activity create/edit
   - voice activity record/upload/prefill/submit
   - analytics charts
   - reports filters/export
   - admin CRUD and bulk import entry points
   - profile and recurring activities

## Recommended Phase Order

1. Baseline current behavior and identify orchestration seams.
2. Extract app shell responsibilities:
   - `Header`
   - `MobileNav`
   - `MobileMenu`
   - app-level loading/error/auth gate composition
   - dialog patterns into `shared/ui`
3. Establish shared foundations and entity contracts.
4. Build `features/activity/` as the reference feature.
5. Integrate `features/activity/voice/` into the same activity draft and submit pipeline.
6. Migrate `features/dashboard/`.
7. Migrate `features/profile/`.
8. Migrate `features/recurring-activities/`.
9. Migrate `features/analytics/`.
10. Migrate `features/reports/`.
11. Migrate `features/admin/`.
12. Migrate `features/auth/`.
13. Remove legacy compatibility paths and normalize exports/imports.

## Rules During Migration

- Do not move multiple high-risk modules in the same phase.
- Keep `src/lib/api.ts` as the centralized API/auth transport boundary.
- Add feature service wrappers instead of calling API modules from every component.
- Do not allow voice to submit directly; it must produce validated draft patches only.
- Promote code to `shared/` only after it is genuinely reused by at least two features.
- Leave temporary adapters only as long as needed to preserve behavior during transition.

## Verification Checklist After Every Phase

1. Run `npm run build`.
2. Run `npm run lint`.
3. Open the app and verify login/logout still works.
4. Verify page switching and navigation still work on desktop and mobile.
5. Verify manual activity creation/edit still works.
6. Verify voice recording/upload/prefill/save still works, or safely falls back.
7. Verify role-based access still matches current behavior.
8. Verify the phase-owned feature still behaves identically to baseline.

## High-Risk Cautions

- Auth is late-stage because bootstrap/session regressions block the whole app.
- Reports are late-stage because payroll/export logic is easy to subtly break.
- Analytics are medium-high risk because chart transformations can drift silently.
- Admin is high risk because CRUD breadth and bulk import touch many entities.
- Voice is medium-high risk unless validation happens before draft merge.

## Ready for Next Step

After these artifacts are accepted, generate tasks from this plan and execute them phase by phase rather than as one large migration.
