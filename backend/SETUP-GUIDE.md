# 🚀 HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY BACKEND API

## ✅ BƯỚC 1: Test kết nối SQL Server

```bash
cd backend
npm run test:sql
```

Script này sẽ tự động thử 4 cấu hình khác nhau và cho biết cấu hình nào thành công.

### Nếu tất cả đều thất bại:

1. **Kiểm tra SQL Server đang chạy:**
   - Press `Win+R` → nhập `services.msc`
   - Tìm **SQL Server (MSSQLSERVER)**
   - Đảm bảo Status = "Running"

2. **Enable TCP/IP:**
   - Mở **SQL Server Configuration Manager**
   - **SQL Server Network Configuration** → **Protocols for MSSQLSERVER**
   - Right-click **TCP/IP** → **Enable**
   - **Restart SQL Server service**

3. **Kiểm tra Port:**
   - Right-click **TCP/IP** → **Properties**
   - Tab **IP Addresses** → scroll xuống **IPAll**
   - **TCP Port** = `1433`

---

## ✅ BƯỚC 2: Cập nhật .env với cấu hình đúng

Sau khi chạy `npm run test:sql`, script sẽ hiển thị cấu hình thành công.

Cập nhật file **backend/.env**:

```env
# Ví dụ với localhost:1433
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=MyAppDB
DB_TRUST_CERTIFICATE=true
DB_ENCRYPT=true

# Hoặc với dấu chấm (nếu localhost không work)
DB_SERVER=.
DB_DATABASE=MyAppDB
DB_TRUST_CERTIFICATE=true
DB_ENCRYPT=true
```

---

## ✅ BƯỚC 3: Chạy Backend Server

### Development mode (tự động reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server sẽ chạy tại: **http://localhost:5000**

---

## ✅ BƯỚC 4: Test API

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

**Kết quả mong đợi:**
```json
{
  "status": "OK",
  "database": "Connected",
  "dbname": "MyAppDB",
  "timestamp": "2024-03-11T10:00:00.000Z"
}
```

### Test 2: Lấy danh sách tin tức
```bash
curl http://localhost:5000/api/news
```

### Test 3: Lấy danh sách hoạt động
```bash
curl http://localhost:5000/api/activities
```

### Test 4: Tạo liên hệ mới
```bash
curl -X POST http://localhost:5000/api/contact ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"message\":\"Hello\"}"
```

---

## 📋 Tất cả API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health` | Kiểm tra server |
| GET | `/api/users` | Danh sách users |
| GET | `/api/categories` | Danh sách categories |
| GET | `/api/news` | Danh sách tin tức |
| GET | `/api/news/:id` | Chi tiết tin tức |
| GET | `/api/news/slug/:slug` | Tin tức theo slug |
| GET | `/api/documents` | Danh sách tài liệu |
| GET | `/api/activities` | Danh sách hoạt động |
| GET | `/api/activities/year/:year` | Hoạt động theo năm |
| GET | `/api/organizations` | Danh sách tổ chức |
| GET | `/api/contact` | Danh sách liên hệ |
| GET | `/api/contact/stats` | Thống kê liên hệ |
| POST | `/api/contact` | Tạo liên hệ mới |

**Chi tiết đầy đủ xem:** [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)

---

## 🔧 Troubleshooting

### ❌ Lỗi: "Failed to connect to localhost:1433"

**Giải pháp:**
1. Chạy `npm run test:sql` để tìm cấu hình đúng
2. Cập nhật `.env` với cấu hình thành công
3. Restart server: `npm run dev`

### ❌ Lỗi: "Cannot find module"

**Giải pháp:**
```bash
npm install
```

### ❌ Lỗi: "Port 5000 already in use"

**Giải pháp:**
Đổi port trong `.env`:
```env
PORT=5001
```

### ❌ Lỗi: "Database 'MyAppDB' does not exist"

**Giải pháp:**
1. Mở SSMS
2. Copy toàn bộ SQL từ file tổng hợp (xem tin nhắn trước)
3. Execute trong SSMS

---

## 📂 Cấu trúc code

```
backend/
├── controllers/          # 7 controllers cho 7 bảng
│   ├── usersController.js
│   ├── categoriesController.js
│   ├── newsController.js
│   ├── documentsController.js
│   ├── activitiesController.js
│   ├── organizationsController.js
│   └── contactController.js
├── routes/              # 7 routes tương ứng
│   ├── users.js
│   ├── categories.js
│   ├── news.js
│   ├── documents.js
│   ├── activities.js
│   ├── organizations.js
│   └── contact.js
├── test-sqlserver.js    # Script test 4 cấu hình
├── server.js            # Main server
├── .env                 # Cấu hình
└── package.json
```

---

## 🎯 Các chức năng đã hoàn thành

✅ **Users API** - CRUD users (5 endpoints)
✅ **Categories API** - CRUD categories (5 endpoints)
✅ **News API** - CRUD tin tức + view count (6 endpoints)
✅ **Documents API** - CRUD tài liệu + download count (6 endpoints)
✅ **Activities API** - CRUD hoạt động + filter theo năm (7 endpoints)
✅ **Organizations API** - CRUD tổ chức + nested structure (6 endpoints)
✅ **Contact API** - CRUD liên hệ + stats (7 endpoints)

**Tổng cộng: 42 API endpoints**

---

## 📞 Kết nối với Frontend

Frontend React có thể gọi API như sau:

```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';

export const getNews = async () => {
  const response = await fetch(`${API_BASE_URL}/news`);
  return response.json();
};

export const getActivities = async () => {
  const response = await fetch(`${API_BASE_URL}/activities`);
  return response.json();
};

export const createContact = async (data) => {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

---

## 🎉 DONE!

Backend API đã sẵn sàng với:
- ✅ 7 modules (users, categories, news, documents, activities, organizations, contact)
- ✅ 42 API endpoints
- ✅ SQL Server connection với multi-config support
- ✅ Error handling
- ✅ Logging
- ✅ CORS enabled
- ✅ Documentation đầy đủ

**Bắt đầu code frontend và gọi API!** 🚀
