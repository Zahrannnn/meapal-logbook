# Frontend Fixes Report - Meapal LogBook

**Date:** 2026-03-25
**Backend Branch:** `bugfix/backend-testing-fixes`
**Status:** Backend is deployed and ready. Frontend changes required.

---

## Summary

The backend has been updated to support **Project Members** (assigning individual users to projects). The API now accepts `memberIds` in create/update requests and returns `members` in project responses. The frontend needs updates to:

1. Send `memberIds` when creating/updating projects
2. Pre-select previously assigned members when editing
3. Display assigned members in project details view
4. Add search/filter for team members in the assignment list

---

## FIX 1: Send `memberIds` in project create/update API calls

### Problem
When the user selects team members in the project form and clicks "Create/Update Project", the `assignedMembers` data is collected but **never sent** to the API. The `handleSaveProject` function in `ActivityReportApp.tsx` sends `teamIds` but not `memberIds`.

### File: `src/components/generated/ActivityReportApp.tsx`

**Lines 546-557** (update call) - Add `memberIds`:
```typescript
// BEFORE:
await projectsApi.update(parseInt(editingProject.id), {
  name: projectData.name,
  description: projectData.description,
  status: projectStatusToBackend[projectData.status],
  priority: projectData.priority,
  startDate: projectData.startDate,
  endDate: projectData.endDate,
  progress: projectData.progress,
  teamIds,
  projectType: projectData.projectType,
  customerName: projectData.customerName || null,
});

// AFTER: Add memberIds line
await projectsApi.update(parseInt(editingProject.id), {
  name: projectData.name,
  description: projectData.description,
  status: projectStatusToBackend[projectData.status],
  priority: projectData.priority,
  startDate: projectData.startDate,
  endDate: projectData.endDate,
  progress: projectData.progress,
  teamIds,
  memberIds: (projectData.assignedMembers || []).map(id => parseInt(id)),  // <-- ADD THIS LINE
  projectType: projectData.projectType,
  customerName: projectData.customerName || null,
});
```

**Lines 559-570** (create call) - Same change:
```typescript
// AFTER: Add memberIds line
await projectsApi.create({
  name: projectData.name,
  description: projectData.description,
  ownerId: backendUserId,
  status: projectStatusToBackend[projectData.status],
  priority: projectData.priority,
  startDate: projectData.startDate,
  endDate: projectData.endDate,
  teamIds,
  memberIds: (projectData.assignedMembers || []).map(id => parseInt(id)),  // <-- ADD THIS LINE
  projectType: projectData.projectType,
  customerName: projectData.customerName || null,
});
```

### File: `src/lib/api.ts`

**Lines 465-476** - Add `memberIds` to the create type:
```typescript
create: async (data: {
  name: string;
  description?: string;
  ownerId: number;
  status?: string;
  priority?: string;
  startDate: string;
  endDate?: string;
  teamIds?: number[];
  memberIds?: number[];   // <-- ADD THIS LINE
  projectType?: 'prospected' | 'customer' | 'internal';
  customerName?: string | null;
}) => { ... }
```

**Line 484** - Add `memberIds` to the update type:
```typescript
update: async (id: number, data: Partial<BackendProject & { teamIds?: number[]; memberIds?: number[] }>) => { ... }
//                                                                                  ^^^^^^^^^^^^^^^^^^ ADD THIS
```

---

## FIX 2: Pre-select members when editing a project

### Problem
When editing a project, the `assignedMembers` field is hardcoded to `[]` instead of loading from the backend response. Previously assigned members appear unchecked.

### File: `src/components/generated/ActivityReportApp.tsx`

**Line 137** - Load members from backend response:
```typescript
// BEFORE:
assignedMembers: [],

// AFTER:
assignedMembers: project.members
  ? project.members.map((m: any) => m.user.id.toString())
  : [],
```

### File: `src/lib/api.ts`

**Lines 85-102** - Add `members` to `BackendProject` interface:
```typescript
export interface BackendProject {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  status: 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectType: 'prospected' | 'customer' | 'internal';
  customerName: string | null;
  startDate: string;
  endDate: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
  owner: { id: number; firstName: string; lastName: string; email: string };
  teams: { team: { id: number; name: string } }[];
  members?: {                          // <-- ADD THIS BLOCK
    projectId: number;
    userId: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      team: { id: number; name: string } | null;
    };
  }[];
  _count?: { activities: number };
}
```

---

## FIX 3: Display assigned members in project details view

### Problem
The `ProjectDetailModal` shows "Assigned Teams" but has no section for "Assigned Members". The backend now returns a `members` array in the project response.

### File: `src/components/generated/ProjectDetailModal.tsx`

**After line 297** (after the Assigned Teams section closing `</div>` and `)}`) - Add an Assigned Members section:

```tsx
{/* Assigned Members */}
{project.members && project.members.length > 0 && (
  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Users className="w-5 h-5 text-violet-600" />
      Assigned Members ({project.members.length})
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {project.members.map((member: any) => (
        <div
          key={member.userId}
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
            {member.user.firstName[0]}{member.user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {member.user.firstName} {member.user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
          </div>
          {member.user.team && (
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">
              {member.user.team.name}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

---

## FIX 4: Add search/filter for team members in project form

### Problem
When assigning team members to a project, there is no way to search or filter members by name. This makes it difficult when there are many team members.

### File: `src/components/generated/ProjectModal.tsx`

**Step 1:** Add a search state variable (line ~33, inside the component):
```typescript
const [memberSearch, setMemberSearch] = useState('');
```

**Step 2:** Reset search when form opens (inside the `useEffect` at line 48, add):
```typescript
setMemberSearch('');
```

**Step 3:** Filter available users by search (after line 93):
```typescript
// Existing line:
const availableUsers = users.filter(u => formData.teams?.includes(u.team));

// ADD this line after it:
const filteredUsers = memberSearch.trim()
  ? availableUsers.filter(u =>
      u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(memberSearch.toLowerCase())
    )
  : availableUsers;
```

**Step 4:** Add search input before the member list (line ~316, inside the Member Assignment section, before the `<div className="max-h-64">`):
```tsx
<input
  type="text"
  placeholder="Search members by name or email..."
  value={memberSearch}
  onChange={(e) => setMemberSearch(e.target.value)}
  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-3"
/>
```

**Step 5:** Change `availableUsers` to `filteredUsers` in the map at line 317:
```typescript
// BEFORE:
availableUsers.map(user => {

// AFTER:
filteredUsers.map(user => {
```

**Step 6:** Update the empty state message:
```typescript
// BEFORE:
{availableUsers.length === 0 ? <p>No members available from selected teams</p>

// AFTER:
{filteredUsers.length === 0 ? <p>{memberSearch ? 'No members found matching search' : 'No members available from selected teams'}</p>
```

---

## Backend API Reference (already deployed)

### Project Create
```
POST /api/v1/projects
Body: {
  name: string,
  description?: string,
  ownerId: number,
  status?: string,
  priority?: string,
  startDate: string,
  endDate?: string,
  teamIds?: number[],
  memberIds?: number[],           // <-- NEW: array of user IDs
  projectType?: string,
  customerName?: string
}
```

### Project Update
```
PATCH /api/v1/projects/:id
Body: {
  ...same fields as create (all optional)...
  memberIds?: number[],           // <-- NEW: replaces all current members
}
```

### Project Response (GET)
```json
{
  "data": {
    "id": 20,
    "name": "testkkk",
    "teams": [{ "team": { "id": 3, "name": "Development" } }],
    "members": [                      // <-- NEW FIELD
      {
        "projectId": 20,
        "userId": 8,
        "user": {
          "id": 8,
          "firstName": "Ahmed",
          "lastName": "kamal",
          "email": "aka@corelia.ai",
          "team": { "id": 3, "name": "Development" }
        }
      }
    ],
    ...
  }
}
```

**Note:** `memberIds` accepts both numbers `[8, 11]` and strings `["8", "11"]` - the backend coerces strings to numbers automatically.

---

## Other Frontend Bugs (from testing rounds)

These bugs were identified during testing but are frontend-only issues:

### BUG-013: Wrong team displayed for users
- **File:** `ActivityReportApp.tsx` line ~108
- **Problem:** `teamIdToType` mapping doesn't match actual team IDs from the database
- **Impact:** Users may show wrong team names (e.g., "App Dev" instead of "Data Science")
- **Fix:** Update `teamIdToType` to match the actual team IDs in the database, or fetch team mappings dynamically from `GET /api/v1/teams`

### BUG-014: PM role reverts to "employee"
- **File:** `ActivityReportApp.tsx` line ~149
- **Problem:** `convertBackendUserToFrontend` maps all non-admin roles to `'employee'` instead of properly mapping `'project_manager'` to `'manager'`
- **Fix:**
```typescript
// BEFORE:
role: user.role === 'admin' ? 'admin' : 'employee',

// AFTER:
role: user.role === 'admin' ? 'admin' : user.role === 'project_manager' ? 'manager' : 'employee',
```

---

## Testing Checklist

After implementing the fixes, verify:

- [ ok ] **Create project with members**: Create a new project, select teams, select members, save. Verify `memberIds` appears in the Network Payload.
- [ ok ] **View project details**: Click the eye icon on a project. Verify "Assigned Members" section appears with correct names.
- [ ok ] **Edit project pre-selection**: Edit a project that has members. Verify previously assigned members appear checked.
- [ ok ] **Update members**: Edit a project, add/remove members, save. Verify changes persist after refresh.
- [ ok ] **Search members**: In the project form, type a name in the member search. Verify the list filters correctly.
- [ ok ] **Team type mapping**: Verify users show correct team names (BUG-013 fix).
- [ ok ] **PM role display**: Login as project_manager. Verify role shows as "Manager" not "Employee" (BUG-014 fix).
- [ ok ] **Session persistence**: Perform multiple actions as PM without getting logged out (backend fix: token now 8h).
- [ ok ] **Date validation**: Try creating a project with end date before start date. Should show error.
- [ ok ] **Activity overlap**: Try creating two activities with overlapping times. Should show error.
- [ ] **CSV upload**: Upload a CSV file with BOM encoding. Should parse correctly.
- [ ok ] **Competency description**: Create/edit a competency with description. Verify it saves and displays.
