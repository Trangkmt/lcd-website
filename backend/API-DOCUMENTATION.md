# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

## 🤖 AI API

### POST `/api/ai/generate-post`
Tạo nội dung bài viết tự động bằng AI theo từ khóa.

```json
{
  "keywords": "tu khoa 1, tu khoa 2",
  "topic": "chu de bai viet",
  "page_type": "news"
}
```

**Response:**
```json
{
  "title": "...",
  "summary": "...",
  "content": "..."
}
```

---

## 🔐 Auth API

### POST `/api/auth/login`
Đăng nhập bằng `username` hoặc `email`
```json
{
  "username": "string (optional nếu có email)",
  "email": "string (optional nếu có username)",
  "password": "string (required)"
}
```

**Response thành công:**
```json
{
  "message": "Đăng nhập thành công",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@myapp.com",
    "full_name": "Nguyễn Văn Admin",
    "role": "admin",
    "is_active": true
  }
}
```

---

### 🏥 Health Check
**GET** `/api/health`
- Kiểm tra server và database connection
- Response: `{ status, database, dbname, timestamp }`

## 👥 Users API

### GET `/api/users`
Lấy danh sách tất cả users

### GET `/api/users/:id`
*(Hiện không sử dụng trên Frontend)*
Lấy user theo ID

### POST `/api/users`
Tạo user mới
Tạo user mới
```json
{
  "username": "string (required)",
  "password": "string (required)",
  "email": "string (required)",
  "full_name": "string",
  "role": "admin | user"
}
```

### PUT `/api/users/:id`
Cập nhật user
```json
{
  "email": "string",
  "full_name": "string",
  "role": "admin | user",
  "is_active": true | false
}
```

### DELETE `/api/users/:id`
*(Hiện không sử dụng trên Frontend)*
Xóa user

---

## 📁 Categories API

### GET `/api/categories`
Lấy danh sách categories (bao gồm trường `subcategories_count`)

### GET `/api/categories/:id`
*(Hiện không sử dụng trên Frontend)*
Lấy category theo ID (bao gồm trường `subcategories_count`)

### POST `/api/categories`
Tạo category mới
```json
{
  "name": "string (required)",
  "slug": "string (required)",
  "description": "string",
  "parent_id": number,
  "display_order": number
}
```

### PUT `/api/categories/:id`
Cập nhật category

### DELETE `/api/categories/:id`
Xóa category

---

## 📰 Posts API

### GET `/api/posts`
Lấy danh sách bài viết
**Query params:**
- `category_id`: number
- `is_featured`: true | false
- `limit`: number (default: 50)
- `offset`: number (default: 0)

### GET `/api/posts/:id`
Lấy bài viết theo ID (tăng view count)

### GET `/api/posts/slug/:slug`
Lấy bài viết theo slug (tăng view count)

### POST `/api/posts`
Tạo bài viết mới
```json
{
  "title": "string (required)",
  "slug": "string (required)",
  "summary": "string",
  "content": "string",
  "thumbnail": "string",
  "category_id": number,
  "author_id": number,
  "is_featured": true | false,
  "is_published": true | false
}
```

### PUT `/api/posts/:id`
Cập nhật bài viết

### DELETE `/api/posts/:id`
Xóa bài viết

---

## 📄 Documents API

### GET `/api/documents`
Lấy danh sách tài liệu
**Query params:**
- `category_id`: number
- `is_public`: true | false
- `limit`: number (default: 50)
- `offset`: number (default: 0)

### GET `/api/documents/:id`
Lấy tài liệu theo ID

### POST `/api/documents`
Tạo tài liệu mới
```json
{
  "title": "string (required)",
  "description": "string",
  "file_name": "string (required)",
  "file_path": "string (required)",
  "file_size": number,
  "file_type": "string",
  "category_id": number,
  "uploaded_by": number,
  "is_public": true | false
}
```

### POST `/api/documents/:id/download`
Tăng download count

### PUT `/api/documents/:id`
Cập nhật tài liệu

### DELETE `/api/documents/:id`
Xóa tài liệu

---

## 🎯 Activities API

### GET `/api/activities`
Lấy danh sách hoạt động
**Query params:**
- `category_id`: number
- `is_featured`: true | false
- `year`: number
- `limit`: number (default: 50)
- `offset`: number (default: 0)

### GET `/api/activities/:id`
Lấy hoạt động theo ID (tăng view count)

### GET `/api/activities/slug/:slug`
Lấy hoạt động theo slug (tăng view count)

### GET `/api/activities/year/:year`
Lấy hoạt động theo năm

### POST `/api/activities`
Tạo hoạt động mới
```json
{
  "title": "string (required)",
  "slug": "string (required)",
  "description": "string",
  "content": "string",
  "location": "string",
  "start_date": "datetime",
  "end_date": "datetime",
  "thumbnail": "string",
  "images": "string",
  "organizer": "string",
  "category_id": number,
  "created_by": number,
  "is_featured": true | false,
  "is_published": true | false
}
```

### PUT `/api/activities/:id`
Cập nhật hoạt động

### DELETE `/api/activities/:id`
Xóa hoạt động

---
## 🏢 Teams API (Read-only)

### GET `/api/teams`
Lấy danh sách tổ chức

### GET `/api/teams/:id`
Lấy tổ chức theo ID

---


## 📧 Contact API

### GET `/api/contact`
Lấy danh sách liên hệ
**Query params:**
- `is_read`: true | false
- `is_replied`: true | false
- `limit`: number (default: 50)
- `offset`: number (default: 0)

### GET `/api/contact/stats`
Thống kê liên hệ
**Response:**
```json
{
  "total": number,
  "unread": number,
  "unreplied": number,
  "replied": number
}
```

### GET `/api/contact/:id`
*(Hiện không sử dụng trên Frontend)*
Lấy liên hệ theo ID (tự động đánh dấu đã đọc)
**Response includes:**
- `read_by`, `read_by_name`
- `replied_by`, `replied_by_name`
- `is_deleted`, `deleted_by`, `deleted_by_name`, `deleted_at`

### POST `/api/contact`
Tạo liên hệ mới (Form liên hệ từ frontend)
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string",
  "subject": "string",
  "message": "string (required)"
}
```

### PUT `/api/contact/:id/read`
Đánh dấu đã đọc

### PUT `/api/contact/:id/reply`
Đánh dấu đã trả lời

### DELETE `/api/contact/:id`
Xóa liên hệ

---

## ⚙️ Error Responses

### 400 Bad Request
```json
{
  "error": "Message lỗi validation"
}
```

### 404 Not Found
```json
{
  "error": "Resource không tồn tại"
}
```

### 500 Internal Server Error
```json
{
  "error": "Message lỗi server"
}
```

---

## 🔧 Testing APIs

### Sử dụng cURL:
```bash
# Health check
curl http://localhost:5000/api/health

# Lấy danh sách bài viết
curl http://localhost:5000/api/posts

# Tạo contact mới
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello"}'
```

### Sử dụng Postman hoặc VS Code REST Client:
Import collection hoặc tạo requests theo format trên.

---

## 📝 Notes

- Tất cả datetime được return ở định dạng ISO 8601
- Pagination sử dụng `limit` và `offset`
- Các endpoint GET có thể có query parameters để filter
- POST/PUT yêu cầu `Content-Type: application/json`
- Các endpoint có tăng view count: `/posts/:id`, `/posts/slug/:slug`, `/activities/:id`, `/activities/slug/:slug`
