# Codebase Cleanup & Standardization Design Spec

**Date:** 2026-05-02  
**Scope:** Full codebase — `d:\web-lcd\my-app` (frontend) + `d:\web-lcd\backend`  
**Branch:** `update-ux/ui` (production)

---

## 1. Mục tiêu

Làm sạch và chuẩn hóa toàn bộ codebase:
1. Xóa file rác và code không sử dụng ở backend
2. Chuẩn hóa Design System (`global.css`): gộp biến trùng, xóa màu/biến không dùng
3. Thay thế tất cả màu hardcode trong các file CSS/JSX bằng biến CSS từ `global.css`
4. Chuyển đơn vị CSS từ `px` sang `rem`/`em` theo chuẩn accessibility

---

## 2. Sub-Project 1 — Backend Cleanup

### Phạm vi
**Xóa:**
- `backend/scratch_check_dbs.js`
- `backend/scratch_check_tables.js`
- `backend/scratch_db_check.js`
- `backend/scratch_fix_featured.js`
- `backend/scratch_run_seed.js`
- `backend/test-sqlserver.js`

**Giữ nguyên:** `documentsController.js`, `routes/documents.js` — giữ để dự phòng dù frontend chưa dùng.

### Kiểm tra
```bash
node -e "require('./backend/server.js')" # server phải khởi động không lỗi
```

---

## 3. Sub-Project 2 — Design System: Chuẩn hóa `global.css`

### 3a. Gộp biến Font trùng nhau
Hiện tại 5 biến font trỏ cùng giá trị:
```css
/* GIỮ LẠI duy nhất: */
--font-primary: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;

/* XÓA: */
--font-secondary  (= --font-primary)
--font-body       (= --font-primary)
--font-work-sans  (alias Figma, không còn dùng Work Sans)
--font-open-sans  (alias Figma, không còn dùng Open Sans)
--font-inter      (= --font-primary)
```
→ Cập nhật tất cả file CSS đang dùng các biến bị xóa sang `--font-primary`.

### 3b. Gộp biến Spacing trùng nhau
Hiện tại có 3 hệ thống spacing song song:
```css
/* HỆ 1 - GIỮ: */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem;  /* 8px */
...

/* HỆ 2 - XÓA (trùng với hệ 1): */
--padding-4, --padding-8, --padding-12, --padding-16, --padding-20, --padding-24

/* HỆ 3 - XÓA (trùng với hệ 1): */
--gap-4, --gap-8, --gap-12, --gap-16, --gap-20, --gap-24

/* XÓA (giá trị lẻ, đặt tên không nhất quán): */
--space-10px, --space-14px, --space-70px
--size-space-200, --size-space-300, --size-space-400
```

### 3c. Xóa biến không bao giờ dùng
Các biến xác nhận **không được tham chiếu ở bất kỳ đâu**:
- `--fuschia-100`, `--fuschia-80`, `--fuschia-60`
- `--iris-100`, `--iris-80`, `--iris-60`
- `--color-primitives-*` (chỉ dùng bởi `SDS-light/dark` mode — bản thân mode này cũng không được dùng)
- `[data-LCD-mode]`, `[data-color-mode="SDS-light/dark"]` — không được set ở bất kỳ JSX nào
- `--shadow-sm/md/lg/xl/2xl` — tất cả đều `none`, xóa hết, chỉ giữ `--shadow-none`
- `--text-shadow-1` — giá trị `none`
- `--size-radius-200`, `--size-space-200/300/400` — trùng với `--radius-md`, `--space-2/3/4`
- `--width-24`, `--height-24`, `--height-28`, `--height-57`
- `--ls--0_02` (tên lỗi), `--ls-0_5`
- `--color-whitesmoke` — giá trị `#FFFFFF`, trùng với `--color-white`

### 3d. Gộp màu trùng nhau (trong global.css)
```css
/* Gộp 4 biến cùng màu xanh brand: */
--color-primary: #2C6BCC;
--color-royalblue: #2C6BCC; /* → ALIAS, xóa */
--LCD-color: rgba(44, 107, 204, 1); /* → ALIAS, xóa */
--color-brand-blue-deep: #173562; /* giữ, khác màu */

/* Gộp xám trùng: */
--color-darkgray: #9CA3AF; /* trùng --color-gray-400: #BDBDBD? Không — giữ cả 2 */
```

### 3e. Chuẩn hóa Spacing sang rem
```css
/* Từ px sang rem (base 16px): */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-7: 1.75rem;   /* 28px */
--space-8: 2rem;      /* 32px */
--space-9: 2.25rem;   /* 36px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */

/* Giữ px cho: */
--container-gutter: 24px → 1.5rem (vẫn rem)
--container-max: 1200px (giữ px - viewport width)
--bp-*: giữ px (breakpoints)
--border-width-*: giữ px (borders)
--radius-*: giữ px (borders)
```

### 3f. Xóa Google Font imports không dùng
Chỉ giữ lại `Inter` và `Roboto`. Xóa `Work Sans` và `Open Sans`.

---

## 4. Sub-Project 3 — Thay thế màu hardcode trong tất cả file CSS/JSX

### Quy tắc
- **Nguồn duy nhất:** Tất cả màu PHẢI đến từ biến trong `global.css`
- **Ngoại lệ:** `rgba()` với alpha transparency được phép (ví dụ `rgba(24, 53, 99, 0.1)`)
- **Nếu màu chưa có biến:** Thêm biến mới vào `global.css` trước, rồi dùng biến đó

### Mapping màu hardcode → biến

| Hardcode | Biến CSS |
|----------|----------|
| `#2C6BCC` | `var(--color-primary)` |
| `#1A4B8F`, `#1A4D99`, `#1A4A8A` | `var(--color-primary-dark)` |
| `#888`, `#888888` | `var(--color-text-soft)` |
| `#333`, `#333333` | `var(--color-text-primary)` |
| `#666`, `#666666` | `var(--color-text-muted)` |
| `#1A1A1A` | `var(--color-text-strong)` |
| `#9CA3AF` | `var(--color-darkgray)` |
| `#DBE8FF` | `var(--color-surface-accent)` |
| `#EEF2FF` | `var(--color-surface-accent)` |
| `#FFD7D9`, `#FFD8D8` | `var(--color-state-danger-surface)` |
| `#D2F7DF`, `#EDF9F1` | `var(--color-state-success-soft)` |
| `#FFF7EC`, `#FFE4BF` | `var(--color-state-warning-soft)` |
| `#2F80ED` | → thêm `--color-info-vivid: #2F80ED` vào global.css |
| `#C8DCFA`, `#E2ECFB`, `#F6FAFF` | → thêm `--color-info-tint-*` vào global.css |
| `#FBFDFF`, `#FAFCFF`, `#F8FBFF` | → thêm `--color-surface-lightest: #FAFCFF` vào global.css |
| `#E8EDF5` | `var(--color-surface-soft-blue)` |

### File cần xử lý (theo ưu tiên)
1. `TimelineManagement.css` — 16 màu hardcode
2. `AdminButtons.css` — 5 màu
3. `Dashboard.css`, `Dashboard.jsx`
4. `AccountInfo.css`, `AccountInfo.jsx`
5. `ConfirmationDialog.jsx` — 12 màu inline
6. `AdminLayout.css`, `MembersManagement.css`
7. `OrganizationalStructure.css`, `Timeline.css`
8. `SearchResults.css`
9. Tất cả `#888` trong JSX files

---

## 5. Sub-Project 4 — CSS Units: px → rem/em

### Quy tắc chuyển đổi

| Thuộc tính | Đơn vị | Lý do |
|-----------|--------|-------|
| `font-size` | `rem` | Nhất quán toàn trang, accessibility |
| `margin`, `padding` | `rem` | Tỷ lệ với font gốc |
| `gap` | `rem` | Layout spacing |
| `width`, `height` layout | `%` hoặc `rem` | Linh hoạt |
| `width`, `height` icon/avatar | `rem` hoặc `em` | Tỷ lệ với font |
| `border`, `border-radius` | `px` | Cố định, không cần scale |
| `box-shadow` | `px` | Cố định |
| `top`, `left`, `right`, `bottom` | `rem` (nếu là spacing) | Hoặc `%` nếu là layout |
| `min-width`, `max-width` container | `px` hoặc `rem` | Tùy ngữ cảnh |
| `media query breakpoints` | `px` | Dựa trên viewport, không phụ thuộc font |
| `z-index`, `transition timing` | giữ nguyên | Không phải size |

### Công thức chuyển đổi
`px / 16 = rem` (base font-size mặc định của trình duyệt là 16px)

**Ví dụ:**
- `84px` → `5.25rem`
- `56px` → `3.5rem`
- `24px` → `1.5rem`
- `16px` → `1rem`
- `8px` → `0.5rem`

### Thứ tự file xử lý (theo số lượng px)
1. `PostsManagement.css` — 197 px
2. `Header.css` — 121 px
3. `Dashboard.css` — 113 px
4. `OtherUtilities.css` — 112 px
5. `MembersManagement.css` — 94 px
6. `Event.css` — 92 px
7. `OrganizationalStructure.css` — 91 px
8. `TimelineManagement.css` — 77 px
9. `global.css` — 76 px
10. `News.css` — 74 px
... (các file còn lại)

---

## 6. Thứ tự thực hiện

```
Sub-Project 1 (Backend Cleanup)
    ↓
Sub-Project 2 (global.css Standardization)
    ↓
Sub-Project 3 (Replace Hardcoded Colors)
    ↓
Sub-Project 4 (px → rem)
```

Mỗi sub-project là 1 kế hoạch triển khai độc lập.
