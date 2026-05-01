# Unified Event and Post Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the codebase by removing the redundant `activities` table, renaming all "activity" concepts to "event", and consolidating UI cards into a generic `PostCard`.

**Architecture:**
- **Database**: Remove `activities` table, update `categories` page types.
- **Backend**: Delete activity-specific code, global rename.
- **Frontend**: Rename `NewsCard` to `PostCard`, consolidate cards, rename screens and routes.

---

### Task 1: Database Migration & Schema Cleanup
**Files:**
- Modify: `d:\web-lcd\MySql.sql`

- [ ] **Step 1: Remove activities table definition**
Modify `MySql.sql` to remove the `activities` table and its initial data.
```sql
-- Remove lines related to activities table
DROP TABLE IF EXISTS activities; -- (Around line 19)
-- Remove the entire table creation and inserts (Lines 331-362)
```

- [ ] **Step 2: Update category page types**
Update the `INSERT INTO categories` statements to use `event_annual` and `event_non_annual`.
```sql
-- Lines 164-166, 169, 171-176
-- Replace 'activity_non_annual' with 'event_non_annual'
-- Replace 'activity_annual' with 'event_annual'
```

- [ ] **Step 3: Remove activity-related indexes**
Remove lines 424-426 in `MySql.sql`.

- [ ] **Step 4: Apply changes to DB**
Run the SQL script to refresh the database (Warning: This will reset data).

---

### Task 2: Backend Code Cleanup
**Files:**
- Delete: `backend/controllers/activitiesController.js`
- Delete: `backend/routes/activities.js`
- Modify: `backend/server.js`, `backend/controllers/postController.js`

- [ ] **Step 1: Delete files**
Delete `backend/controllers/activitiesController.js` and `backend/routes/activities.js`.

- [ ] **Step 2: Update server.js**
Remove activities route mounting and imports.

- [ ] **Step 3: Update postController.js**
Update logic to handle the new `event_annual` and `event_non_annual` page types.

- [ ] **Step 4: Global Rename in Backend**
Search and replace `activity` -> `event` and `activities` -> `events` in all backend files.

---

### Task 3: Frontend Component Consolidation
**Files:**
- Rename/Modify: `my-app/src/components/NewsCard` -> `my-app/src/components/PostCard`
- Delete: `my-app/src/components/ActivityCard`, `my-app/src/components/AchievementCard`
- Modify: `my-app/src/components/index.js`

- [ ] **Step 1: Rename NewsCard to PostCard**
Rename folder and files, update component name to `PostCard`.

- [ ] **Step 2: Update PostCard props**
Ensure it can handle news, achievements, and events (mapping different field names if necessary).

- [ ] **Step 3: Delete redundant cards**
Delete `ActivityCard` and `AchievementCard` folders.

- [ ] **Step 4: Update component index**
Update `src/components/index.js` to export `PostCard`.

---

### Task 4: Frontend Screen and Route Refactor
**Files:**
- Rename Folder: `my-app/src/screens/User/Activity` -> `my-app/src/screens/User/Event`
- Modify: `my-app/src/main.jsx`, `my-app/src/services/api.js`

- [ ] **Step 1: Rename Screen folder and files**
Rename `Activity` to `Event` and update all internal file/component names.

- [ ] **Step 2: Update api.js**
Remove `activitiesAPI`, rename `newsAPI` to `postsAPI`.

- [ ] **Step 3: Update routing in main.jsx**
Change `/activity` paths to `/event` and update imports.

- [ ] **Step 4: Global Rename in Frontend**
Search and replace `activity` -> `event` and `activities` -> `events` in all frontend files.
Update CSS classes from `.activity-` to `.event-`.
