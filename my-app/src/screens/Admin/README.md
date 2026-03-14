# Hệ thống Admin - Quản lý Liên Chi Đoàn

## 🚀 Tổng quan

Hệ thống admin hoàn chỉnh để quản lý tất cả các hoạt động của Liên Chi Đoàn Khoa CNTT, bao gồm:

- ✅ Quản lý bài viết (tạo thủ công & tích hợp AI)
- ✅ Quản lý danh mục
- ✅ Quản lý thành tích nổi bật
- ✅ Quản lý thành viên
- ✅ Quản lý liên hệ

## 📁 Cấu trúc thư mục

```
src/screens/Admin/
├── AdminLayout.jsx              # Layout chính với sidebar
├── AdminLayout.css
├── Dashboard.jsx                # Trang tổng quan
├── Dashboard.css
├── PostsManagement.jsx          # Quản lý bài viết
├── PostsManagement.css
├── CategoriesManagement.jsx     # Quản lý danh mục
├── CategoriesManagement.css
├── AchievementsManagement.jsx   # Quản lý thành tích
├── AchievementsManagement.css
├── MembersManagement.jsx        # Quản lý thành viên
├── MembersManagement.css
├── ContactsManagement.jsx       # Quản lý liên hệ
├── ContactsManagement.css
└── index.js                     # Export tất cả components
```

## 🌐 Routes

### Admin Routes (không có Header/Footer)
- `/admin` - Dashboard tổng quan
- `/admin/posts` - Quản lý bài viết
- `/admin/categories` - Quản lý danh mục
- `/admin/achievements` - Quản lý thành tích nổi bật
- `/admin/members` - Quản lý thành viên
- `/admin/contacts` - Quản lý liên hệ

### Public Routes (có Header/Footer)
- `/` - Trang chủ
- `/activity` - Trang hoạt động
- `/activity/:eventName` - Hoạt động theo năm
- `/activity/:eventName/:year` - Chi tiết hoạt động
- `/activity/:eventName/:year/post/:postId` - Chi tiết bài viết

## 📋 Chức năng chi tiết

### 1. Dashboard (Trang tổng quan)
- **Thống kê nhanh**: Số lượng bài viết, bài chờ duyệt, thành viên, liên hệ mới
- **Bài viết gần đây**: Danh sách 4 bài viết mới nhất
- **Hoạt động gần đây**: Timeline các hoạt động của admin
- **Thao tác nhanh**: Shortcut đến các tính năng chính

### 2. Quản lý bài viết
#### Tính năng chính:
- ✅ Xem danh sách tất cả bài viết với phân trang
- ✅ Tabs lọc: Tất cả / Chờ duyệt / Đã duyệt
- ✅ Tìm kiếm theo tiêu đề
- ✅ Lọc theo danh mục
- ✅ Đánh dấu bài viết nổi bật

#### Tạo bài viết:
- **Thủ công**: Nhập thông tin bằng tay
- **Tích hợp AI**: Tự động tạo nội dung từ yêu cầu

#### Form tạo bài viết gồm:
- Danh mục (dropdown)
- Tiêu đề
- Nội dung (textarea hoặc AI)
- Ảnh bìa (upload)
- Checkbox đặt làm nổi bật

#### Các danh mục:
1. Tin tức trường - khoa
2. Tin tức đại học
3. Tin liên chi đoàn
4. **Hoạt động thường niên**:
   - Chào tân
   - FIT Cup
   - THNB (Tháng hành động vì môi trường)
   - Quân sự
   - Talkshow
   - Cuộc thi
   - Prom cuối khóa
5. Thành tích nổi bật

### 3. Quản lý danh mục
- ✅ Xem tất cả danh mục dạng grid cards
- ✅ Mỗi card hiển thị: Tên, slug, số bài viết, mô tả
- ✅ Thêm danh mục mới
- ✅ Chỉnh sửa danh mục
- ✅ Xóa danh mục

### 4. Quản lý thành tích nổi bật
- ✅ Hiển thị danh sách thành tích với icon huy chương
- ✅ Thông tin: Tiêu đề, sinh viên, loại thành tích, năm, mô tả
- ✅ Thêm thành tích mới
- ✅ Upload ảnh minh chứng (multiple files)
- ✅ Chỉnh sửa và xóa thành tích

**Loại thành tích:**
- Sinh viên 5 tốt
- Cuộc thi
- Olympic
- Nghiên cứu khoa học
- Khác

### 5. Quản lý thành viên
- ✅ Hiển thị dạng grid cards với avatar
- ✅ Thông tin: Họ tên, email, SĐT, chức vụ, khoa/phòng
- ✅ Thêm thành viên mới
- ✅ Xem chi tiết thành viên
- ✅ Chỉnh sửa và xóa

**Chức vụ:**
- Bí thư
- Phó bí thư
- Ủy viên
- Thành viên

### 6. Quản lý liên hệ
- ✅ Hiển thị danh sách liên hệ
- ✅ Phân biệt đã đọc/chưa đọc (highlight màu)
- ✅ Status: Mới / Đã trả lời
- ✅ Xem chi tiết liên hệ
- ✅ Trả lời liên hệ qua email
- ✅ Xóa liên hệ

**Thông tin liên hệ:**
- Người gửi (tên, email)
- Chủ đề
- Nội dung
- Ngày gửi
- Trạng thái

## 🎨 Design System

### Colors
- **Primary**: `#667eea` (gradient với `#764ba2`)
- **Background**: `#f5f5f5`
- **Card**: `white` với `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`
- **Text**: `#1a1a1a` (heading), `#666` (body)
- **Border**: `#e0e0e0`

### Typography
- **Font**: Inter, Roboto với fallback system fonts
- **Heading**: 32px (page title), 20-24px (section titles)
- **Body**: 14-16px
- **Small**: 12-13px

### Components
- **Border radius**: 12px (cards), 8px (buttons)
- **Spacing**: 40px (page padding), 24px (gaps)
- **Shadows**: Subtle elevation with hover effects

## 🔐 Authentication (To-Do)

Hiện tại admin pages chưa có authentication. Cần thêm:
- Login page
- Session management
- Protected routes
- Role-based access control

## 🔌 API Integration (To-Do)

Các trang hiện đang sử dụng mock data. Cần kết nối với backend:
- RESTful API hoặc GraphQL
- State management (Redux/Zustand)
- Real-time updates (WebSocket)
- File upload service

## 📱 Responsive Design

Tất cả trang admin đều responsive:
- **Desktop**: Full layout với sidebar mở rộng
- **Tablet**: Sidebar collapsed, grid adapts
- **Mobile**: Sidebar icon-only, single column grids

## 🚀 Cách sử dụng

### Truy cập admin:
1. Mở trình duyệt và truy cập: `http://localhost:5173/admin`
2. Sẽ thấy Dashboard với tổng quan hệ thống
3. Click vào các mục trong sidebar để chuyển trang

### Tạo bài viết mới:
1. Vào `/admin/posts`
2. Click "Tạo bài viết mới"
3. Chọn chế độ: Thủ công hoặc AI
4. Điền thông tin và submit

### Quản lý danh mục:
1. Vào `/admin/categories`
2. Xem tất cả danh mục dạng cards
3. Click "Sửa" hoặc "Xóa" trên từng card

### Trả lời liên hệ:
1. Vào `/admin/contacts`
2. Click "Trả lời" trên tin nhắn cần trả lời
3. Nhập nội dung và gửi

## 🛠️ Tech Stack

- **React 19.2.4**
- **React Router DOM 7.12.0**
- **CSS Modules** (không cần thư viện CSS framework)
- **Vite** (build tool)

## 📝 Notes

### Tính năng AI (PostsManagement):
- Hiện đang có UI cho chế độ "Tạo bằng AI"
- Cần tích hợp với API AI (OpenAI, Gemini, etc.)
- Form có textarea để nhập yêu cầu cho AI
- Button "Tạo nội dung bằng AI" để trigger AI generation

### Form validation:
- Hiện tại chưa có validation
- Cần thêm validation cho tất cả forms
- Hiển thị error messages

### Data persistence:
- Hiện tại chưa lưu data
- Cần kết nối với backend/database
- Implement CRUD operations

## 📞 Support

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng liên hệ team phát triển.

---

**Version**: 1.0.0  
**Last Updated**: March 11, 2026
