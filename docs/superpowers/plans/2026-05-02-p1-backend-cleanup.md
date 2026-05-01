# Sub-Project 1: Backend Cleanup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xóa tất cả file rác (scratch/test files) khỏi backend, giữ server hoạt động bình thường.

**Architecture:** Đơn giản — xóa file, kiểm tra server không bị ảnh hưởng.

**Tech Stack:** Node.js, Express, PowerShell (Windows)

---

### Task 1: Xóa file scratch và test trong backend

**Files:**
- Delete: `backend/scratch_check_dbs.js`
- Delete: `backend/scratch_check_tables.js`
- Delete: `backend/scratch_db_check.js`
- Delete: `backend/scratch_fix_featured.js`
- Delete: `backend/scratch_run_seed.js`
- Delete: `backend/test-sqlserver.js`

- [ ] **Step 1: Xác nhận không có file nào import scratch files**

```powershell
Select-String -Path "d:\web-lcd\backend\**\*.js" -Pattern "scratch_|test-sqlserver" -AllMatches
```

Expected: Không có kết quả nào (các file này không được import bởi server.js hay routes).

- [ ] **Step 2: Xóa tất cả file scratch và test**

```powershell
Remove-Item "d:\web-lcd\backend\scratch_check_dbs.js"
Remove-Item "d:\web-lcd\backend\scratch_check_tables.js"
Remove-Item "d:\web-lcd\backend\scratch_db_check.js"
Remove-Item "d:\web-lcd\backend\scratch_fix_featured.js"
Remove-Item "d:\web-lcd\backend\scratch_run_seed.js"
Remove-Item "d:\web-lcd\backend\test-sqlserver.js"
```

- [ ] **Step 3: Xác nhận đã xóa**

```powershell
Get-ChildItem "d:\web-lcd\backend" -Filter "scratch_*.js"
Get-ChildItem "d:\web-lcd\backend" -Filter "test-*.js"
```

Expected: Không có file nào được liệt kê.

- [ ] **Step 4: Kiểm tra server.js không import các file đã xóa**

```powershell
Select-String -Path "d:\web-lcd\backend\server.js" -Pattern "scratch|test-sqlserver"
```

Expected: Không có kết quả.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(backend): remove scratch and test files"
```
