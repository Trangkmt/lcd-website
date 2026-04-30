# CÁC BIỂU ĐỒ TRÌNH TỰ (SEQUENCE DIAGRAMS) - CHI TIẾT NGHIỆP VỤ

Tài liệu này mô tả chi tiết các luồng tương tác giữa **Người dùng (Actor)**, **Giao diện**, và **Backend** dựa trên logic thực tế của Codebase và Biểu đồ hoạt động.

---

### 1. **TẠO THÀNH VIÊN MỚI**

```mermaid
sequenceDiagram
    actor A as "Quản trị viên"
    participant B as Giao diện Thành viên
    participant BE as Backend
    
    A->>B: 1: Mở form tạo thành viên
    B->>BE: 1.1: Lấy danh sách Vai trò & Ban/Phòng/Khoa
    activate BE
    BE-->B: 1.2: Trả về danh sách dữ liệu
    deactivate BE
    
    A->>B: 2: Nhập thông tin thành viên & Gán vai trò, đơn vị
    A->>B: 3: Nhấn "Lưu thành viên"
    
    B->>B: 3.1: Kiểm tra tính hợp lệ dữ liệu (Validate)
    activate B
    deactivate B
    
    opt Dữ liệu đủ & Hợp lệ
        B->>BE: 4: Gửi yêu cầu tạo tài khoản mới
        activate BE
        BE->>BE: 4.1: Kiểm tra Username/Email đã tồn tại chưa
        activate BE
        deactivate BE
        
        opt Chưa tồn tại
            BE->>BE: 4.2: Lưu thông tin User & Vai trò & Đơn vị
            activate BE
            deactivate BE
            BE-->B: 4.3: Xác nhận tạo thành công
        end
        
        opt Đã tồn tại
            BE-->B: 4.4: Trả về lỗi trùng lặp dữ liệu
        end
        deactivate BE
    end
    
    B-->A: 5: Hiển thị thông báo kết quả tương ứng
```

---

### 2. **CẬP NHẬT 1 BÀI VIẾT**

```mermaid
sequenceDiagram
    actor A as "Quản trị viên"
    participant B as Giao diện Chỉnh sửa Bài viết
    participant BE as Backend
    
    A->>B: 1: Chọn bài viết cần sửa
    B->>BE: 1.1: Lấy dữ liệu chi tiết bài viết (ID)
    activate BE
    BE-->B: 1.2: Trả về dữ liệu bài viết hiện tại
    deactivate BE
    
    A->>B: 2: Chỉnh sửa tiêu đề, nội dung, ảnh...
    A->>B: 3: Nhấn "Lưu cập nhật"
    
    B->>BE: 4: Gửi thông tin cập nhật (ID, data)
    activate BE
    BE->>BE: 4.1: Kiểm tra quyền chỉnh sửa
    activate BE
    deactivate BE
    
    opt Có quyền chỉnh sửa (Admin hoặc Chính tác giả)
        BE->>BE: 4.2: Cập nhật thông tin vào CSDL
        activate BE
        deactivate BE
        BE-->B: 4.3: Xác nhận cập nhật thành công
    end
    
    opt Không có quyền hoặc Lỗi
        BE-->B: 4.4: Trả về thông báo lỗi
    end
    deactivate BE
    
    B-->A: 5: Thông báo kết quả cập nhật cho quản trị viên
```

---

### 3. **XOÁ 1 BÀI VIẾT**

```mermaid
sequenceDiagram
    actor A as "Quản trị viên"
    participant B as Giao diện Quản lý Bài viết
    participant BE as Backend
    
    A->>B: 1: Chọn bài viết cần xoá
    A->>B: 2: Xác nhận xoá (Confirm dialog)
    
    B->>BE: 3: Gửi yêu cầu xoá (ID)
    activate BE
    BE->>BE: 3.1: Kiểm tra quyền xoá
    activate BE
    deactivate BE
    
    opt Hợp lệ
        BE->>BE: 3.2: Xoá bài viết khỏi hệ thống
        activate BE
        deactivate BE
        BE-->B: 3.3: Xác nhận xoá thành công
    end
    
    opt Thất bại
        BE-->B: 3.4: Báo lỗi không tìm thấy hoặc không có quyền
    end
    deactivate BE
    
    B-->A: 4: Hiển thị thông báo kết quả xoá
```

---

### 4. **XUẤT GIẤY MỜI/GIẤY CHỨNG NHẬN HÀNG LOẠT**

```mermaid
sequenceDiagram
    actor A as "Quản trị viên"
    participant B as Giao diện Xuất file
    participant BE as Backend
    
    A->>B: 1: Chọn danh sách thành viên & Loại giấy & Thông tin bổ sung
    A->>B: 2: Nhấn nút "Xuất giấy"
    
    B->>BE: 3: Gửi yêu cầu tạo file hàng loạt (TemplateID, MemberIDs)
    activate BE
    BE->>BE: 3.1: Lấy dữ liệu thành viên & Mapping vào Template
    activate BE
    deactivate BE
    BE->>BE: 3.2: Render file (Docx/PDF)
    activate BE
    deactivate BE
    BE-->B: 3.3: Trả về link tải file đã nén (zip) hoặc file đơn
    deactivate BE
    
    B-->A: 4: Thông báo hoàn thành & Hiển thị nút Tải file
    A->>B: 5: Click tải file về máy
```

---

### 5. **UPLOAD 1 FILE LÊN FOLDER CHUNG**

```mermaid
sequenceDiagram
    actor A as "Quản trị viên"
    participant B as Giao diện Tài liệu
    participant BE as Backend
    
    A->>B: 1: Chọn file từ máy tính & Chọn folder chung
    A->>B: 2: Nhấn nút "Upload"
    
    B->>BE: 3: Gửi file yêu cầu upload (Multipart form)
    activate BE
    BE->>BE: 3.1: Kiểm tra định dạng & dung lượng file
    activate BE
    deactivate BE
    
    opt Hợp lệ
        BE->>BE: 3.2: Lưu file vật lý vào Cloud/Storage
        activate BE
        deactivate BE
        BE->>BE: 3.3: Lưu bản ghi Metadata vào CSDL
        activate BE
        deactivate BE
        BE-->B: 3.4: Trả về kết quả thành công
    end
    
    opt Không hợp lệ
        BE-->B: 3.5: Trả về lỗi (File quá lớn/Sai định dạng)
    end
    deactivate BE
    
    B-->A: 4: Thông báo kết quả upload file
```

---

### 6. **XEM CHI TIẾT 1 BÀI VIẾT TRÊN WEB NGƯỜI DÙNG**

```mermaid
sequenceDiagram
    actor U as "Người dùng"
    participant B as Giao diện Chi tiết Bài viết
    participant BE as Backend
    
    U->>B: 1: Click chọn bài viết muốn xem
    B->>BE: 2: Gọi API lấy thông tin bài viết (Slug/ID)
    activate BE
    
    BE->>BE: 2.1: Truy vấn bài viết & Kiểm tra trạng thái is_published
    activate BE
    deactivate BE
    
    opt Bài viết tồn tại & Đã đăng
        BE->>BE: 2.2: Tăng số lượt xem (view_count + 1)
        activate BE
        deactivate BE
        BE-->B: 2.3: Trả về đầy đủ nội dung bài viết
    end
    
    opt Không tìm thấy
        BE-->B: 2.4: Trả về lỗi 404
    end
    deactivate BE
    
    B->>B: 3: Hiển thị đầy đủ thông tin (Tiêu đề, Nội dung, Ảnh...)
```

---

### 7. **TÌM KIẾM BÀI VIẾT TRÊN WEB NGƯỜI DÙNG**

```mermaid
sequenceDiagram
    actor U as "Người dùng"
    participant B as Giao diện Tìm kiếm
    participant BE as Backend
    
    U->>B: 1: Nhập từ khoá tìm kiếm & Nhấn Enter/Nút Tìm
    B->>BE: 2: Gửi yêu cầu tìm kiếm (keyword)
    activate BE
    
    BE->>BE: 2.1: Search trong Database (Tiêu đề/Tóm tắt)
    activate BE
    deactivate BE
    BE-->B: 2.2: Trả về danh sách bài viết phù hợp
    deactivate BE
    
    B->>B: 3: Hiển thị danh sách kết quả (Thumbnail, Title, Date)
    U->>B: 4: Chọn bài viết từ danh sách kết quả
```

---

### 8. **TẠO BÀI VIẾT MỚI (CHI TIẾT NGHIỆP VỤ)**

```mermaid
sequenceDiagram
    actor A as "Quản trị viên"
    participant B as Giao diện Tạo bài viết
    participant AI as Dịch vụ AI
    participant BE as Backend
    
    A->>B: 1: Chọn nút "Tạo bài viết"
    B->>BE: 1.1: Lấy danh sách Danh mục (Categories)
    activate BE
    BE-->B: 1.2: Hiển thị form với các danh mục
    deactivate BE
    
    A->>B: 2: Nhập Tiêu đề, chọn Danh mục, Upload ảnh bìa
    
    opt Trường hợp: Có sử dụng Template có sẵn
        A->>B: 3.1: Chọn Template mẫu
        B->>BE: 3.1.1: Truy vấn nội dung Template
        activate BE
        BE-->B: 3.1.2: Trả về nội dung mẫu
        deactivate BE
        B-->A: 3.1.3: Hiện thông tin bài viết theo template
        A->>B: 3.1.4: Chỉnh sửa nội dung dựa trên mẫu
    end
    
    opt Trường hợp: Không sử dụng Template (Tùy chọn AI)
        opt Có sử dụng AI tạo nội dung
            A->>B: 3.2.1: Nhập gợi ý nội dung (Prompt) cho AI
            B->>AI: 3.2.2: Gửi yêu cầu sinh nội dung AI
            activate AI
            AI-->B: 3.2.3: Trả kết quả nội dung sinh ra
            deactivate AI
            B-->A: 3.2.4: Hiển thị nội dung sinh ra để xem trước
            A->>B: 3.2.5: Chỉnh sửa nội dung AI cung cấp
        end
        opt Không sử dụng AI
            A->>B: 3.3.1: Nhập thủ công nội dung bài viết
        end
    end
    
    A->>B: 4: Nhấn nút "Lưu bài viết" (Lưu nháp hoặc Đăng)
    B->>BE: 4.1: Gửi toàn bộ dữ liệu bài viết
    activate BE
    BE->>BE: 4.1.1: Kiểm tra quyền (Admin/Author)
    activate BE
    deactivate BE
    BE->>BE: 4.1.2: Khởi tạo & Lưu dữ liệu vào CSDL
    activate BE
    deactivate BE
    BE-->B: 4.1.3: Xác nhận lưu bài viết thành công
    deactivate BE
    
    B-->A: 5: Thông báo bài viết đã được tạo thành công
```

---

### 9. **ĐĂNG NHẬP (CHI TIẾT NGHIỆP VỤ)**

```mermaid
sequenceDiagram
    actor A as "Quản trị viên"
    participant B as Giao diện Đăng nhập
    participant BE as Backend
    
    A->>B: 1: Mở trang đăng nhập
    A->>B: 2: Nhập tài khoản / mật khẩu
    
    B->>B: 3: Kiểm tra dữ liệu trống (Validate)
    activate B
    deactivate B
    
    opt Trường hợp: Dữ liệu thiếu
        B-->A: 3.1: Báo lỗi điền thiếu thông tin
    end
    
    opt Trường hợp: Dữ liệu đủ
        B->>BE: 4: Gửi yêu cầu đăng nhập (username, password)
        activate BE
        BE->>BE: 4.1: Kiểm tra thông tin tài khoản trong CSDL
        activate BE
        deactivate BE
        
        opt Sai Username / Password
            BE-->B: 4.2.1: Trả về lỗi xác thực (401)
            B-->A: 4.2.2: Báo sai username/mật khẩu
        end
        
        opt Tài khoản bị ẩn (is_active = 0)
            BE-->B: 4.3.1: Trả về lỗi tài khoản vô hiệu hoá (403)
            B-->A: 4.3.2: Thông báo tài khoản bị ẩn/khoá
        end
        
        opt Thông tin hợp lệ
            BE->>BE: 4.4.1: Tạo Token (JWT) & Lấy Role người dùng
            activate BE
            deactivate BE
            BE-->B: 4.4.2: Trả kết quả xác thực + Token + Role
            B->>B: 4.4.3: Lưu phiên đăng nhập (LocalStorage/Cookies)
            B->>B: 4.4.4: Điều hướng màn hình theo Role (Admin/Author)
        end
        deactivate BE
    end
```

---

### 10. **TẠO DANH MỤC MỚI**

```mermaid
sequenceDiagram
    actor A as "Quản trị viên"
    participant B as Giao diện Danh mục
    participant BE as Backend
    
    A->>B: 1: Chọn tạo 1 danh mục mới
    A->>B: 2: Nhập thông tin danh mục (Tên, Slug...)
    A->>B: 3: Nhấn "Lưu danh mục"
    
    B->>BE: 4: Gửi yêu cầu lưu danh mục
    activate BE
    BE->>BE: 4.1: Kiểm tra Tên/Slug trùng trong CSDL?
    activate BE
    deactivate BE
    
    opt Trường hợp: Có trùng dữ liệu
        BE-->B: 4.2: Trả về lỗi trùng dữ liệu
        B-->A: 4.3: Thông báo trùng slug/tên danh mục
    end
    
    opt Trường hợp: Không trùng dữ liệu
        BE->>BE: 4.4: Lưu dữ liệu vào CSDL
        activate BE
        deactivate BE
        BE-->B: 4.5: Xác nhận tạo danh mục thành công
        B-->A: 4.6: Thông báo tạo danh mục thành công
    end
    deactivate BE
```

---

### 11. **TẠO CARD SỰ KIỆN HÀNG NĂM TRONG TIMELINE**

```mermaid
sequenceDiagram
    actor A as "Quản trị viên"
    participant B as Giao diện Timeline
    participant BE as Backend
    
    A->>B: 1: Chọn tạo sự kiện timeline mới
    B->>B: 1.1: Hiển thị form nhập liệu
    
    A->>B: 2: Nhập thông tin (Tháng, Năm, Tên sự kiện, Tóm tắt, Thứ tự)
    A->>B: 3: Nhấn nút "Lưu sự kiện"
    
    B->>BE: 4: Gửi yêu cầu lưu sự kiện (month, year, name...)
    activate BE
    
    BE->>BE: 4.1: Kiểm tra tính hợp lệ (Tháng 1-12, Tên sự kiện)
    activate BE
    deactivate BE
    
    opt Nếu dữ liệu sai
        BE-->B: 4.2: Trả về lỗi yêu cầu (Bad Request)
        B-->A: 4.3: Thông báo lỗi nhập liệu cho người dùng
    end
    
    opt Nếu dữ liệu đúng
        BE->>BE: 4.4: Chuẩn hóa Năm timeline (nếu trống)
        activate BE
        deactivate BE
        
        BE->>BE: 4.5: Ghi bản ghi vào CSDL (type='annual')
        activate BE
        deactivate BE
        
        BE-->B: 4.6: Trả về kết quả thành công
        B-->A: 4.7: Thông báo tạo sự kiện thành công
    end
    deactivate BE
```

---

### 12. **DUYỆT 1 BÀI VIẾT**

```mermaid
sequenceDiagram
    actor A as "Quản trị viên toàn quyền"
    participant B as Giao diện Danh sách duyệt bài viết
    participant BE as Backend Hệ thống
    
    A->>B: 1: Chọn bài viết đang chờ duyệt
    activate B
    B->>B: 2: Chuyển trạng thái sang 'Đã xuất bản'
    
    B->>BE: 3: Gửi yêu cầu cập nhật
    activate BE
    
    BE->>BE: 3.1: Kiểm tra & Lưu trạng thái bản ghi vào CSDL
    activate BE
    deactivate BE
    
    BE-->B: 3.2: Xác nhận cập nhật thành công
    deactivate BE
    
    B-->A: 4: Hiển thị thông báo kết quả
    deactivate B
```
