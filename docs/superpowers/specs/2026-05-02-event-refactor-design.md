# Design Spec: Unified Event and Post Refactoring

## 1. Overview
The goal of this refactoring is to simplify the codebase by removing the redundant `activities` table and consolidating all "activity" related concepts under the term "event". Additionally, the `NewsCard` component will be renamed to `PostCard` to serve as a generic card for news, achievements, and events.

## 2. Rationale
- The `activities` table is redundant as event information is already handled by `posts` (for details) and `timeline_events` (for scheduling).
- "Event" is a more standard and clearer term than "Activity" in this context.
- Consolidating UI cards into a single `PostCard` reduces code duplication and ensures a consistent design system.

## 3. Detailed Changes

### 3.1 Database (MySql.sql)
- **Delete Table**: Remove the `activities` table definition and its `INSERT` statements.
- **Update Categories**:
    - Rename `activity_annual` page type to `event_annual`.
    - Rename `activity_non_annual` page type to `event_non_annual`.
- **Refactor Foreign Keys**: Ensure all foreign keys referencing `categories` remain intact but reflect the new nomenclature.

### 3.3 Backend (Node.js/Express)
- **File Cleanup**:
    - Delete `backend/controllers/activitiesController.js`.
    - Delete `backend/routes/activities.js`.
- **Server Configuration**:
    - Remove the `/api/activities` route from `backend/server.js`.
- **Global Keyword Replacement**:
    - Replace `activity` with `event` (case-sensitive: `Activity` -> `Event`, `activities` -> `events`).
    - Update `postController.js` to handle `event_annual` and `event_non_annual` filters.
- **API Renaming**: Rename `activitiesAPI` to `eventsAPI` in the frontend and backend references.

### 3.4 Frontend (React)
- **Component Consolidation**:
    - Rename `src/components/NewsCard` to `src/components/PostCard`.
    - Delete `src/components/ActivityCard`.
    - Delete `src/components/AchievementCard` (logic will be moved to `PostCard` if possible).
- **Screen Refactoring**:
    - Rename `src/screens/User/Activity` folder to `src/screens/User/Event`.
    - Rename all internal components (e.g., `AnnualActivityDetail` -> `AnnualEventDetail`).
    - Update logic to fetch data using the updated `page_type` (e.g., `event_annual`).
- **Global Replacement**:
    - Replace all `activity` URL paths with `event` paths (e.g., `/activity/:slug` -> `/event/:slug`).
    - Update all CSS classes from `.activity-` to `.event-`.
    - Update all state variables (e.g., `activities` -> `events`).

## 4. Risks and Mitigations
- **Broken Links**: Changing URL paths from `/activity` to `/event` will break existing bookmarks.
    - *Mitigation*: Since this is in development, we will perform a clean cut.
- **Naming Conflicts**: Ensuring that standard UML terms like "Activity Diagram" are handled carefully (user requested global change, so we follow that).

## 5. Success Criteria
- The `activities` table is removed from the DB.
- All "activities" in the UI are now called "events".
- The system correctly displays event posts using the new `PostCard` component.
- No "activity" keyword exists in the functional codebase.
