# Sub-Project 2: Design System Standardization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuẩn hóa `global.css` — gộp biến trùng, xóa biến không dùng, chuyển spacing sang rem, xóa Google Font imports thừa.

**Architecture:** Tất cả thay đổi tập trung tại `my-app/src/global.css` và cập nhật tham chiếu trong các file CSS khác.

**Tech Stack:** CSS Custom Properties (CSS Variables), Vanilla CSS

---

### Task 1: Xóa Google Font imports không dùng

**Files:**
- Modify: `my-app/src/global.css` (lines 6-9)

- [ ] **Step 1: Xác nhận Work Sans và Open Sans không dùng nữa**

```powershell
Select-String -Path "d:\web-lcd\my-app\src\**\*.css","d:\web-lcd\my-app\src\**\*.jsx" -Pattern "Work Sans|Open Sans" -AllMatches
```

Expected: Không có kết quả nào (các font này đã được alias sang Inter).

- [ ] **Step 2: Xóa import Work Sans và Open Sans**

Trong `my-app/src/global.css`, thay:
```css
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900&display=swap');
```

Thành:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900&display=swap');
```

- [ ] **Step 3: Commit**

```bash
git add my-app/src/global.css
git commit -m "chore(css): remove unused Google Font imports (Work Sans, Open Sans)"
```

---

### Task 2: Gộp biến Font trùng nhau

**Files:**
- Modify: `my-app/src/global.css` (Font Families section ~lines 224-232)
- Modify: `my-app/src/components/Header/Header.css`
- Modify: `my-app/src/components/Footer/Footer.css`

- [ ] **Step 1: Xác định tất cả file đang dùng --font-work-sans, --font-open-sans, --font-inter, --font-secondary, --font-body**

```powershell
Select-String -Path "d:\web-lcd\my-app\src\**\*.css","d:\web-lcd\my-app\src\**\*.jsx" -Pattern "var\(--font-work-sans\)|var\(--font-open-sans\)|var\(--font-inter\)|var\(--font-secondary\)|var\(--font-body\)" -AllMatches | Select-Object Path, Line
```

- [ ] **Step 2: Trong global.css, thay thế phần Font Families**

Thay toàn bộ khối Font Families:
```css
/* Font Families - Unified System */
--font-primary: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
--font-secondary: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
--font-body: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;

/* Figma Font Families - Updated to Inter */
--font-work-sans: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-open-sans: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-inter: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Thành (chỉ giữ 1 biến):
```css
/* Font Family */
--font-primary: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
```

- [ ] **Step 3: Thay var(--font-work-sans), var(--font-open-sans), v.v. sang var(--font-primary) trong tất cả file**

Trong `Header.css`: tìm `var(--font-work-sans)` → thay `var(--font-primary)`
Trong bất kỳ file nào tìm thấy ở Step 1: thay tất cả alias → `var(--font-primary)`

- [ ] **Step 4: Cập nhật body rule trong global.css nếu dùng --font-body**

```css
body {
    font-family: var(--font-primary);
    ...
}
```

- [ ] **Step 5: Kiểm tra không còn tham chiếu đến biến đã xóa**

```powershell
Select-String -Path "d:\web-lcd\my-app\src\**\*.css","d:\web-lcd\my-app\src\**\*.jsx" -Pattern "var\(--font-work-sans\)|var\(--font-open-sans\)|var\(--font-inter\)|var\(--font-secondary\)|var\(--font-body\)"
```

Expected: Không có kết quả.

- [ ] **Step 6: Commit**

```bash
git add my-app/src/global.css my-app/src/components/Header/Header.css
git commit -m "refactor(css): consolidate duplicate font variables into --font-primary"
```

---

### Task 3: Xóa biến CSS không được dùng

**Files:**
- Modify: `my-app/src/global.css`

- [ ] **Step 1: Xác nhận các biến không được dùng**

```powershell
# Kiểm tra --fuschia và --iris
Select-String -Path "d:\web-lcd\my-app\src\**\*.css","d:\web-lcd\my-app\src\**\*.jsx" -Pattern "var\(--fuschia|var\(--iris" -AllMatches

# Kiểm tra --color-primitives
Select-String -Path "d:\web-lcd\my-app\src\**\*.css","d:\web-lcd\my-app\src\**\*.jsx" -Pattern "var\(--color-primitives" -AllMatches

# Kiểm tra data-LCD-mode và data-color-mode được set ở đâu
Select-String -Path "d:\web-lcd\my-app\src\**\*.jsx" -Pattern "data-LCD-mode|data-color-mode" -AllMatches

# Kiểm tra --shadow-sm/md/lg/xl/2xl
Select-String -Path "d:\web-lcd\my-app\src\**\*.css","d:\web-lcd\my-app\src\**\*.jsx" -Pattern "var\(--shadow-sm\)|var\(--shadow-md\)|var\(--shadow-lg\)|var\(--shadow-xl\)|var\(--shadow-2xl\)" -AllMatches
```

Expected: Tất cả trả về rỗng.

- [ ] **Step 2: Xóa khỏi global.css các biến đã xác nhận không dùng**

Xóa các phần sau khỏi `:root {}`:
```css
/* XÓA toàn bộ Fuschia Palette */
--fuschia-100: rgba(239, 93, 168, 1);
--fuschia-80: rgba(241, 120, 182, 1);
--fuschia-60: rgba(252, 221, 236, 1);

/* XÓA toàn bộ Iris Palette */
--iris-100: rgba(93, 95, 239, 1);
--iris-80: rgba(120, 121, 241, 1);
--iris-60: rgba(165, 166, 246, 1);

/* XÓA Color Primitives */
--color-primitives-brand-100: ...;
--color-primitives-brand-300: ...;
--color-primitives-brand-800: ...;
--color-primitives-brand-900: ...;
--color-primitives-gray-900: ...;
--color-primitives-white-1000: ...;

/* XÓA LCD Brand Color (trùng với --color-primary) */
--LCD-color: rgba(44, 107, 204, 1);

/* XÓA shadows không dùng (tất cả đều none) */
--shadow-sm: none;
--shadow-md: none;
--shadow-lg: none;
--shadow-xl: none;
--shadow-2xl: none;
--text-shadow-1: none;

/* XÓA letter-spacing lỗi tên */
--ls--0_02: -0.02em;  /* trùng --ls-tight */
--ls-0_5: 0.5px;

/* XÓA size aliases trùng */
--size-radius-200: 8px;     /* = --radius-md */
--size-space-200: 8px;      /* = --space-2 */
--size-space-300: 12px;     /* = --space-3 */
--size-space-400: 16px;     /* = --space-4 */

/* XÓA width/height ít dùng */
--width-24: 24px;
--height-24: 24px;
--height-28: 28px;
--height-57: 57px;

/* XÓA --color-whitesmoke (= --color-white = #FFFFFF) */
--color-whitesmoke: #FFFFFF;

/* XÓA --color-royalblue (= --color-primary) */
--color-royalblue: #2C6BCC;
```

Xóa toàn bộ các blocks:
```css
[data-LCD-mode="mode-1"] { ... }
[data-LCD-mode="mode-2"] { ... }
[data-LCD-mode="mode-3"] { ... }
[data-color-mode="SDS-light"] { ... }
[data-color-mode="SDS-dark"] { ... }
```

- [ ] **Step 3: Thay thế các tham chiếu đến biến đã xóa**

```powershell
# Tìm --color-royalblue và --color-whitesmoke trong CSS files
Select-String -Path "d:\web-lcd\my-app\src\**\*.css" -Pattern "var\(--color-royalblue\)|var\(--color-whitesmoke\)" -AllMatches | Select-Object Path, Line
```

Trong `Header.css`:
- `var(--color-royalblue)` → `var(--color-primary)`
- `var(--color-whitesmoke)` → `var(--color-white)`

- [ ] **Step 4: Kiểm tra lại không còn tham chiếu nào đến biến đã xóa**

```powershell
Select-String -Path "d:\web-lcd\my-app\src\**\*.css","d:\web-lcd\my-app\src\**\*.jsx" -Pattern "var\(--fuschia|var\(--iris|var\(--LCD-color|var\(--color-primitives|var\(--color-royalblue|var\(--color-whitesmoke|var\(--shadow-sm\)|var\(--shadow-md\)|var\(--size-radius|var\(--size-space"
```

Expected: Không có kết quả.

- [ ] **Step 5: Commit**

```bash
git add my-app/src/global.css my-app/src/components/Header/Header.css
git commit -m "refactor(css): remove unused CSS variables and theme blocks from global.css"
```

---

### Task 4: Gộp biến Spacing trùng nhau và chuyển sang rem

**Files:**
- Modify: `my-app/src/global.css` (Spacing section)

- [ ] **Step 1: Kiểm tra --padding-* và --gap-* được dùng ở đâu**

```powershell
Select-String -Path "d:\web-lcd\my-app\src\**\*.css","d:\web-lcd\my-app\src\**\*.jsx" -Pattern "var\(--padding-|var\(--gap-" -AllMatches | Select-Object Path, Line
```

- [ ] **Step 2: Nếu --padding-* hoặc --gap-* đang được dùng, thay bằng --space-* tương ứng**

| Xóa | Thay bằng |
|-----|-----------|
| `var(--padding-4)` | `var(--space-1)` |
| `var(--padding-8)` | `var(--space-2)` |
| `var(--padding-12)` | `var(--space-3)` |
| `var(--padding-16)` | `var(--space-4)` |
| `var(--padding-20)` | `var(--space-5)` |
| `var(--padding-24)` | `var(--space-6)` |
| `var(--gap-4)` | `var(--space-1)` |
| `var(--gap-8)` | `var(--space-2)` |
| `var(--gap-12)` | `var(--space-3)` |
| `var(--gap-16)` | `var(--space-4)` |
| `var(--gap-20)` | `var(--space-5)` |
| `var(--gap-24)` | `var(--space-6)` |

- [ ] **Step 3: Thay thế Spacing section trong global.css thành rem**

Thay toàn bộ phần spacing:
```css
/* =======================================
    SPACING
    ======================================= */

--space-0: 0;
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

/* Layout */
--container-max: 1200px;  /* giữ px - viewport reference */
--container-gutter: 1.5rem; /* 24px */
```

Xóa phần Figma Spacing (--padding-*, --gap-*) khỏi :root.

Cập nhật media queries trong global.css:
```css
@media (max-width: 1024px) {
   :root {
      --container-gutter: 1.25rem; /* 20px */
   }
}

@media (max-width: 640px) {
   :root {
      --container-gutter: 1rem; /* 16px */
   }
}

@media (max-width: 480px) {
   :root {
      --space-10: 1.75rem;  /* 28px */
      --space-8: 1.5rem;    /* 24px */
      --space-6: 1.25rem;   /* 20px */
      --space-5: 1rem;      /* 16px */
      --space-4: 0.875rem;  /* 14px */
   }
}
```

- [ ] **Step 4: Kiểm tra không còn --space-10px, --space-14px, --space-70px được dùng**

```powershell
Select-String -Path "d:\web-lcd\my-app\src\**\*.css","d:\web-lcd\my-app\src\**\*.jsx" -Pattern "var\(--space-10px\)|var\(--space-14px\)|var\(--space-70px\)" -AllMatches
```

Expected: Không có kết quả.

- [ ] **Step 5: Commit**

```bash
git add my-app/src/global.css
git commit -m "refactor(css): merge duplicate spacing variables and convert to rem"
```
