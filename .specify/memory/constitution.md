<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 1.1.0 (MINOR — 3 new principles,
                  2 expanded principles, no removals)

  Modified principles (expanded, not renamed):
    - I. Feature-Based Architecture
      → Added: ActivityReportApp.tsx responsibility-reduction
        mandate and explicit orchestrator role limit.
    - V. Separation of Concerns
      → Added: Browser recording APIs (MediaRecorder) MUST
        be isolated in hooks, never in rendering components.

  Added principles:
    - VIII. Behavioral Preservation
    - IX. Centralized API with Feature Services
    - X. Voice Resilience & Validation

  Added sections: (none — existing sections retained)
  Removed sections: (none)
  Removed principles: (none)

  Templates checked:
    ✅ .specify/templates/plan-template.md
       — "Constitution Check" section present; gates align
         with all ten principles. No update required.
    ✅ .specify/templates/spec-template.md
       — User story format + requirements + success criteria
         are compatible. Behavioral-preservation principle
         (VIII) naturally maps to acceptance scenarios. No
         update required.
    ✅ .specify/templates/tasks-template.md
       — Task categorisation supports feature-domain grouping,
         verification checkpoints, and voice-fallback testing.
         No update required.
    ✅ .specify/templates/checklist-template.md
       — No conflicts.
    ✅ README.md — API Architecture section documents
       centralised API client; Roles & Permissions section
       aligns with Principle VIII preservation requirement.
       No update required.

  Follow-up TODOs: none.
-->

# Meapal LogBook Frontend Constitution

## Core Principles

### I. Feature-Based Architecture

All application code MUST be organised into cohesive feature
modules under `src/features/`. Each feature (activity, dashboard,
analytics, reports, admin, profile, auth) owns its own
components, hooks, services, types, and styles.

- Cross-feature imports MUST go through public barrel exports
  (`index.ts`) — no reaching into another feature's internals.
- Shared, truly reusable code lives in `src/shared/` only when
  it is consumed by **two or more** features.
- `ActivityReportApp.tsx` MUST be progressively reduced to a
  thin orchestrator that handles **only** top-level routing and
  layout composition. All business logic, state management, data
  fetching, and modal orchestration MUST be extracted into the
  owning feature modules during each refactor phase.
- Rationale: Feature isolation prevents coupling, enables
  parallel development, and makes each domain independently
  testable and replaceable. A bloated orchestrator defeats the
  purpose of a feature-based architecture.

### II. Incremental Refactoring (No Big-Bang Rewrite)

Every change MUST be delivered as a small, self-contained
increment that leaves the application in a **buildable and
navigable** state.

- The 13-phase roadmap (Phase 0 – Phase 12) defined in
  `plan.md` MUST be followed in order.
- After each phase the app MUST build, route correctly, and
  pass the verification checklist (see Principle VI).
- No phase MAY introduce breaking changes to user-facing
  behavior (see also Principle VIII).
- Rationale: Big-bang rewrites introduce risk and stall
  delivery. Incremental migration de-risks the refactor and
  enables continuous validation.

### III. Type Safety First

TypeScript strict mode (`"strict": true`) MUST be enabled and
enforced across the entire codebase.

- All component props, API responses, hook return values, and
  service function signatures MUST be explicitly typed.
- `any` MUST NOT be used except in genuinely unavoidable
  third-party interop; every occurrence MUST carry a
  justification comment (e.g., `// any: dnd-kit drag event`).
- Zod schemas MUST validate all external data boundaries (API
  responses, form inputs).
- Rationale: TypeScript strict mode catches entire categories
  of bugs at compile time and serves as living documentation.

### IV. Single Activity Pipeline

Manual and voice-based activity creation MUST share the **same**
data model, form schema, validation rules, normalisation logic,
and submission service.

- `features/activity/` is the single source of truth for the
  activity domain.
- `features/activity/voice/` extends the pipeline with voice
  recording and AI parsing but MUST feed its output into the
  shared activity form — no parallel submission path.
- Voice activity logging is a **sub-feature** of the activity
  domain. It MUST NOT define its own activity types, schemas,
  or API submission functions.
- Rationale: Duplicating business logic across input methods
  causes divergence bugs and doubles maintenance cost.

### V. Separation of Concerns

UI presentation MUST be decoupled from business logic.

- Components handle rendering and user interaction only.
- Business rules, data fetching, caching, and transformation
  MUST reside in custom hooks (`use*.ts`) or service modules
  (`*.service.ts`).
- Framer Motion animations MUST NOT contain business-logic
  side effects.
- Browser recording APIs (`MediaRecorder`, `getUserMedia`) MUST
  be encapsulated in dedicated hooks (e.g., `useVoiceRecorder`)
  and MUST NOT be invoked directly inside rendering components.
- Rationale: Decoupling UI from logic enables independent
  testing, easier redesign, and reuse of logic across views.
  Isolating platform APIs prevents tight coupling to browser
  capabilities and simplifies mocking during tests.

### VI. Testing & Verification

After **every** refactor phase the following verification
checklist MUST pass:

1. `npm run build` completes with zero errors.
2. `npm run lint` reports zero violations.
3. Navigation between all pages works (no broken routes).
4. Activity creation works (manual path).
5. Voice activity flow works (record → upload → parse →
   prefill → submit).
6. Authentication flow works (login, logout, token refresh).
7. Role-based permissions remain unchanged (Admin, PM,
   Employee).
8. Reports, analytics, admin panel, profile, and recurring
   activities remain fully functional.

- No phase is considered complete until all eight checks pass.
- Rationale: Continuous verification catches regressions early
  and ensures the refactor never leaves the app in a broken
  state.

### VII. Shared Layer Purity

The `src/shared/` directory MUST contain **only** code that is
genuinely consumed by two or more features.

- Feature-specific helpers, types, and components MUST NOT
  leak into `shared/`.
- All shared utilities MUST be side-effect-free pure functions
  unless explicitly documented otherwise.
- Rationale: A bloated shared layer creates hidden coupling
  and defeats the purpose of feature isolation.

### VIII. Behavioral Preservation

No refactoring phase MAY alter, degrade, or remove existing
user-facing behavior.

- Authentication (JWT + OTP recovery), reports (CSV export,
  payroll periods), analytics (charts, trends), admin panel
  (user/team/project/competency CRUD, bulk import), profile
  (skills management), recurring activities, and role-based
  permissions (Admin, PM, Employee) MUST remain fully
  functional before, during, and after each phase.
- If a refactoring change risks behavior regression, the
  change MUST be split into a smaller increment that preserves
  the existing behavior, or the risky behavior MUST be
  feature-flagged until verified.
- Rationale: The refactor exists to improve code structure,
  not to modify the product. Users MUST NOT perceive any
  difference in functionality.

### IX. Centralized API with Feature Services

The HTTP client and authentication logic MUST remain in a
single centralized module (`src/lib/api.ts` or its successor
under `src/shared/api/`).

- Features MUST NOT instantiate their own HTTP clients or
  manage tokens directly.
- Each feature MUST expose a thin service layer
  (e.g., `features/activity/activity.service.ts`) that
  imports from the centralized API client and provides
  domain-specific methods to the feature's hooks and
  components.
- Rationale: Centralized API access ensures consistent
  authentication, error handling, and request/response
  interceptors while still allowing features to define
  domain-specific abstractions.

### X. Voice Resilience & Validation

The voice activity sub-feature MUST handle all failure modes
gracefully and validate all AI-parsed data before use.

- If voice recording fails (microphone denied, MediaRecorder
  error), the system MUST fall back to manual activity entry
  with an informative user notification.
- If audio upload fails (network error, server error), the
  system MUST fall back to manual activity entry with an
  informative user notification.
- If AI parsing returns incomplete or invalid fields, the
  system MUST fall back to manual activity entry with
  partially pre-filled form data where safely possible.
- All AI-parsed voice fields MUST be validated against the
  activity form's Zod schema **before** being used to prefill
  the form. Invalid fields MUST be silently dropped or
  flagged for user correction — never blindly assigned.
- Rationale: External AI services are inherently unreliable.
  The voice feature is a convenience enhancement; it MUST
  NOT block or corrupt the core activity creation workflow.

## Technology Stack Constraints

The project MUST use the following technology stack. Any
deviation requires explicit justification in a Complexity
Tracking table (see plan-template.md).

| Layer         | Technology             | Minimum Version |
|---------------|------------------------|-----------------|
| Framework     | React                  | 19.x            |
| Language      | TypeScript (strict)    | ~5.7            |
| Build Tool    | Vite                   | 6.x             |
| Styling       | Tailwind CSS           | 4.x             |
| Animations    | Framer Motion          | 12.x            |
| Charts        | Recharts               | 2.15            |
| Icons         | Lucide React           | latest          |
| Forms         | React Hook Form + Zod  | 7.x / 4.x      |
| Notifications | React Hot Toast/Sonner | 2.x             |
| HTTP Client   | Fetch API (custom)     | —               |
| Auth          | JWT (cookie-based)     | —               |
| Drag & Drop   | dnd-kit                | 6.x             |

- New runtime dependencies MUST be evaluated for bundle size
  impact and documented in the PR description.
- Development dependencies (linters, formatters, test runners)
  are exempt from this table.

## Development Workflow

All implementation work MUST follow the Spec-Driven Development
workflow enforced by the Spec Kit tooling:

1. **Specify** — Create a feature specification (`spec.md`)
   capturing user stories, acceptance criteria, and edge cases.
2. **Plan** — Produce an implementation plan (`plan.md`) with
   technical context, structure, and a Constitution Check gate.
3. **Task** — Generate dependency-ordered tasks (`tasks.md`)
   grouped by user story.
4. **Implement** — Execute tasks incrementally, committing
   after each logical unit.
5. **Verify** — Run the verification checklist (Principle VI)
   after each phase; fix regressions before proceeding.

- Hotfixes and urgent patches MAY skip steps 1–3 but MUST
  still pass the verification checklist and MUST be
  retroactively documented.

## Governance

This constitution is the **authoritative source** of
architectural and process rules for the Meapal LogBook Frontend
project. It supersedes ad-hoc conventions or inline comments
whenever a conflict arises.

- **Amendment procedure**: Any change to this constitution
  MUST be proposed in writing, reviewed by at least one other
  team member, and merged via pull request. The Sync Impact
  Report (HTML comment at the top of this file) MUST be
  updated with every amendment.
- **Versioning policy**: The constitution follows Semantic
  Versioning (MAJOR.MINOR.PATCH).
  - MAJOR: Principle removal or backward-incompatible
    redefinition.
  - MINOR: New principle or materially expanded guidance.
  - PATCH: Wording clarification, typo fix, or non-semantic
    refinement.
- **Compliance review**: All pull requests and code reviews
  MUST verify compliance with the principles above. Violations
  MUST be flagged and resolved before merge.
- **Guidance file**: `plan.md` and `README.md` provide runtime
  development guidance and MUST remain consistent with this
  constitution.

**Version**: 1.1.0 | **Ratified**: 2026-04-05 | **Last Amended**: 2026-04-05
