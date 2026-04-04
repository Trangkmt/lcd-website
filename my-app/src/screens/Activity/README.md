# Activity Pages

Các trang hoạt động đã được tạo dựa trên design Figma.

## Cấu trúc

```
src/screens/Activity/
├── Activity.jsx          - Trang danh sách hoạt động
├── Activity.css
├── AnnualActivityDetail.jsx - Trang chi tiết hoạt động thường niên
├── AnnualActivityDetail.css
└── index.js             - Export tất cả components
```

## Tính năng

### 1. Activity.jsx (Trang Hoạt Động)
- Hiển thị danh sách các hoạt động nổi bật
- Thanh tìm kiếm và lọc
- Grid layout 3 cột responsive
- Pagination
- Menu navigation với highlight active

### 2. AnnualActivityDetail.jsx (Chi tiết hoạt động thường niên)
- Hiển thị thông tin giới thiệu sự kiện thường niên
- Hiển thị toàn bộ bài đăng của sự kiện (không lọc theo năm)
- Thanh tìm kiếm bài đăng
- Điều hướng vào trang chi tiết bài đăng

## Cách sử dụng

### Import components

```jsx
import { Activity, AnnualActivity, AnnualActivityDetail, PostDetail } from './screens/Activity';
```

### Sử dụng trong React Router

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Activity, AnnualActivity, AnnualActivityDetail, PostDetail } from './screens/Activity';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/activity" element={<Activity />} />
        <Route path="/activity/annual" element={<AnnualActivity />} />
        <Route path="/activity/:eventName" element={<AnnualActivityDetail />} />
        <Route path="/activity/:eventName/post/:postId" element={<PostDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Sử dụng standalone

```jsx
import React from 'react';
import { Activity } from './screens/Activity';

function App() {
  return <Activity />;
}
```

## Tùy chỉnh

### Colors
Các màu chính được sử dụng:
- Primary Blue: `#2C6BCC`
- Dark Blue: `#183563`
- Yellow: `#FFD600` / `#FFE03F`
- Background: `#EEEEEE`
- Text: `#183563`, `black`

### Fonts
- Primary: `'Work Sans'`
- Secondary: `'Roboto'`, `'Open Sans'`, `'Inter'`

## Responsive

Tất cả các trang đều responsive với breakpoints:
- Desktop: > 1200px
- Tablet: 768px - 1200px
- Mobile: < 768px

## Cần cài đặt

Đảm bảo bạn có logo trong `src/images/Logo.png`

Nếu muốn sử dụng React Router:
```bash
npm install react-router-dom
```

## Demo

Để xem demo, chạy:
```bash
npm run dev
```

Sau đó truy cập:
- http://localhost:5173/activity - Trang hoạt động
- http://localhost:5173/activity/annual - Danh sách hoạt động thường niên
- http://localhost:5173/activity/chao-tan - Chi tiết hoạt động thường niên
- http://localhost:5173/activity/chao-tan/post/1 - Chi tiết bài đăng
