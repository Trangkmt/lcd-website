# Backend API Server

Backend server cho My App sử dụng Node.js, Express và MySQL.

## 📋 Yêu cầu

- Node.js 14+ 
- MySQL 8+
- npm hoặc yarn

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình MySQL

Đảm bảo MySQL đang chạy:
- Mở **Services** (Win+R → `services.msc`)
- Kiểm tra service **MySQL** đang chạy

### 3. Tạo database MySQL

Tạo database `MyAppDB` và import schema MySQL tương ứng của dự án.

### 4. Cấu hình .env

File `.env` đã có sẵn với cấu hình mặc định:

```env
# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=MyAppDB
DB_USER=root
DB_PASSWORD=your_password

# Backend Server
PORT=5000
NODE_ENV=development
```

**Lưu ý:** Nếu không connect được với `localhost`, thử:
- `DB_HOST=127.0.0.1`
- kiểm tra lại `DB_PORT`, `DB_USER`, `DB_PASSWORD`

### 5. Test kết nối MySQL

```bash
node test-sqlserver.js
```

Script này sẽ thử 4 cấu hình khác nhau và cho biết cấu hình nào thành công.

## 🏃 Chạy server

### Development mode (với nodemon)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```
GET http://localhost:5000/api/health
```

### Danh sách endpoints chính:
- `/api/users` - Quản lý users
- `/api/categories` - Quản lý danh mục
- `/api/news` - Quản lý tin tức
- `/api/documents` - Quản lý tài liệu
- `/api/activities` - Quản lý hoạt động
- `/api/organizations` - Quản lý tổ chức
- `/api/contact` - Quản lý liên hệ

Xem chi tiết trong [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)

## 📁 Cấu trúc thư mục

```
backend/
├── controllers/         # Business logic
│   ├── usersController.js
│   ├── categoriesController.js
│   ├── newsController.js
│   ├── documentsController.js
│   ├── activitiesController.js
│   ├── organizationsController.js
│   └── contactController.js
├── routes/             # API routes
│   ├── users.js
│   ├── categories.js
│   ├── news.js
│   ├── documents.js
│   ├── activities.js
│   ├── organizations.js
│   └── contact.js
├── database/           # Database connection
│   ├── connection-sqlserver.js
│   └── test-connection-sqlserver.js
├── .env               # Environment variables
├── server.js          # Main server file
├── test-sqlserver.js  # Test MySQL connection
├── package.json
└── README.md
```

## 🧪 Testing

### Test kết nối database
```bash
node test-sqlserver.js
```

### Test API với cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Lấy danh sách tin tức
curl http://localhost:5000/api/news

# Lấy danh sách hoạt động
curl http://localhost:5000/api/activities

# Tạo liên hệ mới
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyễn Văn A","email":"test@example.com","message":"Test message"}'
```

## 🔧 Troubleshooting

### Lỗi: "Failed to connect to localhost:1433"

**Giải pháp 1:** Kiểm tra MySQL đang chạy
```bash
# Mở Services (Win+R → services.msc)
# Tìm service "MySQL"
# Đảm bảo Status = "Running"
```

**Giải pháp 2:** Thử cấu hình khác trong .env
```env
# Hoặc IP
DB_HOST=127.0.0.1

# Kiểm tra port mặc định
DB_PORT=3306
```

**Giải pháp 3:** Kiểm tra user/password MySQL
```env
DB_USER=root
DB_PASSWORD=your_password
```

**Giải pháp 4:** Chạy test script
```bash
node test-sqlserver.js
```

### Lỗi: "Cannot find module"

```bash
# Cài đặt lại dependencies
npm install
```

### Lỗi: "Port 5000 already in use"

Thay đổi port trong `.env`:
```env
PORT=5001
```

## 📚 Technologies

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **mysql2** - MySQL driver
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **nodemon** - Development auto-reload

## 🔐 Security Notes

- Password trong user table nên được hash với bcrypt trước khi lưu
- Thêm authentication middleware cho các endpoint admin
- Validate input data
- Thêm rate limiting
- Enable HTTPS trong production

## 📄 License

MIT
