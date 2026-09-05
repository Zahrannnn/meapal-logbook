# Migration Checklist: Feature-Based Architecture Refactor

**Purpose**: Validate that the specification is complete, clear, and review-ready for an incremental frontend refactor with phased migration and risk controls
**Created**: 2026-04-05
**Feature**: [spec.md](../spec.md)

**Note**: This checklist validates the quality of the written requirements for migration planning. It does not verify implementation behavior.

## Requirement Completeness

- [x] CHK001 Are app shell extraction boundaries explicitly defined, including layout, navigation, auth gate, loading/error states, and modal boundaries? [Completeness, Spec §Clarifications; Spec §User Story 1; Spec §FR-002a]
- [x] CHK002 Are shared layer admission and exclusion rules specified clearly enough to prevent feature leakage during migration? [Completeness, Spec §User Story 2; Spec §FR-003; Spec §FR-015]
- [x] CHK003 Are activity domain requirements defined for unified draft ownership, validation, normalization, and submission across manual and voice entry? [Completeness, Spec §User Story 3; Spec §FR-004; Spec §FR-017]
- [x] CHK004 Does the spec define voice activity as a sub-feature under activity rather than a parallel domain? [Completeness, Spec §Clarifications; Spec §FR-013]
- [x] CHK005 Are migration targets explicitly listed for dashboard, profile, recurring activities, analytics, reports, admin, and auth? [Completeness, Spec §User Story 4; Spec §FR-001]

## Requirement Clarity

- [x] CHK006 Is the extraction order out of `ActivityReportApp.tsx` stated clearly enough to guide phased decomposition? [Clarity, Spec §Clarifications]
- [x] CHK007 Are directory ownership rules for `app/`, `shared/`, `features/`, and `entities/` specific enough to resolve ambiguous file placement decisions? [Clarity, Spec §Clarifications; Spec §FR-014; Spec §FR-015; Spec §FR-016]
- [ ] CHK008 Is the required verification scope for "functional after every phase" defined beyond build/lint so reviewers can determine the minimum regression checks for each increment? [Clarity, Gap, Spec §FR-009; Spec §SC-005; Spec §SC-006; Spec §SC-012]

## Requirement Consistency

- [x] CHK009 Do the API-layer requirements consistently preserve the centralized client in `src/lib/api.ts` while moving feature-specific calls behind feature services? [Consistency, Spec §FR-007; Spec §Key Entities]
- [x] CHK010 Are the shell-only responsibilities in `app/` consistent with the requirement that business logic, mappings, and validation move into features? [Consistency, Spec §Clarifications; Spec §FR-002; Spec §FR-014]
- [x] CHK011 Do voice integration requirements consistently route parsed data through the same activity pipeline instead of creating a duplicate submission path? [Consistency, Spec §Clarifications; Spec §FR-004; Spec §FR-017; Spec §SC-013]

## Scenario Coverage

- [x] CHK012 Are requirements present for the primary migration surfaces: shell extraction, shared foundations, activity extraction, and remaining feature migrations? [Coverage, Spec §User Stories 1-5]
- [x] CHK013 Are AI voice parsing exception and recovery scenarios addressed, including invalid fields, microphone denial, and fallback to manual entry? [Coverage, Spec §User Story 3; Spec §Edge Cases; Spec §FR-005; Spec §FR-006]
- [ ] CHK014 Are auth migration recovery scenarios defined clearly enough, including session expiry, failed auth bootstrap, and rollback expectations when auth refactoring is deferred to a later phase? [Coverage, Gap, Spec §FR-018; Spec §Assumptions]

## Acceptance Criteria Quality

- [x] CHK015 Are the phase-one shell outcomes measurable enough to confirm the lowest-risk first phase completed without reabsorbing domain logic? [Acceptance Criteria, Spec §User Story 1; Spec §SC-012]
- [x] CHK016 Are activity and voice success criteria measurable enough to validate the shared pipeline goal objectively? [Acceptance Criteria, Spec §SC-002; Spec §SC-003; Spec §SC-004; Spec §SC-013]
- [ ] CHK017 Are the per-phase verification requirements measurable for mid-refactor feature migrations, not just phase one and final cleanup? [Measurability, Gap, Spec §FR-009; Spec §SC-005; Spec §SC-006]

## Dependencies & Assumptions

- [x] CHK018 Are assumptions about unchanged backend API contracts and preserved auth behavior documented so migration scope stays bounded? [Assumption, Spec §Assumptions]
- [x] CHK019 Is the dependency on the external AI voice service documented with clear boundaries on what the frontend may reorganize versus what must remain behaviorally unchanged? [Dependency, Spec §Assumptions]
- [x] CHK020 Are high-risk areas explicitly identified so later planning can stage them after lower-risk migrations? [Completeness, Spec §FR-018; Spec §Clarifications]

## Notes

- Passes: app shell extraction, shared layer rules, activity domain refactor, voice activity integration, migration scope for dashboard/profile/recurring/analytics/reports/admin/auth, centralized API ownership, and AI voice parsing risk handling are all covered in the spec.
- Gaps: the spec still under-defines the minimum regression checklist required after each non-final phase, and auth risk handling is only partially specified compared to the stronger coverage for AI voice parsing.
- Recommended follow-up before or during `/speckit.plan`: add a small phase-by-phase verification matrix and explicit auth recovery/rollback requirement language.
