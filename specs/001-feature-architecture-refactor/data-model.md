# Data Model: Feature-Based Architecture Refactor

## Overview

This refactor does not introduce new backend entities. It formalizes frontend-owned models and ownership boundaries so that migration work can proceed without changing behavior.

## Core Frontend Models

### AppShellState

**Purpose**: Own top-level application composition state only.

**Fields**
- `currentRouteView`: `'dashboard' | 'analytics' | 'reports' | 'admin'`
- `isMobileMenuOpen`: `boolean`
- `isProfileOpen`: `boolean`
- `isForgotPasswordOpen`: `boolean`
- `isGlobalLoading`: `boolean`
- `globalError`: `string | null`

**Rules**
- Must not contain feature domain records or mutation payloads.
- May coordinate shell-level modal visibility only until feature-owned modal state is fully migrated.

### SessionState

**Purpose**: Represent authenticated user bootstrap state.

**Fields**
- `currentUser`: `User | null`
- `backendUserId`: `number | null`
- `authStatus`: `'checking' | 'authenticated' | 'anonymous'`

**Rules**
- Token storage and request auth remain centralized in `src/lib/api.ts`.
- Feature modules consume session state but do not manage transport-level auth tokens.

### ActivityDraft

**Purpose**: Canonical frontend write model for manual and voice-assisted activity entry.

**Fields**
- `title`: `string`
- `description`: `string`
- `startTime`: `string`
- `endTime`: `string`
- `projectId`: `string`
- `competencies`: `CompetencyTag[]`
- `status`: `'completed' | 'in-progress' | 'pending-approval' | 'blocked'`
- `notes`: `string`
- `recurrence`: `RecurrenceSettings`

**Validation**
- Required: `title`, `projectId`, `startTime`, `endTime`
- `status` must map to supported backend status values
- Voice-prefill may only update validated fields
- Recurrence payload must normalize to the backend's expected `frequency`, `interval`, `daysOfWeek`, `startDate`, and `endDate`

**State transitions**
- `empty` -> `editing`
- `editing` -> `validated`
- `validated` -> `submitted`
- `submitted` -> `reset`
- `editing` -> `prefilled-from-voice`

### VoiceParsePatch

**Purpose**: Safe partial patch derived from `ParsedVoiceActivity`.

**Fields**
- `title?`: `string`
- `description?`: `string`
- `notes?`: `string`
- `projectId?`: `string`
- `startTime?`: `string`
- `endTime?`: `string`
- `status?`: `ActivityDraft['status']`
- `warnings`: `string[]`

**Rules**
- Produced only after adapter-level sanitation and validation
- Invalid fields are dropped rather than forced into the draft
- Never submitted directly to backend services

### FeatureService Contract

**Purpose**: Domain-facing wrapper around centralized API transport.

**Fields**
- `name`: feature identifier
- `methods`: typed feature operations
- `dependencies`: centralized API modules used

**Rules**
- Services may compose transport calls and mappers
- Services may not instantiate their own HTTP clients or token stores

## Shared Domain Contracts

### User
- Shared across auth, dashboard, reports, admin, and profile
- Canonical frontend role mapping must remain stable

### Project
- Shared across activity, dashboard, reports, admin, and analytics
- Includes status, priority, teams, and assigned members

### ActivityEntry
- Shared read model for dashboard, analytics, reports, and recurring activities
- Derived from backend payloads through typed mapper functions

### Team
- Shared across admin, analytics, reports, and dashboard filters

### Competency
- Shared across activity, profile, admin, and reports

## Relationships

- `SessionState.currentUser` references `User`
- `ActivityDraft.projectId` references `Project.id`
- `ActivityEntry.project` references `Project`
- `ActivityEntry.user` references `User`
- `VoiceParsePatch` merges into `ActivityDraft`
- `RecurringActivities` reuse activity entities plus recurrence settings

## Ownership Mapping

- `app/`: `AppShellState`, route composition, providers
- `entities/`: `User`, `Project`, `ActivityEntry`, `Team`, `Competency`, shared enums/constants
- `features/activity/`: `ActivityDraft`, recurrence settings, submission commands, activity mappers
- `features/activity/voice/`: `VoiceParsePatch`, voice adapter, recorder hook, upload orchestration
- other `features/*`: feature-local view models, filters, mutation commands, and feature services

## Migration Notes

- Existing inline mappers in `ActivityReportApp.tsx` become typed mapper modules.
- Existing form state in `ActivityReportApp.tsx` becomes `ActivityDraft`.
- Existing `ParsedVoiceActivity` stays at the centralized API boundary, but the feature owns the safe conversion from API shape to draft patch.
