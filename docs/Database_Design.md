# THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)

Tài liệu này mô tả chi tiết cấu trúc các bảng trong Cơ sở dữ liệu MySQL của hệ thống Web LCD.

---

### 1. Bảng: `users` (Người dùng)
Lưu trữ thông tin tài khoản và phân quyền của thành viên hệ thống.

| Tên trường | Kiểu dữ liệu | Kích thước | Ràng buộc | Mô tả |
|:---|:---|:---|:---|:---|
| `id` | INT | | PRIMARY KEY, AUTO_INCREMENT | ID định danh duy nhất |
| `username` | VARCHAR | 50 | NOT NULL, UNIQUE | Tên đăng nhập |
| `password` | VARCHAR | 255 | NOT NULL | Mật khẩu (đã mã hóa) |
| `email` | VARCHAR | 100 | NOT NULL, UNIQUE | Địa chỉ Email |
| `full_name` | VARCHAR | 100 | | Họ và tên đầy đủ |
| `avatar_url` | VARCHAR | 500 | | Đường dẫn ảnh đại diện |
| `role` | ENUM | | NOT NULL | Vai trò: admin_full, utility_only, contact_manager, post_author |
| `member_type` | ENUM | | NOT NULL | Loại: student, teacher |
| `student_code` | VARCHAR | 30 | | Mã sinh viên |
| `class_name` | VARCHAR | 50 | | Tên lớp |
| `department` | VARCHAR | 100 | | Khoa/Ban/Phòng |
| `department_position`| TEXT | | | Chức vụ trong đơn vị |
| `is_active` | BOOLEAN | | DEFAULT TRUE | Trạng thái kích hoạt tài khoản |
| `created_at` | DATETIME | | DEFAULT CURRENT_TIMESTAMP | Thời điểm tạo |
| `updated_at` | DATETIME | | ON UPDATE CURRENT_TIMESTAMP | Thời điểm cập nhật cuối |

---

### 2. Bảng: `categories` (Danh mục)
Phân loại các bài viết, hoạt động và tài liệu.

| Tên trường | Kiểu dữ liệu | Kích thước | Ràng buộc | Mô tả |
|:---|:---|:---|:---|:---|
| `id` | INT | | PRIMARY KEY, AUTO_INCREMENT | ID danh mục |
| `name` | VARCHAR | 100 | NOT NULL | Tên danh mục hiển thị |
| `slug` | VARCHAR | 100 | NOT NULL, UNIQUE | Đường dẫn thân thiện |
| `description` | TEXT | | | Mô tả chi tiết danh mục |
| `intro_image` | VARCHAR | 500 | | Ảnh giới thiệu danh mục |
| `parent_id` | INT | | FOREIGN KEY (categories.id) | ID danh mục cha (để phân cấp) |
| `page_type` | VARCHAR | 50 | DEFAULT 'news' | Loại trang: news, activity, document... |
| `display_order` | INT | | DEFAULT 0 | Thứ tự hiển thị |
| `is_active` | BOOLEAN | | DEFAULT TRUE | Trạng thái hoạt động |

---

### 3. Bảng: `news` (Tin tức)
Lưu trữ nội dung các bài viết tin tức, thông báo.

| Tên trường | Kiểu dữ liệu | Kích thước | Ràng buộc | Mô tả |
|:---|:---|:---|:---|:---|
| `id` | INT | | PRIMARY KEY, AUTO_INCREMENT | ID bài viết |
| `title` | VARCHAR | 255 | NOT NULL | Tiêu đề bài viết |
| `slug` | VARCHAR | 255 | NOT NULL, UNIQUE | Đường dẫn bài viết |
| `summary` | TEXT | | | Tóm tắt ngắn gọn |
| `content` | LONGTEXT | | | Nội dung chi tiết bài viết |
| `thumbnail` | VARCHAR | 255 | | Ảnh đại diện bài viết |
| `category_id` | INT | | FOREIGN KEY (categories.id) | Thuộc danh mục nào |
| `author_id` | INT | | FOREIGN KEY (users.id) | ID người viết bài |
| `view_count` | INT | | DEFAULT 0 | Số lượt xem |
| `is_featured` | BOOLEAN | | DEFAULT FALSE | Bài viết nổi bật (Highlight) |
| `is_published` | BOOLEAN | | DEFAULT FALSE | Trạng thái xuất bản |
| `published_at` | DATETIME | | | Thời điểm đăng bài |

---

### 4. Bảng: `activities` (Hoạt động)
Lưu trữ thông tin về các sự kiện, hoạt động đoàn hội.

| Tên trường | Kiểu dữ liệu | Kích thước | Ràng buộc | Mô tả |
|:---|:---|:---|:---|:---|
| `id` | INT | | PRIMARY KEY, AUTO_INCREMENT | ID hoạt động |
| `title` | VARCHAR | 255 | NOT NULL | Tên hoạt động |
| `slug` | VARCHAR | 255 | NOT NULL, UNIQUE | Đường dẫn hoạt động |
| `location` | VARCHAR | 255 | | Địa điểm tổ chức |
| `start_date` | DATETIME | | | Thời gian bắt đầu |
| `end_date` | DATETIME | | | Thời gian kết thúc |
| `organizer` | VARCHAR | 255 | | Đơn vị tổ chức |
| `category_id` | INT | | FOREIGN KEY (categories.id) | Loại hoạt động |
| `is_published` | BOOLEAN | | DEFAULT TRUE | Trạng thái hiển thị |

---

### 5. Bảng: `timeline_events` (Sự kiện Timeline)
Lưu trữ các mốc sự kiện thường niên trên Timeline.

| Tên trường | Kiểu dữ liệu | Kích thước | Ràng buộc | Mô tả |
|:---|:---|:---|:---|:---|
| `id` | INT | | PRIMARY KEY, AUTO_INCREMENT | ID sự kiện |
| `event_type` | ENUM | | DEFAULT 'annual' | Loại sự kiện (thường niên) |
| `month` | TINYINT | | NOT NULL (1-12) | Tháng diễn ra |
| `year` | SMALLINT | | NOT NULL (2000-2100) | Năm diễn ra |
| `event_name` | VARCHAR | 255 | NOT NULL | Tên sự kiện |
| `summary` | TEXT | | | Mô tả ngắn gọn sự kiện |
| `sort_order` | INT | | DEFAULT 0 | Thứ tự sắp xếp |

---

### 6. Bảng: `documents` (Tài liệu)
Quản lý các tệp tin tài liệu tải lên.

| Tên trường | Kiểu dữ liệu | Kích thước | Ràng buộc | Mô tả |
|:---|:---|:---|:---|:---|
| `id` | INT | | PRIMARY KEY, AUTO_INCREMENT | ID tài liệu |
| `title` | VARCHAR | 255 | NOT NULL | Tiêu đề tài liệu |
| `file_name` | VARCHAR | 255 | NOT NULL | Tên tệp gốc |
| `file_path` | VARCHAR | 500 | NOT NULL | Đường dẫn lưu trữ tệp |
| `file_size` | BIGINT | | | Dung lượng tệp (bytes) |
| `file_type` | VARCHAR | 50 | | Định dạng tệp (pdf, docx...) |
| `download_count`| INT | | DEFAULT 0 | Số lượt tải về |

---

### 7. Bảng: `organizations` (Cơ cấu tổ chức)
Lưu trữ thông tin các ban ngành, tổ chức trong Liên chi đoàn.

| Tên trường | Kiểu dữ liệu | Kích thước | Ràng buộc | Mô tả |
|:---|:---|:---|:---|:---|
| `id` | INT | | PRIMARY KEY, AUTO_INCREMENT | ID tổ chức |
| `name` | VARCHAR | 255 | NOT NULL | Tên đầy đủ |
| `name_abbr` | VARCHAR | 50 | | Tên viết tắt (BCH, TTKT...) |
| `logo` | VARCHAR | 255 | | Đường dẫn Logo |
| `parent_id` | INT | | FOREIGN KEY (organizations.id) | Cấp trên trực tiếp |

---

### 8. Bảng: `contact_info` (Thông tin liên hệ)
Lưu trữ các lời nhắn từ người dùng gửi qua form liên hệ.

| Tên trường | Kiểu dữ liệu | Kích thước | Ràng buộc | Mô tả |
|:---|:---|:---|:---|:---|
| `id` | INT | | PRIMARY KEY, AUTO_INCREMENT | ID lời nhắn |
| `name` | VARCHAR | 100 | NOT NULL | Tên người gửi |
| `email` | VARCHAR | 100 | NOT NULL | Email người gửi |
| `subject` | VARCHAR | 255 | | Chủ đề |
| `message` | TEXT | | | Nội dung lời nhắn |
| `is_read` | BOOLEAN | | DEFAULT FALSE | Đã đọc hay chưa |

---

### 9. Bảng: `post_templates` (Mẫu bài viết)
Lưu trữ các mẫu nội dung soạn thảo sẵn.

| Tên trường | Kiểu dữ liệu | Kích thước | Ràng buộc | Mô tả |
|:---|:---|:---|:---|:---|
| `id` | INT | | PRIMARY KEY, AUTO_INCREMENT | ID mẫu |
| `name` | VARCHAR | 255 | NOT NULL | Tên mẫu bài viết |
| `content_template`| LONGTEXT | | | Nội dung mẫu (HTML/Markdown) |
| `category_id` | INT | | FOREIGN KEY (categories.id) | Áp dụng cho danh mục nào |
