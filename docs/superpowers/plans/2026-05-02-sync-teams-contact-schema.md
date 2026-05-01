# Đồng bộ Database Schema và Backend cho Teams & Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đồng bộ cấu trúc bảng `teams` (xóa các trường không dùng) và `contact_info` (thêm các trường thiếu) giữa Database SQL và logic xử lý trong Backend.

**Architecture:** Cập nhật file schema gốc `MySql.sql` và điều chỉnh logic xử lý dữ liệu trong các controllers để đảm bảo tính nhất quán, bao gồm cả ràng buộc khóa ngoại (Foreign Keys) cho bảng liên hệ.

**Tech Stack:** MySQL (SQL Schema), Node.js (Express Controllers)

---

### Task 1: Cập nhật Schema Database trong `MySql.sql`

**Files:**
- Modify: `MySql.sql`

- [ ] **Step 1: Cập nhật định nghĩa bảng `teams`**
    - Xóa các cột: `logo`, `website`, `email`, `phone`, `address`, `parent_id`, `is_active`.
    - Xóa ràng buộc khóa ngoại `FOREIGN KEY (parent_id)`.

- [ ] **Step 2: Cập nhật định nghĩa bảng `contact_info`**
    - Thêm các cột: `is_deleted`, `read_by`, `replied_by`, `deleted_by`, `deleted_at`.
    - Thêm ràng buộc khóa ngoại tới bảng `users`.

- [ ] **Step 3: Cập nhật các câu lệnh `INSERT` mẫu**
    - Điều chỉnh các lệnh `INSERT INTO teams` và `INSERT INTO contact_info` cho khớp với số lượng cột mới.

- [ ] **Step 4: Cập nhật các Indexes**
    - Thêm index cho `is_deleted` và các cột liên quan trong `contact_info`.

### Task 2: Kiểm tra và dọn dẹp Backend Controllers

**Files:**
- Modify: `backend/controllers/teamsController.js`
- Modify: `backend/controllers/contactController.js`

- [ ] **Step 1: Xác minh `teamsController.js` không còn tham chiếu các trường đã xóa**
- [ ] **Step 2: Đảm bảo `contactController.js` sử dụng đúng kiểu dữ liệu**
- [ ] **Step 3: Khởi động lại Backend và kiểm tra kết nối**
