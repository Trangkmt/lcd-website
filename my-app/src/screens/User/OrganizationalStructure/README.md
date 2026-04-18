# Trang Cơ Cấu Tổ Chức

## 📋 Mô tả

Trang hiển thị cơ cấu tổ chức của Liên Chi Đoàn Khoa Công Nghệ Thông Tin với thiết kế hình tháp (pyramid) độc đáo và hiện đại.

## 🏗️ Cấu trúc

### Ban Chủ Nhiệm
- **Bí thư**
- **Phó Bí thư**

### 5 Ban Chức Năng

#### 1. 🏃 Ban Văn Thể
- **Chức năng**: Tổ chức các hoạt động văn hóa, văn nghệ, thể dục thể thao
- **Vị trí**: Cấp 1 (đỉnh tháp)

#### 2. 📱 Ban Truyền Thông Kỹ Thuật
- **Chức năng**: Quản lý fanpage, website, thiết kế poster, quay dựng video
- **Vị trí**: Cấp 2 (trái)

#### 3. 🎯 Ban Tổ Chức Sự Kiện
- **Chức năng**: Lên kế hoạch và tổ chức các sự kiện của Liên Chi Đoàn
- **Vị trí**: Cấp 2 (phải)

#### 4. 🤝 Ban Đối Ngoại
- **Chức năng**: Kết nối với các tổ chức bên ngoài, tìm kiếm tài trợ
- **Vị trí**: Cấp 3 (trái)

#### 5. ⭐ Ban Công Tác Đoàn và Phát Triển Đảng
- **Chức năng**: Quản lý đoàn viên, phát triển đảng viên, công tác đoàn
- **Vị trí**: Cấp 3 (phải)

## 🎨 Thiết kế

### Layout Pyramid
```
                    [Ban Chủ Nhiệm]
                           |
                    [Ban Văn Thể]
                     /          \
        [Ban Truyền Thông]  [Ban Tổ Chức]
              /                      \
        [Ban Đối Ngoại]    [Ban Công Tác Đoàn]
```

### Đặc điểm thiết kế:
- **Background**: Gradient tím (#667eea → #764ba2)
- **Cards**: Trắng với border-radius 16px, shadow nổi bật
- **Ban Chủ Nhiệm**: Card đặc biệt với viền vàng (#ffd700)
- **Hover Effects**: Scale up + shadow tăng
- **Connecting Lines**: Đường nét đứt màu tím kết nối các cấp
- **Icons**: Emoji lớn đại diện cho từng ban
- **Animation**: Fade in từng cấp với độ trễ tăng dần

### Thống kê (Statistics)
- **5** Ban Chức Năng
- **50+** Thành Viên
- **100+** Hoạt Động/Năm

## 🔗 Route

**URL**: `/organization`

**Có Header/Footer**: ✅ Yes (sử dụng Layout component)

## 📱 Responsive

### Desktop (> 1024px)
- Pyramid layout đầy đủ với các cards ngang
- Width: 280px mỗi card
- Gap: 32px

### Tablet (768px - 1024px)
- Cards thu nhỏ: 240px
- Gap giảm: 24px
- Giữ nguyên pyramid layout

### Mobile (< 768px)
- Stack vertical: tất cả cards xếp dọc
- Width: 100% (max 320px)
- Ẩn connecting lines
- Stats cards stack 1 cột

## 🎯 Features

1. **Visual Hierarchy**: Rõ ràng từ Ban Chủ Nhiệm → các cấp ban
2. **Interactive Cards**: Hover effect với transform & shadow
3. **SVG Lines**: Đường kết nối thể hiện mối quan hệ
4. **Statistics**: Số liệu tổng quan về tổ chức
5. **Smooth Animations**: Fade in từng phần tử theo thứ tự
6. **Mobile Friendly**: Responsive hoàn toàn cho mọi thiết bị

## 🚀 Cách sử dụng

### Truy cập trang:
```
http://localhost:5173/organization
```

### Thêm link trong Header:
```jsx
<Link to="/organization">Cơ Cấu Tổ Chức</Link>
```

## 🎨 Customization

### Thay đổi màu sắc:
```css
/* Trong OrganizationalStructure.css */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* Đổi sang màu khác */
```

### Thay đổi số lượng ban:
```jsx
/* Trong OrganizationalStructure.jsx */
const departments = [
  // Thêm hoặc bớt object để thay đổi số ban
  { id: 6, name: 'Ban mới', ... }
];
```

### Điều chỉnh layout pyramid:
```jsx
/* Thay đổi level của mỗi ban */
level: 'top' | 'second-left' | 'second-right' | 'third-left' | 'third-right'
```

## 📂 Files

```
src/screens/OrganizationalStructure/
├── OrganizationalStructure.jsx  # Component chính
├── OrganizationalStructure.css  # Styling
├── index.js                     # Export
└── README.md                    # Documentation
```

## ✨ Highlights

- ✅ Design hiện đại với gradient background
- ✅ Pyramid structure trực quan
- ✅ Animation mượt mà
- ✅ Responsive hoàn toàn
- ✅ SVG connecting lines
- ✅ Statistics section
- ✅ Consistent với design system (Inter/Roboto fonts)
- ✅ Không có lỗi compilation

---

**Created**: March 11, 2026  
**Version**: 1.0.0
