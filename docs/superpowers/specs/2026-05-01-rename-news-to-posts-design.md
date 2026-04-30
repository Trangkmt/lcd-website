# Spec: Rename News to Posts

## 1. Goal Description
Rename the existing `news` table to `posts` across the entire full-stack application (Database, Backend API, Frontend connections, and Documentation) to better reflect the generic nature of the content (which could include news, announcements, activities, etc.).

## 2. Scope

### 2.1 Database & Documentation
- **File: `MySql.sql`**
  - Rename table `news` to `posts`.
  - Rename foreign keys and indexes (e.g., `idx_news_category` -> `idx_posts_category`).
  - Change default `page_type` values from `'news'` to `'post'`.
- **Files: `docs/Database_Design.md`, `newfile.js`, and Diagram files**
  - Update all references from `news` table/module to `posts`.

### 2.2 Backend (Express.js)
- **Routes:** 
  - Rename `backend/routes/news.routes.js` to `backend/routes/posts.routes.js`.
  - Update main routing in `backend/server.js` from `/api/news` to `/api/posts`.
- **Controllers:**
  - Rename `backend/controllers/newsController.js` to `backend/controllers/postController.js`.
  - Update controller variable names internally from `news` to `post/posts`.
- **API Docs:**
  - Update `backend/API-DOCUMENTATION.md` to change all `/news` endpoints to `/posts`.

### 2.3 Frontend (React/Vite)
- **API Service:**
  - Modify `my-app/src/services/api.js`.
  - Change `newsAPI` endpoint paths from `/news` to `/posts`. 
  - Keep component names intact but ensure they call the updated API endpoints correctly.
  
## 3. Assumptions & Constraints
- The frontend UI components (e.g., `NewsCard.jsx`, `News.jsx`) do not need to be renamed at this stage to avoid massive UI refactoring, only their data-fetching logic is updated.
- No historical data migration scripts are needed beyond updating the schema in `MySql.sql` since the database can be rebuilt from the SQL script.

## 4. Verification Plan
- Confirm the `MySql.sql` can execute successfully without errors.
- Confirm backend server starts without missing module errors.
- Confirm frontend builds without issues.
