# LCD Website - Hệ thống quản trị Liên Chi Đoàn Khoa CNTT

Hệ thống quản lý thông tin, sự kiện và tài liệu học thuật cho Liên Chi Đoàn khoa Công nghệ thông tin - Trường Đại học Kinh tế Quốc dân. Nền tảng tích hợp AI giúp tối ưu hóa quy trình truyền thông và quản trị nội dung.

## Các tính năng chính

- **Tạo bài viết bằng AI**: Tích hợp Gemini API giúp tự động tạo nội dung bài viết từ các từ khóa và chủ đề.
- **Quản lý Tin tức và Sự kiện**: Hệ thống quản trị nội dung chuyên nghiệp cho phép đăng tải, phân loại và quản lý trạng thái bài viết (Tin tức, Sự kiện thường niên, Thành tích...).
- **Quản lý Tài liệu**: Hỗ trợ lưu trữ, chia sẻ và thống kê lượt tải các tài liệu học thuật (docx, pdf, xlsx). Hỗ trợ xem trước tài liệu trực tuyến.
- **Dòng thời gian sự kiện**: Theo dõi và hiển thị các mốc hoạt động quan trọng của Liên Chi Đoàn theo từng năm.
- **Quản lý Thành viên**: Phân quyền người dùng theo vai trò (Admin,Post Author,Contact manager,Utility manager) và tổ chức theo sơ đồ các ban chuyên môn.
- **Hệ thống Liên hệ**: Tiếp nhận, quản lý và phản hồi các yêu cầu hỗ trợ từ sinh viên.

## Hướng dẫn cài đặt

### Yêu cầu hệ thống
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

## Hướng dẫn sử dụng

- **Giao diện người dùng**: Truy cập tại địa chỉ mặc định `http://localhost:5173` để xem tin tức và tải tài liệu.
- **Trang quản trị (Admin Dashboard)**: 
  - Đăng nhập để quản lý nội dung.
  - Tài khoản mặc định: `admin` / `123456`.
  - Sử dụng công cụ AI để hỗ trợ biên soạn nội dung bài viết nhanh chóng.
