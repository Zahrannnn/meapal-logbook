# Contract: Migration Interfaces

## Purpose

Define the stable interfaces used during the incremental migration so behavior remains unchanged while modules move.

## Central API Contract

- `src/lib/api.ts` remains the single transport/auth boundary during the refactor.
- Feature wrappers call centralized API modules such as:
  - `authApi`
  - `activitiesApi`
  - `projectsApi`
  - `usersApi`
  - `teamsApi`
  - `competenciesApi`
  - `recurrenceActivitiesApi`
  - `reportsApi`
  - `skillsApi`
  - `voiceApi`

## Feature Service Wrapper Contract

Each feature may expose wrappers shaped like:

```ts
type FeatureService = {
  [operationName: string]: (...args: never[]) => Promise<unknown>;
};
```

Rules:
- wrappers adapt centralized API calls into feature-specific method names and payload shapes
- wrappers may compose mapper functions
- wrappers may not manage tokens directly

## Activity Submit Pipeline Contract

The canonical write flow is:

1. user edits `ActivityDraft`
2. feature validates draft
3. feature normalizes draft to backend payload
4. feature submits via activity service wrapper
5. feature refreshes dependent activity state

No alternate path may bypass this contract.

## Voice Integration Contract

The voice flow is:

1. voice recorder captures audio blob
2. voice service uploads blob through centralized `voiceApi`
3. voice adapter converts `ParsedVoiceActivity` into validated partial `ActivityDraft` patch
4. patch merges into activity form state
5. user reviews and submits through the canonical activity pipeline

Rules:
- invalid parsed fields are dropped or flagged
- voice never submits directly to activities endpoints
- manual entry remains available if any voice step fails

## Compatibility Adapter Contract

During transition, temporary adapters may:
- delegate old props into new feature entry points
- preserve legacy imports while modules move
- maintain behavior while ownership changes

Temporary adapters may not:
- introduce new business logic
- become permanent hidden dependencies
- duplicate activity validation or submit logic
