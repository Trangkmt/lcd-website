# Design Spec: Project README.md

## Goal
Create a professional `README.md` file in the root directory of the project to provide an overview of features, installation steps, and usage instructions.

## Content Design (Professional Style - No Icons)

### 1. Title
LCD Website - Hệ thống quản trị Liên Chi Đoàn Khoa CNTT

### 2. Overview
Hệ thống quản lý thông tin, sự kiện và tài liệu học thuật cho Liên Chi Đoàn khoa Công nghệ thông tin (FIT). Nền tảng tích hợp Trí tuệ nhân tạo (AI) giúp tối ưu hóa quy trình truyền thông và quản trị nội dung.

### 3. Key Features
- Tạo bài viết bằng AI (AI-Powered Content): Tích hợp Gemini API (Giao diện lập trình AI) giúp tự động tạo nội dung bài viết từ các từ khóa và chủ đề.
- Quản lý Tin tức và Sự kiện (CMS - Content Management System): Hệ thống quản trị nội dung cho phép đăng tải, phân loại và quản lý trạng thái bài viết.
- Quản lý Tài liệu (Document Management): Hỗ trợ lưu trữ, chia sẻ và thống kê lượt tải các tài liệu học thuật (docx, pdf, xlsx).
- Dòng thời gian sự kiện (Timeline Events): Theo dõi các mốc hoạt động quan trọng của khoa theo từng năm.
- Quản lý Thành viên và Ban ngành (Teams and Members): Phân quyền người dùng theo vai trò và tổ chức theo sơ đồ ban chuyên môn.
- Hệ thống Liên hệ (Contact System): Tiếp nhận và xử lý yêu cầu hỗ trợ từ sinh viên.

### 4. Installation
- Prerequisites: Node.js (Version 18+), MySQL.
- Backend Setup: 
    1. npm install
    2. Setup .env with MySQL, Cloudinary, and Gemini API credentials.
    3. npm run db:init (Initialize database).
    4. npm run dev.
- Frontend Setup:
    1. npm install
    2. Setup .env with VITE_API_URL.
    3. npm run dev.

### 5. Usage
- Admin Access: Default credentials (admin / 123456).
- Public Access: View news, events, and download documents.

## Proposed Changes

### [NEW] [README.md](file:///d:/web-lcd/README.md)
Create the main documentation file in the root directory.

## Verification Plan
- Verify the file exists in the root directory.
- Verify all links and formatting are correct.
