# API Refactoring and Teams Read-Only Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up unused frontend API methods and enforce read-only access for the `teams` resource in both frontend and backend.

**Architecture:** 
- Frontend: Refactor `api.js` to expose only necessary methods, using the existing `apiFetch` utility.
- Backend: Remove write-operation handlers from `teamsController.js` and their corresponding routes in `routes/teams.js`.
- Documentation: Update `API-DOCUMENTATION.md` to reflect the current state of the API.

**Tech Stack:** JavaScript (React/Vite), Node.js (Express), SQL Server.

---

### Task 1: Refactor Frontend `api.js`

**Files:**
- Modify: `my-app/src/services/api.js`

- [ ] **Step 1: Update `teamsAPI` to be read-only**
Remove `create`, `update`, and `delete` methods. Keep `getAll` and `getById`.
- [ ] **Step 2: Clean up other unused API methods**
Remove `usersAPI.getById`, `usersAPI.delete`, `categoriesAPI.getById`, `contactAPI.getById`, `postTemplatesAPI.update`, and `postTemplatesAPI.delete`.
- [ ] **Step 3: Verify no syntax errors**
Ensure the exported objects are correctly structured.
- [ ] **Step 4: Commit**
```bash
git add my-app/src/services/api.js
git commit -m "refactor(frontend): clean up unused API methods and set teams to read-only"
```

### Task 2: Clean up Backend `teamsController.js`

**Files:**
- Modify: `backend/controllers/teamsController.js`

- [ ] **Step 1: Remove write operation handlers**
Delete `createTeam`, `updateTeam`, and `deleteTeam` functions.
- [ ] **Step 2: Clean up unused imports and helpers**
Remove `sendBadRequest`, `hasAffectedRows` and other helpers if they are no longer used in this file.
- [ ] **Step 3: Commit**
```bash
git add backend/controllers/teamsController.js
git commit -m "refactor(backend): remove write operations for teams in controller"
```

### Task 3: Clean up Backend `routes/teams.js`

**Files:**
- Modify: `backend/routes/teams.js`

- [ ] **Step 1: Remove POST, PUT, DELETE routes**
Only keep `router.get('/')` and `router.get('/:id')`.
- [ ] **Step 2: Commit**
```bash
git add backend/routes/teams.js
git commit -m "refactor(backend): remove write operation routes for teams"
```

### Task 4: Update `API-DOCUMENTATION.md`

**Files:**
- Modify: `backend/API-DOCUMENTATION.md`

- [ ] **Step 1: Remove Teams POST/PUT/DELETE sections**
Remove all documentation related to modifying teams.
- [ ] **Step 2: Add notes for other unused endpoints**
Add `*(Hiện không sử dụng trên Frontend)*` to endpoints that were removed from `api.js`.
- [ ] **Step 3: Commit**
```bash
git add backend/API-DOCUMENTATION.md
git commit -m "docs: update API documentation to match refactored codebase"
```
