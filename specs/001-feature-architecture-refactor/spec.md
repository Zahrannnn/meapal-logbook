# Feature Specification: Feature-Based Architecture Refactor

**Feature Branch**: `001-feature-architecture-refactor`
**Created**: 2026-04-05
**Status**: Draft
**Input**: User description: "Refactor the Meapal LogBook frontend into a scalable feature-based architecture without changing user-facing behavior."

## Clarifications

### Session 2026-04-05

- Q: What is the ownership boundary for each top-level directory (`app/`, `shared/`, `features/`, `entities/`)? -> A: `app/` owns routing, providers, shell composition, and app bootstrap only. `shared/` owns reusable UI primitives, generic hooks, utilities, and infrastructure used by 2 or more features. `features/` owns domain logic, hooks, components, services, and feature-local schemas. `entities/` owns shared domain contracts only: interfaces, enums, constants, and value objects with no side effects.
- Q: Should feature modules be lazy-loaded or eagerly imported? -> A: Lazy-load page-level feature entry points at the routing boundary with `React.lazy` plus `Suspense`; keep internal feature modules eagerly imported inside their feature.
- Q: Should admin be one feature module or split into sub-features? -> A: Use one `features/admin/` feature with internal sub-directories per entity (`users/`, `teams/`, `projects/`, `competencies/`) and a single public barrel export.
- Q: What is the lowest-risk, highest-impact first phase? -> A: Extract only shell-level concerns first: layout, navigation, auth gate, loading/error states, and modal orchestration boundaries. Keep current feature handlers intact behind temporary container props or hooks so the app stays functional after phase one.
- Q: Which responsibilities should leave `ActivityReportApp.tsx` first? -> A: Extract in this order: shell/navigation, auth-session bootstrap, modal visibility orchestration, activity draft and form pipeline, backend-to-frontend mappers, then page-specific data loaders and feature handlers.
- Q: Which modules should become top-level features first? -> A: Promote `activity/` first, then `dashboard/`, `profile/`, and `recurring-activities/`. Defer `analytics/`, `reports/`, `admin/`, and `auth/` until the feature pattern is proven on lower-risk domains.
- Q: Should voice remain a sub-feature under activity? -> A: Yes. Keep voice under `features/activity/voice/` so recording and parsing remain adapters into the same activity draft, validation, normalization, and submission pipeline.
- Q: How should voice parsed data flow safely into the activity pipeline? -> A: Voice upload returns a partial parsed DTO, the activity feature sanitizes and validates it, converts it into an `ActivityDraft` patch, merges that patch into the shared activity form state, and submits through the same create/update command used by manual entry.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App Shell and Layout Extraction (Priority: P1)

As a developer working on the Meapal LogBook frontend, I need the application shell (header, navigation, layout, confirmation dialogs) to be cleanly separated from all business logic so that I can reason about, modify, and test the app's structural skeleton independently without touching feature code.

**Why this priority**: The app shell is the foundation for all other features. Until layout and navigation are extracted, every feature extraction carries the risk of entangling layout concerns with domain logic. This must come first to unlock all subsequent stories.

**Independent Test**: After completing this story, the application builds and runs with the same visual layout, navigation, and routing behavior as before. No user-facing change is observable. Header, mobile navigation, mobile menu, and confirmation dialog are importable from their new locations without circular dependencies.

**Acceptance Scenarios**:

1. **Given** the current application, **When** a developer looks at the main orchestration component, **Then** it contains only top-level routing and layout composition, with no business logic for activities, analytics, reports, admin, or profile.
2. **Given** the refactored shell, **When** a user navigates between pages (dashboard, analytics, reports, admin, profile), **Then** all transitions work identically to the pre-refactor state.
3. **Given** the refactored shell, **When** a user uses mobile navigation or opens the mobile menu, **Then** behavior is identical to the pre-refactor state.
4. **Given** the refactored shell, **When** any feature triggers a confirmation dialog, **Then** the dialog renders and behaves identically to the pre-refactor state.
5. **Given** the first refactor phase, **When** developers inspect the shell boundary, **Then** `ActivityReportApp.tsx` no longer owns layout rendering, navigation widgets, auth gate screens, or top-level modal open/close wiring.

---

### User Story 2 - Shared Foundations Layer (Priority: P2)

As a developer, I need a clean shared layer that contains only truly reusable code (UI primitives, utility functions, shared hooks, shared types) so that features can import common functionality without depending on each other directly.

**Why this priority**: Shared foundations are a prerequisite for feature extraction. Without a well-defined shared layer, features will either duplicate code or create circular imports when they share UI components, hooks, or utility functions.

**Independent Test**: After completing this story, the shared directory contains only code that is consumed by two or more features. No feature-specific logic exists in the shared layer. The application builds and behaves identically.

**Acceptance Scenarios**:

1. **Given** the shared layer, **When** a developer inspects it, **Then** every module in the shared directory is imported by at least two distinct features.
2. **Given** the shared layer, **When** a developer searches for feature-specific logic (for example activity schemas, analytics transformations, or admin CRUD operations), **Then** no feature-specific code is found in the shared directory.
3. **Given** the shared layer, **When** the application builds, **Then** there are zero circular dependency warnings involving shared modules.

---

### User Story 3 - Activity Domain Extraction With Voice Integration (Priority: P3)

As a developer, I need all activity-related code (manual creation, editing, voice-assisted creation, form schemas, validation, submission services) to be grouped into a single `activity` feature module, with voice logging as a sub-feature, so that the entire activity pipeline is cohesive and maintainable.

**Why this priority**: Activity management is the core domain of the application. Extracting it establishes the pattern for all other feature extractions and addresses the most complex architectural challenge: integrating voice-assisted creation as a sub-feature that shares the same activity pipeline.

**Independent Test**: After completing this story, a user can create activities manually and via voice recording. Both paths produce the same result through the same pipeline. If voice recording or parsing fails, the user falls back to manual entry with an informative notification. The activity feature module is self-contained and importable without pulling in unrelated features.

**Acceptance Scenarios**:

1. **Given** the activity feature module, **When** a user creates an activity manually, **Then** the workflow (open form -> fill fields -> submit) works identically to the pre-refactor state.
2. **Given** the activity feature module, **When** a user records a voice description, **Then** the audio is uploaded, AI-parsed fields are validated, and valid fields pre-fill the activity form identically to the pre-refactor behavior.
3. **Given** the activity feature module, **When** voice recording fails (microphone denied), **Then** the system displays an informative notification and the activity form remains available for manual entry.
4. **Given** the activity feature module, **When** AI parsing returns invalid or incomplete fields, **Then** only valid fields are used to pre-fill the form; invalid fields are silently dropped or flagged for user correction.
5. **Given** the activity feature module, **When** a developer inspects the voice sub-feature, **Then** it does not define its own activity types, schemas, or submission functions; it reuses the parent activity domain's pipeline.
6. **Given** parsed voice data contains partial or invalid values, **When** the data is merged into the activity draft, **Then** only validated fields update the draft and the user reviews the same activity form before submission.

---

### User Story 4 - Remaining Feature Module Extraction (Priority: P4)

As a developer, I need the remaining features - dashboard, analytics, reports, admin (users, teams, projects, competencies), profile, recurring activities, and authentication - to each be extracted into their own feature modules so that the entire codebase follows a consistent feature-based structure.

**Why this priority**: Once the pattern is established by the activity extraction (P3), the remaining features follow the same approach. Each extraction reduces the responsibilities of the central orchestration component and improves long-term maintainability.

**Independent Test**: After completing this story, every page, modal, hook, service, and type is located within its owning feature module. The central orchestration component is a thin routing shell. All user-facing behavior (navigation, data display, CRUD operations, filtering, CSV export, chart rendering, role-based access) is identical to the pre-refactor state.

**Acceptance Scenarios**:

1. **Given** the fully refactored application, **When** an Admin user accesses the admin panel, **Then** user/team/project/competency CRUD and bulk CSV import work identically to the pre-refactor state.
2. **Given** the fully refactored application, **When** a user views dashboards with date filters, **Then** activity feeds and progress cards render identically.
3. **Given** the fully refactored application, **When** a user generates reports with payroll period logic, **Then** CSV export and date range filtering work identically.
4. **Given** the fully refactored application, **When** a user views analytics charts, **Then** all chart types and data transformations render identically.
5. **Given** the fully refactored application, **When** a user views their profile or manages skills, **Then** profile display and skill management work identically.
6. **Given** the fully refactored application, **When** a user manages recurring activities, **Then** creation, editing, and deletion of recurring activities work identically.
7. **Given** the fully refactored application, **When** an Employee, PM, or Admin logs in, **Then** role-based permissions and feature access are identical to the pre-refactor state.

---

### User Story 5 - Final Cleanup and Stabilisation (Priority: P5)

As a developer, I need the codebase to be fully cleaned (dead code removed, imports normalized, shared layer verified for purity) and the refactor validated through a comprehensive quality review so that the project is stable and ready for future feature development.

**Why this priority**: This is a post-refactor polish step. It cannot be done until all feature extractions are complete because it depends on the final project structure.

**Independent Test**: After completing this story, no dead code or unused imports remain. All imports use consistent path aliases. The shared layer contains only genuinely shared code. The full verification checklist passes.

**Acceptance Scenarios**:

1. **Given** the cleaned codebase, **When** a full build is run, **Then** it completes with zero errors and zero warnings.
2. **Given** the cleaned codebase, **When** a linter is run, **Then** it reports zero violations.
3. **Given** the cleaned codebase, **When** a developer searches for unused exports, **Then** none are found.
4. **Given** the cleaned codebase, **When** all user flows are tested end-to-end (login, dashboard, activity creation, voice activity, analytics, reports, admin, profile, recurring activities), **Then** all behaviors match the pre-refactor baseline.

---

### Edge Cases

- What happens when a feature module is extracted but its state was previously managed by the central orchestrator? The feature must bring its own state management; the orchestrator must not retain business state.
- What happens when two features share a modal or component? The component is moved to the shared layer only if consumed by two or more features; otherwise it stays in the owning feature.
- What happens when API endpoints are used by multiple features? The centralized API client remains shared, but each feature defines its own service layer wrapping the relevant API calls.
- What happens when the voice recording sub-feature needs microphone permissions on a device that does not support it? The system displays an appropriate notification and the voice option is hidden or disabled; manual entry remains available.
- What happens during refactoring if a phase introduces a regression? The phase is not considered complete until all verification checks pass; the regression must be fixed before proceeding to the next phase.
- What happens when AI voice parsing returns an unknown project, unsupported status, or malformed time range? The activity feature's parser adapter drops the invalid field, records a recoverable validation message, and leaves the user in the standard activity form to correct it manually.
- What happens when a first-phase extraction still needs existing handlers from `ActivityReportApp.tsx`? The shell may depend on thin container props or orchestrator hooks during transition, but no new business rules may be added back into `app/`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST be restructured into a feature-based directory layout where each domain (activity, dashboard, analytics, reports, admin, profile, auth, recurring activities) owns its components, hooks, services, types, and styles. The admin feature MUST use internal sub-directories per entity (`users/`, `teams/`, `projects/`, `competencies/`) under a single `features/admin/` module with one barrel export.
- **FR-002**: The main orchestration component MUST be reduced to a thin shell responsible only for top-level routing and layout composition.
- **FR-002a**: The first implementation phase MUST extract only shell-level concerns from `ActivityReportApp.tsx` (layout, navigation, auth gate, loading/error states, modal boundaries) while preserving existing feature handlers behind temporary container props or hooks.
- **FR-003**: The shared layer MUST contain only code consumed by two or more features, with no feature-specific logic.
- **FR-004**: Manual and voice-assisted activity creation MUST share the same data model, form schema, validation rules, normalization logic, and submission service.
- **FR-005**: The voice activity sub-feature MUST validate all AI-parsed fields before using them to pre-fill the activity form; invalid or missing fields MUST be silently dropped or flagged for user correction.
- **FR-006**: The voice activity sub-feature MUST gracefully fall back to manual entry if recording, upload, or parsing fails, accompanied by an informative user notification.
- **FR-007**: The centralized API client MUST remain a single shared module; each feature MUST expose its own service layer wrapping the relevant API calls.
- **FR-008**: All existing user-facing behavior MUST remain unchanged throughout and after the refactor: authentication, dashboard, analytics, reports, admin panel, profile, recurring activities, and role-based permissions.
- **FR-009**: The refactor MUST be delivered incrementally; the application MUST build and run correctly after every phase.
- **FR-010**: Browser recording APIs (`MediaRecorder`, `getUserMedia`) MUST be encapsulated in dedicated hooks, never invoked directly inside rendering components.
- **FR-011**: Cross-feature imports MUST go through public barrel exports; no feature may reach into another feature's internals.
- **FR-012**: All page-level feature components MUST be lazy-loaded at the routing boundary using `React.lazy` plus `Suspense`; internal feature components remain eagerly imported within their module.
- **FR-013**: The first top-level feature extractions after the shell phase MUST be `activity`, `dashboard`, `profile`, and `recurring-activities`, with `voice` nested under `activity`.
- **FR-014**: `app/` MAY orchestrate feature composition and providers, but it MUST NOT own domain state, backend-to-frontend mapping logic, CRUD handlers, or feature-specific validation.
- **FR-015**: `shared/` MAY contain reusable UI primitives, presentational composites, generic hooks, formatters, and infrastructure wrappers used by multiple features, but it MUST NOT contain domain-specific adapters, schemas, or feature services.
- **FR-016**: `entities/` MUST contain shared domain contracts only, including canonical activity, project, user, team, and competency types, enums, constants, and pure mapping-safe value objects with no side effects or API calls.
- **FR-017**: The activity feature MUST define a canonical `ActivityDraft` model used by both manual entry and voice-prefill; voice parsing may only emit partial draft patches and never call submission APIs directly.
- **FR-018**: High-risk modules - authentication/session renewal, reports payroll/export logic, analytics aggregations, admin CRUD/bulk import, and cross-domain ID/status mapping - MUST be migrated only after lower-risk feature boundaries are established and verified.

### Key Entities

- **Feature Module** (`src/features/<name>/`): A self-contained directory grouping all code related to a single domain: components, hooks, services, types, and schemas. Each module exposes a public API via barrel exports and owns its domain logic, UI, and data-fetching.
- **App Shell** (`src/app/`): The minimal top-level structural layer containing routing, providers, and layout composition with no business logic, domain data fetching, or feature-owned modal state.
- **Activity Pipeline**: The unified path through which all activities (manual and voice-assisted) are validated, normalized, and submitted. Both input methods converge on this single pipeline.
- **Shared Layer** (`src/shared/`): UI primitives, utility functions, and hooks consumed by two or more features. No feature-specific logic is permitted.
- **Entities Layer** (`src/entities/`): Shared domain types (interfaces, enums, constants) with no logic. Provides the contracts that features reference.
- **Feature Service**: A thin domain-specific wrapper around the centralized API client that provides feature-level methods to hooks and components.
- **Activity Draft**: The canonical in-progress activity form object owned by the activity feature. Manual form inputs and validated voice parse results both update this draft before submission.
- **Voice Parse Adapter**: A feature-local mapper that converts `ParsedVoiceActivity` responses into validated partial `ActivityDraft` patches and recoverable field-level warnings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every page (dashboard, analytics, reports, admin, profile) loads and behaves identically to the pre-refactor baseline as verified by manual walkthrough.
- **SC-002**: Activity creation (manual) completes successfully within the same number of user steps as before.
- **SC-003**: Voice activity flow (record -> upload -> parse -> prefill -> submit) completes successfully with the same user experience as before.
- **SC-004**: Voice activity failure scenarios (denied microphone, upload error, invalid AI response) result in graceful fallback to manual entry with user notification and no crash or data loss.
- **SC-005**: The application builds with zero errors and zero warnings after every refactor phase.
- **SC-006**: Linting passes with zero violations after every refactor phase.
- **SC-007**: Role-based permissions (Admin, Project Manager, Employee) produce the same access restrictions as before.
- **SC-008**: The main orchestration component contains zero business logic, zero data fetching, and zero modal management after the refactor.
- **SC-009**: Every module in the shared layer is imported by at least two distinct features.
- **SC-010**: No circular dependencies exist between feature modules.
- **SC-011**: Each page-level feature produces a separate chunk in the production build; the initial bundle does not include code for pages the user has not navigated to.
- **SC-012**: After phase one, the application still supports login, navigation, dashboard rendering, manual activity logging, and opening the voice activity modal with no user-facing regression.
- **SC-013**: In the final activity extraction, voice-assisted creation never bypasses the activity draft validator or submission service.

## Assumptions

- The existing backend API contracts remain unchanged; the refactor is frontend-only.
- The existing authentication flow (JWT plus cookie-based) remains functionally identical; only the code's file location and import paths change.
- The refactor does not introduce new user-facing features, UI changes, or performance optimizations; it is a structural reorganization only.
- The voice activity AI backend is an external service; the frontend only changes how voice recording, upload, and response handling are organized, not how they function.
- The current test suite (if any) will be updated to reflect new file paths, but test logic remains the same.
- The roadmap in `plan.md` remains sequential, but the clarified migration order should guide risk staging inside those phases.
- During transition phases, temporary container hooks or adapters are acceptable if they preserve runtime behavior and clearly point toward the final feature boundary.
