# Create Project Root README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a professional `README.md` file in the root directory providing project overview, features, installation, and usage instructions.

**Architecture:** Single Markdown file in the root directory.

**Tech Stack:** Markdown.

---

### Task 1: Create README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md content**

Create `README.md` in the root directory with the following content:

```markdown
# LCD Website - Hệ thống quản trị Liên Chi Đoàn Khoa CNTT

Hệ thống quản lý thông tin, sự kiện và tài liệu học thuật cho Liên Chi Đoàn khoa Công nghệ thông tin (FIT) - Trường Đại học Kinh tế Quốc dân (NEU). Nền tảng tích hợp Trí tuệ nhân tạo (AI) giúp tối ưu hóa quy trình truyền thông và quản trị nội dung.

## Các tính năng chính (Key Features)

- **Tạo bài viết bằng AI (AI-Powered Content)**: Tích hợp Gemini API (Giao diện lập trình AI) giúp tự động tạo nội dung bài viết từ các từ khóa và chủ đề.
- **Quản lý Tin tức và Sự kiện (CMS - Content Management System)**: Hệ thống quản trị nội dung chuyên nghiệp cho phép đăng tải, phân loại và quản lý trạng thái bài viết (Tin tức, Sự kiện thường niên, Thành tích...).
- **Quản lý Tài liệu (Document Management)**: Hỗ trợ lưu trữ, chia sẻ và thống kê lượt tải các tài liệu học thuật (docx, pdf, xlsx). Hỗ trợ xem trước tài liệu trực tuyến.
- **Dòng thời gian sự kiện (Timeline Events)**: Theo dõi và hiển thị các mốc hoạt động quan trọng của Liên Chi Đoàn theo từng năm.
- **Quản lý Thành viên và Ban ngành (Teams and Members)**: Phân quyền người dùng theo vai trò (Admin, Author, Manager) và tổ chức theo sơ đồ các ban chuyên môn.
- **Hệ thống Liên hệ (Contact System)**: Tiếp nhận, quản lý và phản hồi các yêu cầu hỗ trợ từ sinh viên.

## Hướng dẫn cài đặt (Installation)

### Yêu cầu hệ thống (Prerequisites)
- Node.js (Phiên bản 18 trở lên)
- MySQL (Cơ sở dữ liệu)

### Các bước cài đặt

1. **Cấu hình Backend**:
   - Di chuyển vào thư mục `backend`: `cd backend`
   - Cài đặt thư viện: `npm install`
   - Tạo file `.env` từ `.env.example` và điền thông tin: MySQL, Cloudinary (Lưu trữ ảnh), và Gemini API Key.
   - Khởi tạo cơ sở dữ liệu: `npm run db:init`
   - Chạy server: `npm run dev`

2. **Cấu hình Frontend**:
   - Di chuyển vào thư mục `my-app`: `cd my-app`
   - Cài đặt thư viện: `npm install`
   - Cấu hình địa chỉ API (VITE_API_URL) trong file `.env`.
   - Khởi chạy ứng dụng: `npm run dev`

## Hướng dẫn sử dụng (Usage)

- **Giao diện người dùng**: Truy cập tại địa chỉ mặc định `http://localhost:5173` để xem tin tức và tải tài liệu.
- **Trang quản trị (Admin Dashboard)**: 
  - Đăng nhập để quản lý nội dung.
  - Tài khoản mặc định: `admin` / `123456`.
  - Sử dụng công cụ AI để hỗ trợ biên soạn nội dung bài viết nhanh chóng.
```

- [ ] **Step 2: Verify file existence**

Run: `ls README.md`
Expected: `README.md` exists in the root directory.

- [ ] **Step 3: Commit changes**

```bash
git add README.md docs/superpowers/specs/2026-05-02-readme-design.md docs/superpowers/plans/2026-05-02-create-root-readme.md
git commit -m "docs: add root README and design documentation"
```
