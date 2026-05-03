# CÁC BIỂU ĐỒ TRÌNH TỰ (SEQUENCE DIAGRAMS) - CHI TIẾT NGHIỆP VỤ

Tài liệu này mô tả chi tiết các luồng tương tác giữa **Người dùng**, **Các màn hình giao diện**, **Bộ điều khiển (Controller)** và **Cơ sở dữ liệu** dựa trên kiến trúc thực tế của hệ thống.

---

## I. PHÂN HỆ QUẢN TRỊ (WEB ADMIN)

### 1. Đăng nhập hệ thống (Chi tiết nghiệp vụ)
```mermaid
sequenceDiagram
    actor A as Quản trị viên
    participant G as Màn hình Đăng nhập
    participant C as Controller Xác thực
    participant D as Cơ sở dữ liệu
    
    A->>G: 1: Mở trang đăng nhập
    A->>G: 2: Nhập tài khoản / mật khẩu
    
    G->>G: 3: Kiểm tra dữ liệu trống (Validate)
    
    alt Dữ liệu thiếu
        G-->>A: 3.1: Báo lỗi điền thiếu thông tin
    else Dữ liệu đủ
        G->>C: 4: Gửi yêu cầu đăng nhập
        activate C
        C->>D: 4.1: Truy vấn thông tin tài khoản
        activate D
        D-->>C: 4.2: Trả về kết quả truy vấn
        deactivate D
        
        alt Sai Username / Password
            C-->>G: 4.3: Trả về lỗi không hợp lệ
            G-->>A: 4.4: Báo sai username/mật khẩu
        else Tài khoản bị ẩn (is_active = 0)
            C-->>G: 4.5: Trả về lỗi tài khoản vô hiệu hoá
            G-->>A: 4.6: Thông báo tài khoản bị ẩn
        else Thông tin hợp lệ
            C-->>G: 4.7: Trả kết quả xác thực + Role
            G->>G: 4.8: Lưu phiên đăng nhập
            G->>G: 4.9: Điều hướng màn hình theo Role
            G-->>A: 4.10: Hiển thị trang Dashboard quản trị
        end
        deactivate C
    end
```

### 2. Tạo bài viết mới (Hỗ trợ AI & Template)
```mermaid
sequenceDiagram
    actor A as Quản trị viên
    participant G as Giao diện Tạo bài viết
    participant C as Controller Bài viết
    participant AI as Dịch vụ AI (Gemini)
    participant D as Cơ sở dữ liệu
    
    A->>G: 1: Chọn nút "Tạo bài viết"
    G->>C: 1.1: Lấy danh sách Danh mục (Categories)
    activate C
    C->>D: 1.2: Truy vấn bảng categories
    activate D
    D-->>C: 1.3: Trả về danh sách danh mục
    deactivate D
    C-->>G: 1.4: Hiển thị form với các danh mục
    deactivate C
    
    A->>G: 2: Nhập Tiêu đề, chọn Danh mục, Upload ảnh bìa
    
    opt Có sử dụng Template mẫu
        A->>G: 3.1: Chọn Template mẫu
        G->>C: 3.2: Truy vấn nội dung Template
        activate C
        C->>D: 3.3: Lấy dữ liệu từ bảng post_templates
        D-->>C: 3.4: Trả về nội dung mẫu
        C-->>G: 3.5: Trả về nội dung mẫu cho giao diện
        deactivate C
        G-->>A: 3.6: Hiển thị thông tin theo template
        A->>G: 3.7: Chỉnh sửa nội dung dựa trên mẫu
    end
    
    opt Có sử dụng AI tạo nội dung
        A->>G: 4.1: Nhập gợi ý nội dung (Prompt) cho AI
        G->>C: 4.2: Gửi yêu cầu sinh nội dung AI
        activate C
        C->>AI: 4.3: Gửi yêu cầu sinh nội dung
        AI-->>C: 4.4: Trả kết quả nội dung sinh ra
        C-->>G: 4.5: Trả kết quả nội dung cho giao diện
        deactivate C
        G-->>A: 4.6: Hiển thị nội dung AI để xem trước
        A->>G: 4.7: Chỉnh sửa nội dung AI cung cấp
    end
    
    A->>G: 5: Nhấn nút "Lưu bài viết" (Lưu nháp hoặc Đăng)
    G->>C: 5.1: Gửi toàn bộ dữ liệu bài viết
    activate C
    C->>C: 5.2: Kiểm tra quyền (Admin/Author)
    C->>D: 5.3: Khởi tạo & Lưu dữ liệu vào CSDL
    activate D
    D-->>C: 5.4: Xác nhận lưu bài viết thành công
    deactivate D
    C-->>G: 5.5: Thông báo lưu thành công
    deactivate C
    G-->>A: 5.6: Hiển thị kết quả thành công cho quản trị viên
```

### 3. Cập nhật bài viết
```mermaid
sequenceDiagram
    actor A as Quản trị viên
    participant G as Giao diện Chỉnh sửa bài viết
    participant C as Controller Bài viết
    participant D as Cơ sở dữ liệu
    
    A->>G: 1: Chọn bài viết cần sửa
    G->>C: 1.1: Lấy dữ liệu chi tiết bài viết (ID)
    activate C
    C->>D: 1.2: SELECT * FROM posts WHERE id = ID
    activate D
    D-->>C: 1.3: Trả về dữ liệu bài viết hiện tại
    deactivate D
    C-->>G: 1.4: Hiển thị dữ liệu lên form
    deactivate C
    
    A->>G: 2: Chỉnh sửa thông tin bài viết
    A->>G: 3: Nhấn "Lưu cập nhật"
    
    G->>C: 4: Gửi thông tin cập nhật (ID, data)
    activate C
    C->>C: 4.1: Kiểm tra quyền chỉnh sửa
    
    alt Có quyền (Admin hoặc Chính tác giả)
        C->>D: 4.2: Cập nhật thông tin vào CSDL
        activate D
        D-->>C: 4.3: Xác nhận cập nhật thành công
        deactivate D
        C-->>G: 4.4: Trả về kết quả thành công
    else Không có quyền hoặc Lỗi
        C-->>G: 4.5: Trả về thông báo lỗi
    end
    deactivate C
    
    G-->>A: 5: Thông báo kết quả cập nhật cho quản trị viên
```

### 4. Xoá bài viết
```mermaid
sequenceDiagram
    actor A as Quản trị viên
    participant G as Giao diện Quản lý bài viết
    participant C as Controller Bài viết
    participant D as Cơ sở dữ liệu
    
    A->>G: 1: Chọn bài viết cần xoá
    A->>G: 2: Xác nhận xoá (Confirm dialog)
    
    G->>C: 3: Gửi yêu cầu xoá (ID)
    activate C
    C->>C: 3.1: Kiểm tra quyền xoá
    
    alt Hợp lệ
        C->>D: 3.2: Xoá bài viết khỏi hệ thống
        activate D
        D-->>C: 3.3: Xác nhận xoá thành công
        deactivate D
        C-->>G: 3.4: Thông báo xoá thành công
    else Thất bại
        C-->>G: 3.5: Báo lỗi không tìm thấy hoặc không có quyền
    end
    deactivate C
    
    G-->>A: 4: Hiển thị thông báo kết quả cho quản trị viên
```

### 5. Duyệt và xuất bản bài viết
```mermaid
sequenceDiagram
    actor A as Quản trị viên toàn quyền
    participant G as Giao diện Danh sách duyệt
    participant C as Controller Quản trị
    participant D as Cơ sở dữ liệu
    
    A->>G: 1: Chọn bài viết đang chờ duyệt
    G->>G: 2: Chuyển trạng thái sang 'Đã xuất bản'
    
    G->>C: 3: Gửi yêu cầu cập nhật trạng thái
    activate C
    C->>C: 3.1: Kiểm tra quyền Admin
    C->>D: 3.2: Lưu trạng thái mới vào CSDL
    activate D
    D-->>C: 3.3: Xác nhận cập nhật thành công
    deactivate D
    C-->>G: 3.4: Trả về kết quả phê duyệt
    deactivate C
    
    G-->>A: 4: Hiển thị bài viết đã xuất bản công khai
```

### 6. Tạo danh mục mới
```mermaid
sequenceDiagram
    actor A as Quản trị viên
    participant G as Giao diện Danh mục
    participant C as Controller Danh mục
    participant D as Cơ sở dữ liệu
    
    A->>G: 1: Chọn tạo danh mục mới & Nhập thông tin
    A->>G: 2: Nhấn "Lưu danh mục"
    
    G->>C: 3: Gửi yêu cầu lưu danh mục
    activate C
    C->>D: 3.1: Kiểm tra Tên/Slug có trùng hay không
    activate D
    D-->>C: 3.2: Kết quả kiểm tra
    deactivate D
    
    alt Có trùng dữ liệu
        C-->>G: 3.3: Trả về lỗi trùng dữ liệu
        G-->>A: 3.4: Thông báo trùng tên/slug danh mục
    else Không trùng dữ liệu
        C->>D: 3.5: Lưu danh mục mới vào CSDL
        activate D
        D-->>C: 3.6: Xác nhận tạo thành công
        deactivate D
        C-->>G: 3.7: Trả về thông tin danh mục vừa tạo
        G-->>A: 3.8: Thông báo tạo danh mục thành công
    end
    deactivate C
```

### 7. Tạo thành viên mới
```mermaid
sequenceDiagram
    actor A as Quản trị viên
    participant G as Giao diện Thành viên
    participant C as Controller Thành viên
    participant D as Cơ sở dữ liệu
    
    A->>G: 1: Mở form tạo & Nhập thông tin thành viên
    G->>C: 1.1: Lấy danh sách Vai trò & Ban chuyên môn
    activate C
    C->>D: 1.2: Truy vấn bảng roles & teams
    activate D
    D-->>C: 1.3: Trả về danh sách dữ liệu
    deactivate D
    C-->>G: 1.4: Hiển thị lên form nhập liệu
    deactivate C
    
    A->>G: 2: Nhấn "Lưu thành viên"
    G->>G: 3: Kiểm tra tính hợp lệ (Validate)
    
    opt Dữ liệu đủ & Hợp lệ
        G->>C: 4: Gửi yêu cầu tạo tài khoản mới
        activate C
        C->>D: 4.1: Kiểm tra Username/Email đã tồn tại chưa
        activate D
        D-->>C: 4.2: Kết quả kiểm tra
        deactivate D
        
        alt Chưa tồn tại
            C->>D: 4.3: Lưu thông tin User & Vai trò & Đơn vị
            activate D
            D-->>C: 4.4: Xác nhận tạo thành công
            deactivate D
            C-->>G: 4.5: Thông báo tạo thành công
        else Đã tồn tại
            C-->>G: 4.6: Trả về lỗi trùng lặp dữ liệu
        end
        deactivate C
    end
    
    G-->>A: 5: Hiển thị kết quả tương ứng cho người quản trị
```

### 8. Xuất Giấy mời/Chứng chỉ hàng loạt
```mermaid
sequenceDiagram
    actor A as Quản trị viên
    participant G as Giao diện Xuất file
    participant C as Controller Tiện ích
    participant D as Cơ sở dữ liệu
    
    A->>G: 1: Chọn danh sách thành viên & Loại mẫu giấy
    A->>G: 2: Nhấn nút "Xuất giấy"
    
    G->>C: 3: Gửi yêu cầu tạo file hàng loạt
    activate C
    C->>D: 3.1: Truy vấn thông tin chi tiết các thành viên
    activate D
    D-->>C: 3.2: Trả về dữ liệu (Họ tên, Lớp, Chức vụ...)
    deactivate D
    
    C->>C: 3.3: Ghép dữ liệu vào Template & Render file
    C->>C: 3.4: Đóng gói các file vào tệp nén ZIP
    
    C-->>G: 3.5: Trả về link tải file kết quả
    deactivate C
    
    G-->>A: 4: Hiển thị thông báo hoàn thành & nút Tải về
    A->>G: 5: Click tải tệp tin về máy tính
```

### 9. Upload file lên thư mục chung
```mermaid
sequenceDiagram
    actor A as Quản trị viên
    participant G as Giao diện Tài liệu
    participant C as Controller Tài liệu
    participant S as Dịch vụ Lưu trữ Cloudinary
    participant D as Cơ sở dữ liệu
    
    A->>G: 1: Chọn file từ máy tính & Chọn thư mục đích
    A->>G: 2: Nhấn nút "Upload"
    
    G->>C: 3: Gửi file yêu cầu tải lên
    activate C
    C->>C: 3.1: Kiểm tra định dạng & dung lượng file
    
    alt Hợp lệ
        C->>S: 3.2: Lưu file vật lý lên hệ thống lưu trữ
        activate S
        S-->>C: 3.3: Trả về đường dẫn truy cập (URL)
        deactivate S
        C->>D: 3.4: Lưu bản ghi Metadata vào bảng documents
        activate D
        D-->>C: 3.5: Xác nhận lưu CSDL thành công
        deactivate D
        C-->>G: 3.6: Thông báo tải lên thành công
    else Không hợp lệ
        C-->>G: 3.7: Trả về lỗi (File quá lớn/Sai định dạng)
    end
    deactivate C
    
    G-->>A: 4: Thông báo kết quả upload cho người dùng
```

### 10. Tạo sự kiện mới cho Timeline
```mermaid
sequenceDiagram
    actor A as Quản trị viên
    participant G as Giao diện Timeline
    participant C as Controller Timeline
    participant D as Cơ sở dữ liệu
    
    A->>G: 1: Chọn tạo sự kiện timeline mới
    G-->>A: 1.1: Hiển thị biểu mẫu nhập liệu
    
    A->>G: 2: Nhập thông tin (Tháng, Năm, Tên sự kiện...)
    A->>G: 3: Nhấn nút "Lưu sự kiện"
    
    G->>C: 4: Gửi yêu cầu lưu sự kiện
    activate C
    C->>C: 4.1: Kiểm tra tính hợp lệ dữ liệu
    
    alt Dữ liệu sai
        C-->>G: 4.2: Trả về lỗi yêu cầu (Bad Request)
        G-->>A: 4.3: Thông báo lỗi nhập liệu cho người dùng
    else Dữ liệu đúng
        C->>C: 4.4: Chuẩn hóa Năm timeline (nếu trống)
        C->>D: 4.5: Ghi bản ghi vào bảng timeline_events
        activate D
        D-->>C: 4.6: Xác nhận lưu trữ thành công
        deactivate D
        C-->>G: 4.7: Trả về kết quả thành công
        G-->>A: 4.8: Thông báo tạo sự kiện thành công trên UI
    end
    deactivate C
```

## II. PHÂN HỆ NGƯỜI DÙNG (CLIENT)

### 11. Xem chi tiết bài viết (Người dùng)
```mermaid
sequenceDiagram
    actor U as Người dùng
    participant G as Giao diện Chi tiết bài viết
    participant C as Controller Bài viết
    participant D as Cơ sở dữ liệu
    
    U->>G: 1: Click chọn bài viết từ danh sách
    G->>C: 2: Gọi API lấy chi tiết bài viết (Slug)
    activate C
    C->>D: 2.1: Truy vấn nội dung & kiểm tra trạng thái đăng
    activate D
    D-->>C: 2.2: Trả về dữ liệu bài viết
    deactivate D
    
    alt Bài viết tồn tại & Đã đăng
        C->>D: 2.3: Cập nhật lượt xem (view_count + 1)
        C-->>G: 2.4: Trả về đầy đủ nội dung bài viết
        G-->>U: 2.5: Hiển thị Tiêu đề, Nội dung, Hình ảnh...
    else Không tìm thấy
        C-->>G: 2.6: Trả về thông báo lỗi 404
        G-->>U: 2.7: Hiển thị màn hình báo lỗi
    end
    deactivate C
```

### 12. Tìm kiếm bài viết (Người dùng)
```mermaid
sequenceDiagram
    actor U as Người dùng
    participant G as Giao diện Tìm kiếm
    participant C as Controller Trang chủ
    participant D as Cơ sở dữ liệu
    
    U->>G: 1: Nhập từ khóa tìm kiếm & nhấn Tìm
    G->>C: 2: Gửi yêu cầu tìm kiếm (Keyword)
    activate C
    C->>D: 2.1: Truy vấn bài viết theo Tiêu đề/Tóm tắt
    activate D
    D-->>C: 2.2: Trả về danh sách bài viết phù hợp
    deactivate D
    C-->>G: 2.3: Gửi danh sách kết quả cho giao diện
    deactivate C
    G-->>U: 3: Hiển thị kết quả tìm kiếm cho người dùng
```
