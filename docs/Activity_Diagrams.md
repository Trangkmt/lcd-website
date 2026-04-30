# CÁC BIỂU ĐỒ HOẠT ĐỘNG (ACTIVITY DIAGRAMS)

Tài liệu này mô tả các luồng quy trình nghiệp vụ chi tiết của hệ thống dưới dạng phân làn (swimlane).

---

### 1. **TẠO CARD SỰ KIỆN HÀNG NĂM TRONG TIMELINE**

```mermaid
flowchart TD
    subgraph Quản_trị_viên
        A1[Mở trang Quản lý Timeline]
        A2[Nhấn nút 'Thêm sự kiện mới']
        A3[Nhập: Tên sự kiện, Tháng, Năm, Tóm tắt...]
        A4[Nhấn nút 'Lưu sự kiện']
    end

    subgraph Giao_diện
        B1[Hiển thị form nhập liệu]
        B2[Kiểm tra các trường bắt buộc]
        B3[Thông báo lỗi nếu thiếu dữ liệu]
        B4[Hiển thị thông báo thành công]
    end

    subgraph Backend_Hệ_thống
        C1[Xác thực quyền quản trị]
        C2[Kiểm tra tính hợp lệ của Tháng 1-12]
        C3[Chuẩn hóa Năm nếu để trống]
        C4[Tạo bản ghi sự kiện mới type='annual']
    end

    subgraph CSDL
        D1[Lưu dữ liệu vào bảng timeline_events]
    end

    A1 --> A2
    A2 --> B1
    B1 --> A3
    A3 --> A4
    A4 --> B2
    
    B2 -- Thiếu Tên/Tháng --> B3
    B3 -- Nhập lại --> A3
    
    B2 -- Dữ liệu hợp lệ --> C1
    C1 --> C2
    C2 -- Tháng sai --> B3
    
    C2 -- Tháng đúng --> C3
    C3 --> C4
    C4 --> D1
    D1 --> B4
```
