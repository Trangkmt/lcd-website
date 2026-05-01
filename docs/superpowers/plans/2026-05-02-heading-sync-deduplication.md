# Heading Sync and CSS Deduplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đồng bộ style h1, h2 với màu darkslateblue và dọn dẹp code CSS trùng lặp bằng cách đưa các style chung (button, form) vào global.css.

**Architecture:** Sử dụng Utility-First approach kết hợp với Global Tag Styling. Chuyển các định nghĩa lặp lại nhiều lần thành các class dùng chung trong `global.css`.

**Tech Stack:** CSS (Vanilla), React (JSX)

---

### Task 1: Định nghĩa Headings và Common Utilities trong global.css

**Files:**
- Modify: `my-app/src/global.css`

- [ ] **Step 1: Cập nhật style cho h1, h2**

Thêm font-size và màu sắc chuẩn cho h1, h2.

```css
h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 800;
    color: var(--color-darkslateblue);
    line-height: 1.2;
    margin-bottom: var(--space-6);
}

h2 {
    font-size: clamp(1.35rem, 3vw, 1.875rem);
    font-weight: 700;
    color: var(--color-darkslateblue);
    line-height: 1.3;
    margin-bottom: var(--space-4);
}
```

- [ ] **Step 2: Tạo Global Button Utilities**

Chuyển các style button từ PostsManagement/MembersManagement vào đây.

```css
/* Buttons - Global Utilities */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    font-family: var(--font-primary);
}

.btn-primary {
    background: var(--color-primary);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    background: var(--color-brand-hover);
    box-shadow: 0 4px 12px rgba(44, 107, 204, 0.2);
}

.btn-secondary {
    background: var(--color-white);
    color: var(--color-text-primary);
    border-color: var(--color-gray-300);
}

.btn-secondary:hover {
    background: var(--color-gray-50);
    border-color: var(--color-gray-400);
}
```

- [ ] **Step 3: Tạo Global Form Utilities**

```css
/* Form - Global Utilities */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
}

.form-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
}

.form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-gray-300);
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    color: var(--color-text-primary);
    transition: all 0.2s ease;
    font-family: var(--font-primary);
}

.form-control:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(44, 107, 204, 0.1);
}
```

### Task 2: Dọn dẹp trùng lặp trong PostsManagement.css

**Files:**
- Modify: `my-app/src/screens/Admin/PostsManagement/PostsManagement.css`

- [ ] **Step 1: Xóa các định nghĩa button và form lặp lại**

Xóa các block: `.btn-primary`, `.btn-secondary`, `.form-group`, `.form-label`, `.form-control`, `.page-title` (nếu h1 đã cover đủ).

- [ ] **Step 2: Xóa font-family khai báo cục bộ**

Kiểm tra và xóa các dòng `font-family: 'Inter', ...` nếu đã có trong `body` hoặc `global.css`.

### Task 3: Dọn dẹp trùng lặp trong MembersManagement.css

**Files:**
- Modify: `my-app/src/screens/Admin/MembersManagement/MembersManagement.css`

- [ ] **Step 1: Xóa các định nghĩa lặp lại**

Xóa các block: `.btn-primary`, `.btn-secondary`, `.form-group`, `.form-label`, `.form-control`, `.members-management .form-group` (vì đã có utility).

### Task 4: Kiểm tra và cập nhật các component Headings

**Files:**
- Modify: `my-app/src/screens/Admin/Dashboard/Dashboard.css`
- Modify: `my-app/src/screens/Admin/AdminLayout/AdminLayout.css`
- Modify: `my-app/src/screens/User/Homepage/Homepage.css`

- [ ] **Step 1: Xóa các định nghĩa Heading Color thủ công**

Tìm các file có định nghĩa màu cho h1, h2 (thường là `#333` hoặc `#1A1A1A`) và xóa chúng để kế thừa `darkslateblue` từ `global.css`.

---

### Task 5: Commit và Verification

- [ ] **Step 1: Kiểm tra giao diện**

Chạy `npm run dev` và kiểm tra các trang:
1. Dashboard (Màu h1, h2 mới)
2. Quản lý bài viết (Button, Form hoạt động bình thường)
3. Trang chủ người dùng

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "refactor(css): sync headings with darkslateblue and deduplicate common styles"
```
