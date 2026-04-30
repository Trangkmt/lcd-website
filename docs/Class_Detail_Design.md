# THIẾT KẾ CHI TIẾT LỚP (CLASS DETAIL DESIGN) - BẢN ĐẦY ĐỦ HỆ THỐNG

Tài liệu này là bản hợp nhất cuối cùng, bao gồm tất cả thuộc tính và phương thức từ sơ đồ hệ thống.

---

### 1. Lớp: `User`
| Thành phần | Tên | Kiểu | Đặc tính |
|:---|:---|:---|:---|
| **Thuộc tính** | `id` | `int` | `[frozen]` |
| | `username` | `string` | `[frozen]` |
| | `password` | `string` | `[changeable]` |
| | `email` | `string` | `[changeable]` |
| | `full_name` | `string` | `[changeable]` |
| | `avatar_url` | `string` | `[changeable]` |
| | `role` | `string` | `[changeable]` |
| | `member_type` | `string` | `[changeable]` |
| | `student_code` | `string` | `[frozen]` |
| | `class_name` | `string` | `[changeable]` |
| | `department` | `string` | `[changeable]` |
| | `department_position` | `text` | `[changeable]` |
| | `is_active` | `boolean` | `[changeable]` |
| | `created_at` | `datetime` | `[readOnly]` |
| | `updated_at` | `datetime` | `[readOnly]` |
| **Phương thức** | `+ login(u, p)` | `boolean` | Đăng nhập hệ thống |
| | `+ getProfile(id)` | `User` | Lấy thông tin cá nhân |
| | `+ updateProfile(id, d)` | `boolean` | Cập nhật thông tin |
| | `+ changePassword(o, n)` | `boolean` | Đổi mật khẩu |

### 2. Lớp: `Admin` (Kế thừa User)
| Thành phần | Tên phương thức | Tham số | Ý nghĩa |
|:---|:---|:---|:---|
| **Phương thức** | `+ manageCategories()` | `(id, action)` | Quản lý danh mục |
| | `+ manageNews()` | `(id, action)` | Quản lý bài viết |
| | `+ manageDocuments()` | `(id, action)` | Quản lý tài liệu |
| | `+ manageActivities()` | `(id, action)` | Quản lý hoạt động |
| | `+ manageOrganizations()` | `(id, action)` | Quản lý sơ đồ tổ chức |
| | `+ manageTemplates()` | `(id, action)` | Quản lý mẫu bài viết |
| | `+ manageTimeline()` | `(id, action)` | Quản lý dòng thời gian |
| | `+ manageContacts()` | `(id, action)` | Quản lý liên hệ |
| | `+ manageSharedFolders()` | `(id, action)` | Quản lý thư mục dùng chung |

### 3. Lớp: `News`
| Thành phần | Tên | Kiểu | Đặc tính |
|:---|:---|:---|:---|
| **Thuộc tính** | `id`, `title`, `slug`, `summary`, `content` | ... | `[changeable]` |
| | `thumbnail` | `string` | `[changeable]` |
| | `view_count` | `int` | `[readOnly]` |
| | `is_featured` | `boolean` | `[changeable]` |
| | `is_published` | `boolean` | `[changeable]` |
| | `published_at`, `created_at`, `updated_at` | `datetime` | `[readOnly]` |
| **Phương thức** | `+ publish(id)` | `boolean` | Duyệt đăng bài |
| | `+ increaseViewCount(id)` | `void` | Tăng lượt xem |

### 4. Lớp: `Activity`
| Thành phần | Tên | Kiểu | Đặc tính |
|:---|:---|:---|:---|
| **Thuộc tính** | `id`, `title`, `slug`, `description`, `content` | ... | `[changeable]` |
| | `location`, `start_date`, `end_date`, `organizer` | ... | `[changeable]` |
| | `thumbnail`, `images` | `string/text` | `[changeable]` |
| | `view_count` | `int` | `[readOnly]` |
| | `is_featured`, `is_published` | `boolean` | `[changeable]` |
| **Phương thức** | `+ getByYear(year)` | `List` | Lọc theo năm |

### 5. Lớp: `ContactInfo`
| Thành phần | Tên | Kiểu | Đặc tính |
|:---|:---|:---|:---|
| **Thuộc tính** | `id`, `name`, `email`, `phone`, `subject`, `message` | ... | `[frozen]` |
| | `is_read`, `is_replied` | `boolean` | `[changeable]` |
| | `replied_at`, `created_at` | `datetime` | `[readOnly]` |
| **Phương thức** | `+ markAsReplied(id, msg)` | `boolean` | Phản hồi liên hệ |

### 6. Lớp mới: `PostTemplate`
| Thành phần | Tên | Kiểu | Đặc tính |
|:---|:---|:---|:---|
| **Thuộc tính** | `id` | `int` | `[frozen]` |
| | `name`, `title_template`, `summary_template`, `content_template` | `string/text` | `[changeable]` |
| | `is_default`, `is_active` | `boolean` | `[changeable]` |
| **Phương thức** | `+ getAll()`, `+create()`, `+update()`, `+delete()` | ... | Quản lý mẫu |
