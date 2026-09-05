# Contract: Feature Boundaries

## Purpose

Define the architectural ownership contract that implementation tasks must preserve during the refactor.

## Directory Ownership Contract

### `src/app/`

Owns:
- app bootstrap
- provider composition
- route-level lazy loading
- shell composition
- auth gate composition

Must not own:
- feature domain state
- backend-to-frontend mappers
- CRUD handlers
- feature validation logic
- feature-specific service wrappers

### `src/shared/`

Owns:
- reusable UI primitives
- generic hooks
- generic utilities
- infrastructure wrappers reused across features

Must not own:
- domain-specific schemas
- domain-specific service wrappers
- activity-only, reports-only, analytics-only, or admin-only logic

### `src/entities/`

Owns:
- shared domain types
- enums
- constants
- pure value objects

Must not own:
- side effects
- API calls
- feature-local transforms

### `src/features/*`

Owns:
- domain UI
- domain hooks
- feature service wrappers
- feature mappers
- feature schemas
- feature-local state and commands

Rules:
- cross-feature access goes through public barrel exports only
- feature internals are private by default

## Initial Migration Order Contract

1. `app/`
2. `shared/` and `entities/`
3. `features/activity/`
4. `features/activity/voice/`
5. `features/dashboard/`
6. `features/profile/`
7. `features/recurring-activities/`
8. `features/analytics/`
9. `features/reports/`
10. `features/admin/`
11. `features/auth/`

## High-Risk Defer Contract

The following concerns must be migrated after lower-risk feature boundaries are proven:
- auth bootstrap and token/session renewal
- reports payroll/export shaping
- analytics aggregations and chart derivations
- admin CRUD breadth and bulk import
- shared ID/status/team mapping logic

## Acceptance of This Contract

Any task that moves code into the wrong top-level ownership zone should be considered out of contract even if the app still builds.
