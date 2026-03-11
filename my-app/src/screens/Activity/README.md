# Activity Pages

Các trang hoạt động đã được tạo dựa trên design Figma.

## Cấu trúc

```
src/screens/Activity/
├── Activity.jsx          - Trang danh sách hoạt động
├── Activity.css
├── EventByYear.jsx       - Trang danh sách sự kiện theo năm
├── EventByYear.css
├── EventDetail.jsx       - Trang chi tiết sự kiện
├── EventDetail.css
└── index.js             - Export tất cả components
```

## Tính năng

### 1. Activity.jsx (Trang Hoạt Động)
- Hiển thị danh sách các hoạt động nổi bật
- Thanh tìm kiếm và lọc
- Grid layout 3 cột responsive
- Pagination
- Menu navigation với highlight active

### 2. EventByYear.jsx (Xem danh sách sự kiện theo năm)
- Hiển thị thông tin giới thiệu sự kiện
- Section hoạt động theo năm với navigation arrows
- Grid layout 3 cột cho các sự kiện
- Footer với social links

### 3. EventDetail.jsx (Chi tiết sự kiện theo năm)
- Thông tin chi tiết về sự kiện
- Danh sách hoạt động theo năm
- Danh sách bài đăng của sự kiện với thumbnail
- Thanh tìm kiếm bài đăng
- Pagination
- Footer đầy đủ

## Cách sử dụng

### Import components

```jsx
import { Activity, EventByYear, EventDetail } from './screens/Activity';
```

### Sử dụng trong React Router

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Activity, EventByYear, EventDetail } from './screens/Activity';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/activity" element={<Activity />} />
        <Route path="/events/:eventName" element={<EventByYear />} />
        <Route path="/events/:eventName/:year" element={<EventDetail />} />
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
- http://localhost:5173/events/chao-tan - Danh sách theo năm
- http://localhost:5173/events/chao-tan/2025 - Chi tiết sự kiện
