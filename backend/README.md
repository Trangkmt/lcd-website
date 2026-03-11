# Backend API Server

Backend server cho My App sử dụng Node.js, Express và SQL Server.

## 📋 Yêu cầu

- Node.js 14+ 
- SQL Server (MSSQLSERVER hoặc SQL Server Express)
- npm hoặc yarn

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình SQL Server

Đảm bảo SQL Server đang chạy:
- Mở **Services** (Win+R → `services.msc`)
- Kiểm tra **SQL Server (MSSQLSERVER)** đang chạy

Enable TCP/IP:
1. Mở **SQL Server Configuration Manager**
2. **SQL Server Network Configuration** → **Protocols for MSSQLSERVER**
3. Enable **TCP/IP**
4. Restart SQL Server service

### 3. Tạo database

Mở **SQL Server Management Studio (SSMS)** và chạy script trong file:
```
../database/schema-sqlserver.sql
```

Hoặc xem file tổng hợp đầy đủ để copy vào SSMS.

### 4. Cấu hình .env

File `.env` đã có sẵn với cấu hình mặc định:

```env
# SQL Server Configuration
DB_SERVER=localhost
DB_DATABASE=MyAppDB
DB_TRUST_CERTIFICATE=true
DB_ENCRYPT=true
DB_PORT=1433

# Backend Server
PORT=5000
NODE_ENV=development
```

**Lưu ý:** Nếu SQL Server không connect được với `localhost`, thử:
- `DB_SERVER=.` (dấu chấm)
- `DB_SERVER=127.0.0.1`
- `DB_SERVER=localhost\\MSSQLSERVER` (nếu dùng named instance)

### 5. Test kết nối SQL Server

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
├── test-sqlserver.js  # Test SQL connection
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

**Giải pháp 1:** Kiểm tra SQL Server đang chạy
```bash
# Mở Services (Win+R → services.msc)
# Tìm "SQL Server (MSSQLSERVER)"
# Đảm bảo Status = "Running"
```

**Giải pháp 2:** Thử cấu hình khác trong .env
```env
# Thử dấu chấm
DB_SERVER=.

# Hoặc IP
DB_SERVER=127.0.0.1

# Hoặc named instance
DB_SERVER=localhost\\MSSQLSERVER
```

**Giải pháp 3:** Enable TCP/IP
1. SQL Server Configuration Manager
2. Protocols for MSSQLSERVER → TCP/IP → Enable
3. Restart SQL Server service

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
- **mssql** - SQL Server driver
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
