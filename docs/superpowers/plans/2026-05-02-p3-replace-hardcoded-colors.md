# Sub-Project 3: Replace Hardcoded Colors — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay thế tất cả màu hardcode (#hex, rgb()) trong các file CSS và JSX bằng biến CSS từ `global.css`.

**Architecture:** 
- Thêm biến mới vào `global.css` nếu màu chưa có biến tương ứng.
- Thay thế từng file theo thứ tự ưu tiên.
- Ngoại lệ: `rgba()` với alpha channel được phép giữ lại (ví dụ `rgba(24, 53, 99, 0.1)`).

**Tech Stack:** CSS Custom Properties, Vanilla CSS, React JSX

**Đọc trước:** `docs/superpowers/specs/2026-05-02-codebase-cleanup-design.md` — Section 4 (mapping màu).

---

### Task 1: Thêm biến màu còn thiếu vào global.css

**Files:**
- Modify: `my-app/src/global.css`

- [ ] **Step 1: Thêm các biến màu mới cần thiết vào global.css**

Trong phần `/* Extended Project Colors */`, thêm:
```css
/* Info Colors - Extended */
--color-info-vivid: #2F80ED;
--color-info-tint-light: #F6FAFF;
--color-info-tint-soft: #E2ECFB;
--color-info-tint-medium: #C8DCFA;

/* Surface Colors - Extended */
--color-surface-lightest: #FAFCFF;
--color-surface-timeline: #DFE9F8;

/* State Colors - Extended */
--color-state-success-tint: #D2F7DF;
--color-state-danger-tint: #FFD7D9;
--color-state-warning-tint: #FFE4BF;
```

- [ ] **Step 2: Commit**

```bash
git add my-app/src/global.css
git commit -m "feat(css): add missing color variables to design system"
```

---

### Task 2: Thay hardcoded colors trong TimelineManagement.css

**Files:**
- Modify: `my-app/src/screens/Admin/TimelineManagement/TimelineManagement.css`

- [ ] **Step 1: Đọc file để xác định vị trí từng màu**

```powershell
Select-String -Path "d:\web-lcd\my-app\src\screens\Admin\TimelineManagement\TimelineManagement.css" -Pattern "#[0-9a-fA-F]{3,6}" -AllMatches | Select-Object LineNumber, Line
```

- [ ] **Step 2: Thay thế toàn bộ màu hardcode theo mapping**

| Hardcode | Thay bằng |
|----------|-----------|
| `#2F80ED` | `var(--color-info-vivid)` |
| `#F6FAFF`, `#F8FBFF`, `#FCFDFF`, `#FBFDFF` | `var(--color-info-tint-light)` |
| `#E2ECFB`, `#DFE9F8` | `var(--color-surface-timeline)` |
| `#BFD8FF`, `#C8DCFA` | `var(--color-info-tint-medium)` |
| `#D9E8FF` | `var(--color-info-tint-soft)` |
| `#3F6DA7` | `var(--color-primary-dark)` |
| `#207D45` | `var(--color-state-success-strong)` |
| `#EDF9F1` | `var(--color-state-success-soft)` |
| `#C43232` | `var(--color-state-danger-strong)` |
| `#FFD8D8`, `#FFF4F4` | `var(--color-state-danger-surface)` |
| `#A96513` | `var(--color-state-warning-strong)` |
| `#FFF7EC` | `var(--color-state-warning-soft)` |

- [ ] **Step 3: Kiểm tra không còn màu hardcode**

```powershell
Select-String -Path "d:\web-lcd\my-app\src\screens\Admin\TimelineManagement\TimelineManagement.css" -Pattern "#[0-9a-fA-F]{3,6}(?!\w)"
```

Expected: Không có kết quả (trừ các rgba() nếu có).

- [ ] **Step 4: Commit**

```bash
git add my-app/src/screens/Admin/TimelineManagement/TimelineManagement.css
git commit -m "refactor(css): replace hardcoded colors in TimelineManagement"
```

---

### Task 3: Thay hardcoded colors trong AdminButtons.css

**Files:**
- Modify: `my-app/src/screens/Admin/Styles/AdminButtons.css`

- [ ] **Step 1: Thay thế màu hardcode**

| Hardcode | Thay bằng |
|----------|-----------|
| `#DBE8FF` | `var(--color-surface-accent)` |
| `#dbe8ff` | `var(--color-surface-accent)` |
| `#FFD7D9` | `var(--color-state-danger-tint)` |
| `#D2F7DF` | `var(--color-state-success-tint)` |
| `#EEF1FF` | `var(--color-surface-accent)` |
| `#E2E7FF` | `var(--color-surface-accent)` |

- [ ] **Step 2: Commit**

```bash
git add my-app/src/screens/Admin/Styles/AdminButtons.css
git commit -m "refactor(css): replace hardcoded colors in AdminButtons"
```

---

### Task 4: Thay hardcoded colors trong Dashboard.css và Dashboard.jsx

**Files:**
- Modify: `my-app/src/screens/Admin/Dashboard/Dashboard.css`
- Modify: `my-app/src/screens/Admin/Dashboard/Dashboard.jsx`

- [ ] **Step 1: Thay trong Dashboard.css**

| Hardcode | Thay bằng |
|----------|-----------|
| `#2F80ED` | `var(--color-info-vivid)` |
| `#C8DCFA` | `var(--color-info-tint-medium)` |
| `#E2ECFB` | `var(--color-surface-timeline)` |
| `#F6FAFF` | `var(--color-info-tint-light)` |

- [ ] **Step 2: Thay trong Dashboard.jsx**

Tìm và thay các inline style colors:
| Hardcode | Thay bằng |
|----------|-----------|
| `#2C6BCC` | `var(--color-primary)` (hoặc CSS class) |
| `#1A4B8F` | `var(--color-primary-dark)` |
| `#8CB5F2` | `var(--color-info-tint-medium)` |
| `#888` | `var(--color-text-soft)` |

> **Lưu ý:** Trong JSX, inline style dùng cú pháp `style={{ color: 'var(--color-primary)' }}`.

- [ ] **Step 3: Commit**

```bash
git add my-app/src/screens/Admin/Dashboard/
git commit -m "refactor(css): replace hardcoded colors in Dashboard"
```

---

### Task 5: Thay hardcoded colors trong AccountInfo.css và AccountInfo.jsx

**Files:**
- Modify: `my-app/src/screens/Admin/Account/AccountInfo.css`
- Modify: `my-app/src/screens/Admin/Account/AccountInfo.jsx`

- [ ] **Step 1: Thay trong AccountInfo.css**

| Hardcode | Thay bằng |
|----------|-----------|
| `#052035` | `var(--color-brand-blue-deep)` |
| `#067647` | `var(--color-state-success-strong)` |
| `#B42318` | `var(--color-state-danger-strong)` |
| `#E8EDF5` | `var(--color-surface-soft-blue)` |
| `#EAF7EF` | `var(--color-state-success-soft)` |
| `#FDEAEA` | `var(--color-state-danger-soft)` |
| `#CCC`, `#EEE` | `var(--color-gray-300)`, `var(--color-gray-200)` |

- [ ] **Step 2: Thay trong AccountInfo.jsx**

| Hardcode | Thay bằng |
|----------|-----------|
| `#007BFF` | `var(--color-primary)` |
| `#333` | `var(--color-text-primary)` |
| `#444` | `var(--color-text-primary)` |
| `#666` | `var(--color-text-muted)` |
| `#999` | `var(--color-text-subtle)` |
| `#DDD` | `var(--color-gray-300)` |
| `#EEE` | `var(--color-gray-200)` |
| `#F8F9FA` | `var(--color-gray-50)` |

- [ ] **Step 3: Commit**

```bash
git add my-app/src/screens/Admin/Account/
git commit -m "refactor(css): replace hardcoded colors in AccountInfo"
```

---

### Task 6: Thay hardcoded colors trong ConfirmationDialog.jsx

**Files:**
- Modify: `my-app/src/components/ConfirmationDialog/ConfirmationDialog.jsx`

- [ ] **Step 1: Đọc file để hiểu cấu trúc inline styles**

```powershell
Get-Content "d:\web-lcd\my-app\src\components\ConfirmationDialog\ConfirmationDialog.jsx"
```

- [ ] **Step 2: Thay inline color styles bằng CSS classes hoặc var()**

Tạo các CSS classes trong `ConfirmationDialog.css` thay vì inline styles:
```css
/* ConfirmationDialog.css */
.confirm-dialog--danger .confirm-dialog__icon { color: var(--color-state-danger-strong); background: var(--color-state-danger-surface); }
.confirm-dialog--success .confirm-dialog__icon { color: var(--color-state-success-strong); background: var(--color-state-success-soft); }
.confirm-dialog--warning .confirm-dialog__icon { color: var(--color-state-warning-strong); background: var(--color-state-warning-soft); }
.confirm-dialog--info .confirm-dialog__icon { color: var(--color-primary); background: var(--color-surface-accent); }
```

| Hardcode | Thay bằng |
|----------|-----------|
| `#C43232` | `var(--color-state-danger-strong)` |
| `#FFD8D8`, `#FFF4F4` | `var(--color-state-danger-surface)` |
| `#207D45` | `var(--color-state-success-strong)` |
| `#CDEED8`, `#EDF9F1` | `var(--color-state-success-soft)` |
| `#A96513` | `var(--color-state-warning-strong)` |
| `#FFE4BF`, `#FFF7EC` | `var(--color-state-warning-soft)` |
| `#245A99` | `var(--color-primary-dark)` |
| `#D4E6FF`, `#EEF5FF` | `var(--color-surface-accent)` |

- [ ] **Step 3: Commit**

```bash
git add my-app/src/components/ConfirmationDialog/
git commit -m "refactor(css): move ConfirmationDialog inline colors to CSS variables"
```

---

### Task 7: Thay #888 rải rác trong JSX files

**Files:**
- Modify: `my-app/src/components/PostDetail/PostDetail.jsx`
- Modify: `my-app/src/screens/Admin/CategoriesManagement/CategoriesManagement.jsx`
- Modify: `my-app/src/screens/Admin/ContactsManagement/ContactsManagement.jsx`
- Modify: `my-app/src/screens/Admin/PostsManagement/PostsManagement.jsx`
- Modify: `my-app/src/screens/User/Event/AnnualEvent/AnnualEvent.jsx`
- Modify: `my-app/src/screens/User/Event/AnnualEventDetail/AnnualEventDetail.jsx`
- Modify: `my-app/src/screens/User/Event/Event/Event.jsx`

- [ ] **Step 1: Tìm tất cả các #888 trong JSX**

```powershell
Select-String -Path "d:\web-lcd\my-app\src\**\*.jsx" -Pattern "#888(?!\w)" -AllMatches | Select-Object Path, LineNumber, Line
```

- [ ] **Step 2: Thay tất cả `#888` bằng `var(--color-text-soft)` trong CSS context hoặc `'var(--color-text-soft)'` trong inline JSX style**

- [ ] **Step 3: Thay các màu còn lại trong PostsManagement.jsx**

| Hardcode | Thay bằng |
|----------|-----------|
| `#888` | `var(--color-text-soft)` |
| `#C00` | `var(--color-state-danger)` |
| `#FEE` | `var(--color-state-danger-soft)` |

- [ ] **Step 4: Thay các màu còn lại trong AdminLayout.css và MembersManagement.css**

`AdminLayout.css`:
| Hardcode | Thay bằng |
|----------|-----------|
| `#8CB5F2` | `var(--color-info-tint-medium)` |
| `#9CA3AF` | `var(--color-darkgray)` |
| `#BFBFBF` | `var(--color-gray-400)` |
| `#EEF4FD` | `var(--color-surface-soft-blue)` |
| `#F5F8FD` | `var(--color-surface-lightest)` |

`MembersManagement.css`:
| Hardcode | Thay bằng |
|----------|-----------|
| `#9CA3AF` | `var(--color-darkgray)` |
| `#BFBFBF` | `var(--color-gray-400)` |
| `#E1EDFF` | `var(--color-surface-accent)` |
| `#FAFCFF` | `var(--color-surface-lightest)` |

- [ ] **Step 5: Thay màu trong các file nhỏ còn lại**

`OrganizationalStructure.css`:
| Hardcode | Thay bằng |
|----------|-----------|
| `#123560`, `#1B2230` | `var(--color-brand-blue-deep)` |
| `#DFE9F8` | `var(--color-surface-timeline)` |

`SearchResults.css`:
| Hardcode | Thay bằng |
|----------|-----------|
| `#0F172A` | `var(--color-text-strong)` |
| `#475569` | `var(--color-text-secondary)` |
| `#64748B` | `var(--color-text-muted)` |
| `#DBEAFE` | `var(--color-surface-accent)` |
| `#F8FAFC` | `var(--color-gray-50)` |

`AdminLogin.css`:
| Hardcode | Thay bằng |
|----------|-----------|
| `#2C6BCC` | `var(--color-primary)` |
| `#1A4B8F` | `var(--color-primary-dark)` |
| `#99A3BA` | `var(--color-text-meta)` |
| `#E9EDF2` | `var(--color-surface-soft-blue)` |

`Timeline.css`:
| Hardcode | Thay bằng |
|----------|-----------|
| `#2F80ED` | `var(--color-info-vivid)` |
| `#C8DCFA` | `var(--color-info-tint-medium)` |
| `#DBE7F7`, `#E2ECFB` | `var(--color-surface-timeline)` |
| `#F6FAFF` | `var(--color-info-tint-light)` |

`CategoriesManagement.css`, `Contact.css`, `Event.css` (chỉ `#FBFDFF`):
- `#FBFDFF` → `var(--color-surface-lightest)`

`OtherUtilities.jsx` (`#1A1A1A`):
- `#1A1A1A` → `var(--color-text-strong)`

- [ ] **Step 6: Kiểm tra tổng thể**

```powershell
Get-ChildItem "d:\web-lcd\my-app\src" -Recurse -Include "*.css","*.jsx" | ForEach-Object { $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue; $colors = [regex]::Matches($content,'#[0-9a-fA-F]{3,6}(?!\w)') | Where-Object { $_.Value -notin @('#root','#000','#fff','#FFFFFF','#000000','#FFF') } | ForEach-Object { $_.Value }; if ($colors.Count -gt 0) { Write-Host "$($_.Name): $($colors -join ', ')" } }
```

Expected: Chỉ còn `global.css` (các biến định nghĩa) và không file nào khác có màu hardcode.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(css): replace all hardcoded colors with CSS variables"
```
