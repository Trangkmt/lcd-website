# Sub-Project 4: CSS Units px → rem — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đơn vị CSS từ `px` sang `rem`/`em` theo chuẩn accessibility, cải thiện responsive trên toàn bộ các file CSS.

**Architecture:** 
- Xử lý từng file một theo thứ tự ưu tiên (nhiều px nhất trước).
- Áp dụng quy tắc nhất quán: rem cho spacing/font, px cho border/breakpoint.
- Mỗi file là 1 commit riêng để dễ review.

**Tech Stack:** Vanilla CSS

**Công thức:** `px ÷ 16 = rem` (base font-size trình duyệt = 16px)

**Bảng quy tắc:**

| Thuộc tính | Đơn vị dùng | Ghi chú |
|-----------|------------|---------|
| `font-size` | `rem` | Accessibility |
| `margin`, `padding` | `rem` | Scale với font gốc |
| `gap` | `rem` | Spacing |
| `width/height` layout container | `%` hoặc `rem` | |
| `width/height` icon/element cố định | `rem` | |
| `top/left/right/bottom` spacing | `rem` | |
| `border-width` | `px` | Cố định, không scale |
| `border-radius` | `px` | Cố định |
| `box-shadow offsets` | `px` | Cố định |
| `outline` | `px` | |
| `Media query breakpoints` | `px` | Viewport-based |
| `min-width/max-width` fixed container | `px` | Layout anchor |
| `z-index` | số nguyên | |
| `transition timing` | `ms`/`s` | |
| `transform: translateY(Xpx)` | `rem` nếu là spacing |  |
| `line-height` | số không đơn vị hoặc `em` | |

**Bảng chuyển đổi nhanh:**

| px | rem |
|----|-----|
| 4px | 0.25rem |
| 6px | 0.375rem |
| 8px | 0.5rem |
| 10px | 0.625rem |
| 12px | 0.75rem |
| 14px | 0.875rem |
| 16px | 1rem |
| 18px | 1.125rem |
| 20px | 1.25rem |
| 24px | 1.5rem |
| 28px | 1.75rem |
| 32px | 2rem |
| 36px | 2.25rem |
| 40px | 2.5rem |
| 48px | 3rem |
| 56px | 3.5rem |
| 64px | 4rem |
| 80px | 5rem |
| 84px | 5.25rem |
| 96px | 6rem |
| 120px | 7.5rem |

---

### Task 1: Chuyển PostsManagement.css (197 px instances)

**Files:**
- Modify: `my-app/src/screens/Admin/PostsManagement/PostsManagement.css`

- [ ] **Step 1: Đọc file và xác định pattern phổ biến**

```powershell
Select-String -Path "d:\web-lcd\my-app\src\screens\Admin\PostsManagement\PostsManagement.css" -Pattern "\d+\.?\d*px" -AllMatches | ForEach-Object { [regex]::Matches($_.Line, '\d+\.?\d*px') | ForEach-Object { $_.Value } } | Group-Object | Sort-Object Count -Descending | Select-Object -First 30 | Format-Table Name, Count
```

- [ ] **Step 2: Chuyển đổi theo quy tắc**

**Giữ px cho:** border (1px, 2px), border-radius, box-shadow, media query breakpoints.
**Chuyển sang rem:** font-size, padding, margin, gap, width/height, top/left.

Ví dụ các pattern phổ biến:
```css
/* TRƯỚC */
font-size: 14px;
padding: 12px 16px;
gap: 8px;
height: 40px;
margin-bottom: 24px;

/* SAU */
font-size: 0.875rem;
padding: 0.75rem 1rem;
gap: 0.5rem;
height: 2.5rem;
margin-bottom: 1.5rem;
```

- [ ] **Step 3: Kiểm tra visual không bị vỡ layout**

Mở browser và kiểm tra trang PostsManagement còn hiển thị đúng.

- [ ] **Step 4: Commit**

```bash
git add my-app/src/screens/Admin/PostsManagement/PostsManagement.css
git commit -m "refactor(css): convert px to rem in PostsManagement"
```

---

### Task 2: Chuyển Header.css (121 px instances)

**Files:**
- Modify: `my-app/src/components/Header/Header.css`

- [ ] **Step 1: Xác định các giá trị đặc biệt cần chú ý**

Header có các giá trị layout cố định quan trọng:
- `height: 84px` (header height) → `5.25rem`
- `height: 56px` (header background) → `3.5rem`
- `height: 30px` (bottom bar) → `1.875rem`
- `top: 6px`, `left: 56px`, `left: 114px` → rem

**Giữ nguyên px:**
- `1px solid` (borders)
- `border-radius: 10px` (cố định)
- Media query breakpoints (1440px, 1200px, 1024px, 768px, 480px)

- [ ] **Step 2: Chuyển đổi**

```css
/* TRƯỚC */
.header { height: 84px; }
.layout-main { padding-top: 84px; }
.header__menu { height: 56px; }
.header__logo-link { top: 6px; left: 56px; }
.header__logo { width: 52px; height: 52px; }
.header__org-title { left: 114px; top: 8px; width: 420px; min-height: 40px; gap: 2px; padding: 2px 8px; }
.header__bottom-bar { height: 30px; }
.header__nav { left: 210px; height: 28px; }
.menu-item__trailing { height: 10px; width: 10px; }
.header__search { top: 16px; right: 32px; padding: 6px 12px; gap: 8px; min-width: 160px; }
.header__search-icon { height: 13px; width: 13px; }

/* SAU */
.header { height: 5.25rem; }
.layout-main { padding-top: 5.25rem; }
.header__menu { height: 3.5rem; }
.header__logo-link { top: 0.375rem; left: 3.5rem; }
.header__logo { width: 3.25rem; height: 3.25rem; }
.header__org-title { left: 7.125rem; top: 0.5rem; width: 26.25rem; min-height: 2.5rem; gap: 0.125rem; padding: 0.125rem 0.5rem; }
.header__bottom-bar { height: 1.875rem; }
.header__nav { left: 13.125rem; height: 1.75rem; }
.menu-item__trailing { height: 0.625rem; width: 0.625rem; }
.header__search { top: 1rem; right: 2rem; padding: 0.375rem 0.75rem; gap: 0.5rem; min-width: 10rem; }
.header__search-icon { height: 0.8125rem; width: 0.8125rem; }
```

**Lưu ý media queries:** Chuyển các giá trị padding, height bên trong nhưng giữ breakpoint px:
```css
@media (max-width: 1024px) { /* giữ px */
    .header__menu { padding: 0.5rem 1rem; } /* 8px 16px → rem */
    .header__nav { height: 2.25rem; } /* 36px */
}
```

- [ ] **Step 3: Commit**

```bash
git add my-app/src/components/Header/Header.css
git commit -m "refactor(css): convert px to rem in Header"
```

---

### Task 3: Chuyển Dashboard.css (113 px) và OtherUtilities.css (112 px)

**Files:**
- Modify: `my-app/src/screens/Admin/Dashboard/Dashboard.css`
- Modify: `my-app/src/screens/Admin/OtherUtilities/OtherUtilities.css`

- [ ] **Step 1: Chuyển Dashboard.css theo quy tắc**

**Giữ px:** `1px` borders, border-radius, media query breakpoints.
**Chuyển rem:** tất cả font-size, padding, margin, gap, width, height, top, left.

- [ ] **Step 2: Chuyển OtherUtilities.css theo quy tắc**

Tương tự Dashboard.css.

- [ ] **Step 3: Commit**

```bash
git add my-app/src/screens/Admin/Dashboard/Dashboard.css my-app/src/screens/Admin/OtherUtilities/OtherUtilities.css
git commit -m "refactor(css): convert px to rem in Dashboard and OtherUtilities"
```

---

### Task 4: Chuyển MembersManagement.css (94 px) và Event.css (92 px)

**Files:**
- Modify: `my-app/src/screens/Admin/MembersManagement/MembersManagement.css`
- Modify: `my-app/src/screens/User/Event/Event/Event.css`

- [ ] **Step 1: Chuyển MembersManagement.css**

- [ ] **Step 2: Chuyển Event.css**

- [ ] **Step 3: Commit**

```bash
git add my-app/src/screens/Admin/MembersManagement/MembersManagement.css my-app/src/screens/User/Event/Event/Event.css
git commit -m "refactor(css): convert px to rem in MembersManagement and Event"
```

---

### Task 5: Chuyển OrganizationalStructure.css (91 px) và TimelineManagement.css (77 px)

**Files:**
- Modify: `my-app/src/screens/User/OrganizationalStructure/OrganizationalStructure.css`
- Modify: `my-app/src/screens/Admin/TimelineManagement/TimelineManagement.css`

- [ ] **Step 1: Chuyển OrganizationalStructure.css**

- [ ] **Step 2: Chuyển TimelineManagement.css**

- [ ] **Step 3: Commit**

```bash
git add my-app/src/screens/User/OrganizationalStructure/OrganizationalStructure.css my-app/src/screens/Admin/TimelineManagement/TimelineManagement.css
git commit -m "refactor(css): convert px to rem in OrganizationalStructure and TimelineManagement"
```

---

### Task 6: Chuyển News.css (74 px) và NonAnnualEventDetail.css (69 px)

**Files:**
- Modify: `my-app/src/screens/User/News/News.css`
- Modify: `my-app/src/screens/User/Event/NonAnnualEventDetail/NonAnnualEventDetail.css`

- [ ] **Step 1: Chuyển News.css**

- [ ] **Step 2: Chuyển NonAnnualEventDetail.css**

- [ ] **Step 3: Commit**

```bash
git add my-app/src/screens/User/News/News.css my-app/src/screens/User/Event/NonAnnualEventDetail/NonAnnualEventDetail.css
git commit -m "refactor(css): convert px to rem in News and NonAnnualEventDetail"
```

---

### Task 7: Chuyển Achievement.css (63 px) và Homepage.css (61 px)

**Files:**
- Modify: `my-app/src/screens/User/Achievement/Achievement.css`
- Modify: `my-app/src/screens/User/Homepage/Homepage.css`

- [ ] **Step 1: Chuyển Achievement.css**

- [ ] **Step 2: Chuyển Homepage.css**

- [ ] **Step 3: Commit**

```bash
git add my-app/src/screens/User/Achievement/Achievement.css my-app/src/screens/User/Homepage/Homepage.css
git commit -m "refactor(css): convert px to rem in Achievement and Homepage"
```

---

### Task 8: Chuyển Timeline.css (52 px) và AdminLayout.css (50 px)

**Files:**
- Modify: `my-app/src/components/Timeline/Timeline.css`
- Modify: `my-app/src/screens/Admin/AdminLayout/AdminLayout.css`

- [ ] **Step 1: Chuyển Timeline.css**

- [ ] **Step 2: Chuyển AdminLayout.css**

- [ ] **Step 3: Commit**

```bash
git add my-app/src/components/Timeline/Timeline.css my-app/src/screens/Admin/AdminLayout/AdminLayout.css
git commit -m "refactor(css): convert px to rem in Timeline and AdminLayout"
```

---

### Task 9: Chuyển PostDetail.css (46 px) và SearchResults.css (44 px)

**Files:**
- Modify: `my-app/src/components/PostDetail/PostDetail.css`
- Modify: `my-app/src/screens/User/Search/SearchResults.css`

- [ ] **Step 1: Chuyển PostDetail.css**

- [ ] **Step 2: Chuyển SearchResults.css**

- [ ] **Step 3: Commit**

```bash
git add my-app/src/components/PostDetail/PostDetail.css my-app/src/screens/User/Search/SearchResults.css
git commit -m "refactor(css): convert px to rem in PostDetail and SearchResults"
```

---

### Task 10: Chuyển SearchBar.css (41 px) và các Admin Styles (tổng ~91 px)

**Files:**
- Modify: `my-app/src/components/SearchBar/SearchBar.css`
- Modify: `my-app/src/screens/Admin/Styles/AdminButtons.css`
- Modify: `my-app/src/screens/Admin/Styles/AdminForm.css`
- Modify: `my-app/src/screens/Admin/Styles/AdminModal.css`
- Modify: `my-app/src/screens/Admin/Styles/AdminTable.css`

- [ ] **Step 1: Chuyển SearchBar.css**

- [ ] **Step 2: Chuyển 4 Admin Styles files**

Ví dụ cho AdminModal.css:
```css
/* TRƯỚC */
.admin-modal { padding: 24px; }
.admin-modal__panel { border-radius: 10px; padding: 20px; }
.admin-modal__header { gap: 12px; margin-bottom: 16px; }
.admin-modal__close { width: 40px; height: 40px; border-radius: 8px; }
.admin-modal__body { padding: 12px; }
.admin-modal__actions { margin-top: 14px; gap: 8px; }

/* SAU */
.admin-modal { padding: 1.5rem; }
.admin-modal__panel { border-radius: 10px; padding: 1.25rem; } /* border-radius giữ px */
.admin-modal__header { gap: 0.75rem; margin-bottom: 1rem; }
.admin-modal__close { width: 2.5rem; height: 2.5rem; border-radius: 8px; } /* border-radius giữ px */
.admin-modal__body { padding: 0.75rem; }
.admin-modal__actions { margin-top: 0.875rem; gap: 0.5rem; }
```

- [ ] **Step 3: Commit**

```bash
git add my-app/src/components/SearchBar/SearchBar.css my-app/src/screens/Admin/Styles/
git commit -m "refactor(css): convert px to rem in SearchBar and Admin Styles"
```

---

### Task 11: Chuyển các file còn lại (Contact, AnnualEvent, AccountInfo, AdminLogin, Footor, PostCard, v.v.)

**Files:**
- `my-app/src/screens/User/Contact/Contact.css` (30 px)
- `my-app/src/screens/Admin/Styles/AdminModal.css` (29 px)
- `my-app/src/screens/Admin/Account/AccountInfo.css` (25 px)
- `my-app/src/screens/Admin/Styles/AdminButtons.css` (24 px)
- `my-app/src/screens/User/Event/AnnualEventDetail/AnnualEventDetail.css` (23 px)
- `my-app/src/screens/Admin/Styles/AdminForm.css` (23 px)
- `my-app/src/components/Footer/Footer.css` (22 px)
- `my-app/src/screens/User/Event/AnnualEvent/AnnualEvent.css` (17 px)
- `my-app/src/screens/Admin/AdminLogin/AdminLogin.css` (16 px)
- `my-app/src/screens/Admin/Styles/AdminTable.css` (15 px)
- `my-app/src/components/PostCard/PostCard.css` (13 px)
- `my-app/src/screens/Admin/ContactsManagement/ContactsManagement.css` (13 px)
- `my-app/src/screens/Admin/CategoriesManagement/CategoriesManagement.css` (36 px)

- [ ] **Step 1: Chuyển từng file theo quy tắc**

Áp dụng cùng quy tắc: giữ px cho border/border-radius/media query breakpoints, chuyển rem cho spacing/font/layout.

- [ ] **Step 2: Commit sau mỗi nhóm file**

```bash
git add <files>
git commit -m "refactor(css): convert px to rem in remaining CSS files"
```

---

### Task 12: Kiểm tra tổng thể và visual review

- [ ] **Step 1: Chạy lệnh kiểm tra số lượng px còn lại**

```powershell
Get-ChildItem "d:\web-lcd\my-app\src" -Recurse -Include "*.css" | ForEach-Object { $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue; $pxMatches = [regex]::Matches($content, '(?<![\w-])\d+\.?\d*px(?!\w)') | Where-Object { $_.Value -notin @('1px','2px','0px') -and $_.Value -notmatch '^\d+(76|80|92|99)8px' }; if ($pxMatches.Count -gt 5) { Write-Host "$($_.Name): $($pxMatches.Count) px values" } }
```

Expected: Chỉ còn border-related px (1px, 2px) và breakpoints trong media queries.

- [ ] **Step 2: Kiểm tra visual trên browser (các trang chính)**

Mở browser, kiểm tra:
- Homepage (`/`)
- News, Event, Achievement
- Admin Dashboard
- Admin PostsManagement
- Admin MembersManagement

Không có layout vỡ, text quá nhỏ/lớn bất thường.

- [ ] **Step 3: Commit cuối cùng**

```bash
git add -A
git commit -m "refactor(css): complete px to rem migration across all CSS files"
```
