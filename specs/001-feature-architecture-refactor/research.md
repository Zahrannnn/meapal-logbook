# Research: Feature-Based Architecture Refactor

## Decision 1: Extract app shell responsibilities before any feature migration

**Decision**: Move layout, navigation, auth gate composition, loading/error screens, and modal boundary wiring into `src/app/` first while leaving current business handlers temporarily delegated from the legacy orchestrator.

**Rationale**: `ActivityReportApp.tsx` currently mixes shell rendering with feature state, data loading, mapping, and mutation handlers. Shell extraction produces the lowest-risk seam because it changes composition boundaries first while leaving domain logic intact.

**Alternatives considered**:
- Start with activity feature extraction immediately: rejected because the activity flow still depends on shell-owned modal and bootstrap state.
- Start with auth: rejected because auth regressions would block the entire application too early.

## Decision 2: Keep `src/lib/api.ts` centralized and add feature-facing wrappers

**Decision**: Preserve the existing centralized API and token management layer, and introduce thin feature service wrappers inside each feature module.

**Rationale**: The current API layer already concentrates transport, auth token handling, and endpoint definitions. Replacing or scattering it during the refactor would multiply risk. Feature service wrappers give better domain boundaries without destabilizing networking.

**Alternatives considered**:
- Create a new HTTP client per feature: rejected because it duplicates auth/error handling and violates the constitution.
- Move all transport code into features immediately: rejected because the transport boundary is already stable and should not be changed until feature wrappers exist.

## Decision 3: Make `activity` the reference feature and nest `voice` under it

**Decision**: Build `features/activity/` as the first full domain feature and place all voice-specific UI, hooks, and adapters under `features/activity/voice/`.

**Rationale**: Activity is the core business flow and the most architecturally important path in the app. Solving activity plus voice establishes the canonical pattern for domain model ownership, service wrapping, mapping, validation, and shared UI.

**Alternatives considered**:
- Make voice a standalone feature: rejected because it would duplicate or bypass activity validation and submission rules.
- Defer activity until later: rejected because other features should follow a proven domain extraction pattern first.

## Decision 4: Use `ActivityDraft` as the canonical write model

**Decision**: Introduce a single activity draft model owned by the activity feature. Manual input updates the draft directly, and voice parsing only produces validated partial draft patches.

**Rationale**: The current implementation pre-fills ad hoc local state from parsed voice data. A draft model formalizes the merge boundary, prevents duplicated write logic, and guarantees that both manual and voice-assisted flows end at the same submit command.

**Alternatives considered**:
- Continue mutating raw component state from voice responses: rejected because it preserves hidden coupling and makes validation order unclear.
- Submit voice data directly after parsing: rejected because it bypasses user review and violates the single-pipeline rule.

## Decision 5: Migrate lower-risk feature modules before analytics, reports, admin, and auth

**Decision**: After shell/shared/activity/voice, migrate dashboard, profile, and recurring activities before analytics, reports, admin, and auth.

**Rationale**: Dashboard/profile/recurring activities have narrower mutation or transformation surface areas than the later modules. This lets the team validate the new feature architecture repeatedly before tackling more sensitive areas.

**Alternatives considered**:
- Migrate features in arbitrary UI order: rejected because it ignores risk concentration.
- Move admin/auth early for completeness: rejected because they have the highest blast radius if broken.

## Decision 6: Use explicit mapper modules for backend-to-frontend conversions

**Decision**: Extract conversion logic (`BackendActivity` to UI activity, status maps, team maps, project maps) into feature-owned mapper modules rather than leaving them inline in orchestration components.

**Rationale**: The current file hides important domain translation rules inside `ActivityReportApp.tsx`. Typed mapper modules make those rules testable, reusable, and visible, especially for analytics/reports/admin flows that depend on consistent mapping.

**Alternatives considered**:
- Leave mappings inline until the very end: rejected because multiple features would then depend on legacy internals longer.
- Push mappings into shared immediately: rejected because many mappings are still feature-specific and should not pollute the shared layer.

## Decision 7: Preserve behavior using temporary compatibility adapters during transition

**Decision**: Allow short-lived compatibility wrappers and container hooks where needed, as long as they only preserve behavior and point toward the final ownership boundary.

**Rationale**: Incremental refactoring requires seams. Temporary adapters reduce merge risk and avoid big-bang moves while still enabling architecture progress.

**Alternatives considered**:
- Forbid temporary adapters entirely: rejected because it would force larger cutovers.
- Keep long-lived dual ownership: rejected because it would leave the architecture half-migrated indefinitely.

## Research Notes

- The local bash-based Spec Kit helper scripts could not be executed in this environment because bash/WSL was unavailable. Planning artifacts were created directly from the active spec, constitution, repo structure, and current codebase context.
