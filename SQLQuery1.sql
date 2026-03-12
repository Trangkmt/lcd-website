-- ==================================================
-- SCRIPT TẠO DATABASE CHO SQL SERVER
-- Dành cho: SQL Server Management Studio (SSMS)
-- ==================================================

-- 1. TẠO DATABASE
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'MyAppDB')
BEGIN
    CREATE DATABASE MyAppDB;
END
GO

USE MyAppDB;
GO

-- ==================================================
-- 2. XÓA CÁC BẢNG CŨ (NẾU CÓ)
-- ==================================================
DROP TABLE IF EXISTS contact_info;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
GO

-- ==================================================
-- 3. TẠO CÁC BẢNG
-- ==================================================

-- Bảng users
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    full_name NVARCHAR(100),
    role NVARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- Bảng categories
CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    slug NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    parent_id INT,
    page_type NVARCHAR(50) DEFAULT 'news',
    display_order INT DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);
GO

-- Bảng news
CREATE TABLE news (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    summary NVARCHAR(MAX),
    content NVARCHAR(MAX),
    thumbnail NVARCHAR(255),
    category_id INT,
    author_id INT,
    view_count INT DEFAULT 0,
    is_featured BIT DEFAULT 0,
    is_published BIT DEFAULT 0,
    published_at DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);
GO

-- Bảng documents
CREATE TABLE documents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    file_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type NVARCHAR(50),
    category_id INT,
    uploaded_by INT,
    download_count INT DEFAULT 0,
    is_public BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
GO

-- Bảng activities
CREATE TABLE activities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    content NVARCHAR(MAX),
    location NVARCHAR(255),
    start_date DATETIME,
    end_date DATETIME,
    thumbnail NVARCHAR(255),
    images NVARCHAR(MAX),
    organizer NVARCHAR(255),
    category_id INT,
    created_by INT,
    view_count INT DEFAULT 0,
    is_featured BIT DEFAULT 0,
    is_published BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
GO

-- Bảng organizations
CREATE TABLE organizations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    name_abbr NVARCHAR(50),
    description NVARCHAR(MAX),
    logo NVARCHAR(255),
    website NVARCHAR(255),
    email NVARCHAR(100),
    phone NVARCHAR(20),
    address NVARCHAR(MAX),
    parent_id INT,
    display_order INT DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (parent_id) REFERENCES organizations(id)
);
GO

-- Bảng contact_info
CREATE TABLE contact_info (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20),
    subject NVARCHAR(255),
    message NVARCHAR(MAX),
    is_read BIT DEFAULT 0,
    is_replied BIT DEFAULT 0,
    replied_at DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- ==================================================
-- 4. THÊM DỮ LIỆU MẪU
-- ==================================================

-- Users
SET IDENTITY_INSERT users ON;
INSERT INTO users (id, username, password, email, full_name, role, is_active) VALUES
(1, N'admin', N'$2a$10$rGEZXzLz5e5Z5sZ5Z5Z5ZOQ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', N'admin@example.com', N'Quản trị viên', N'admin', 1),
(2, N'editor', N'$2a$10$rGEZXzLz5e5Z5sZ5Z5Z5ZOQ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', N'editor@example.com', N'Biên tập viên', N'user', 1);
SET IDENTITY_INSERT users OFF;
GO

-- Categories
SET IDENTITY_INSERT categories ON;
INSERT INTO categories (id, name, slug, description, page_type, display_order, is_active) VALUES
(1, N'Tin tức chung', N'tin-tuc-chung', N'Các tin tức chung về hoạt động', N'news', 1, 1),
(2, N'Thông báo', N'thong-bao', N'Các thông báo quan trọng', N'news', 2, 1),
(3, N'Giải thưởng', N'giai-thuong', N'Các giải thưởng của đoàn viên', N'achievement', 1, 1),
(4, N'Chào tân', N'chao-tan', N'Hoạt động chào tân sinh viên', N'activity_annual', 1, 1),
(5, N'Quân sự', N'quan-su', N'Hoạt động quân sự định kỳ', N'activity_annual', 2, 1),
(6, N'Prom cuối khoá', N'prom-cuoi-khoa', N'Dạ hội prom cuối khoá', N'activity_annual', 3, 1),
(7, N'Talkshow', N'talkshow', N'Các buổi talkshow định kỳ', N'activity_annual', 4, 1),
(8, N'Cuộc thi', N'cuoc-thi', N'Các cuộc thi thường niên', N'activity_annual', 5, 1),
(9, N'Hoạt động cộng đồng', N'hoat-dong-cong-dong', N'Hoạt động phục vụ cộng đồng', N'activity_non_annual', 1, 1);
SET IDENTITY_INSERT categories OFF;
GO

-- News
SET IDENTITY_INSERT news ON;
INSERT INTO news (id, title, slug, summary, content, category_id, author_id, view_count, is_featured, is_published, published_at) VALUES
(1, N'Khai mạc hội nghị đại biểu toàn quốc 2024', N'khai-mac-hoi-nghi-dai-bieu-toan-quoc-2024', 
 N'Hội nghị đại biểu toàn quốc năm 2024 đã chính thức khai mạc với sự tham gia của hơn 500 đại biểu.', 
 N'<p>Sáng ngày hôm nay, Hội nghị đại biểu toàn quốc năm 2024 đã chính thức khai mạc tại Hà Nội với sự tham gia của hơn 500 đại biểu đến từ các tỉnh thành trên cả nước.</p>', 
 1, 1, 150, 1, 1, GETDATE()),
(2, N'Tổng kết hoạt động năm 2023', N'tong-ket-hoat-dong-nam-2023', 
 N'Buổi lễ tổng kết các hoạt động nổi bật trong năm 2023.', 
 N'<p>Năm 2023 đã đạt được nhiều thành tựu đáng kể trong các lĩnh vực hoạt động.</p>', 
 1, 1, 89, 1, 1, GETDATE()),
(3, N'Kế hoạch phát triển năm 2024', N'ke-hoach-phat-trien-nam-2024', 
 N'Giới thiệu kế hoạch và định hướng phát triển cho năm 2024.', 
 N'<p>Năm 2024, chúng ta sẽ tập trung vào các mục tiêu chiến lược quan trọng.</p>', 
 3, 2, 67, 0, 1, GETDATE());
SET IDENTITY_INSERT news OFF;
GO

-- Documents
SET IDENTITY_INSERT documents ON;
INSERT INTO documents (id, title, description, file_name, file_path, file_size, file_type, category_id, uploaded_by, download_count, is_public) VALUES
(1, N'Quy chế hoạt động 2024', N'Quy chế hoạt động chính thức năm 2024', N'quy-che-2024.pdf', N'/uploads/documents/quy-che-2024.pdf', 1048576, N'application/pdf', 4, 1, 45, 1),
(2, N'Báo cáo tài chính Q1/2024', N'Báo cáo tài chính quý 1 năm 2024', N'bao-cao-tai-chinh-q1-2024.pdf', N'/uploads/documents/bao-cao-tai-chinh-q1-2024.pdf', 2097152, N'application/pdf', 4, 1, 23, 1),
(3, N'Hướng dẫn sử dụng hệ thống', N'Tài liệu hướng dẫn sử dụng hệ thống quản lý', N'huong-dan-su-dung.pdf', N'/uploads/documents/huong-dan-su-dung.pdf', 512000, N'application/pdf', 4, 2, 78, 1);
SET IDENTITY_INSERT documents OFF;
GO

-- Activities
SET IDENTITY_INSERT activities ON;
INSERT INTO activities (id, title, slug, description, content, location, start_date, end_date, organizer, category_id, created_by, view_count, is_featured, is_published) VALUES
(1, N'Hội thảo đổi mới sáng tạo 2024', N'hoi-thao-doi-moi-sang-tao-2024', 
 N'Hội thảo về đổi mới sáng tạo trong thời đại 4.0', 
 N'<p>Hội thảo sẽ diễn ra trong 2 ngày với sự tham gia của nhiều chuyên gia hàng đầu.</p>', 
 N'Trung tâm Hội nghị Quốc gia, Hà Nội', 
 DATEADD(day, 30, GETDATE()), DATEADD(day, 32, GETDATE()), 
 N'Ban tổ chức trung ương', 5, 1, 234, 1, 1),
(2, N'Tập huấn kỹ năng lãnh đạo', N'tap-huan-ky-nang-lanh-dao', 
 N'Khóa tập huấn nâng cao kỹ năng lãnh đạo cho cán bộ', 
 N'<p>Khóa học kéo dài 3 ngày với nhiều nội dung bổ ích.</p>', 
 N'Khách sạn Daewoo, Hà Nội', 
 DATEADD(day, 15, GETDATE()), DATEADD(day, 17, GETDATE()), 
 N'Phòng Đào tạo', 5, 1, 156, 1, 1);
SET IDENTITY_INSERT activities OFF;
GO

-- Organizations
SET IDENTITY_INSERT organizations ON;
INSERT INTO organizations (id, name, name_abbr, description, website, email, phone, address, display_order, is_active) VALUES
(1, N'Hội Liên hiệp Thanh niên Việt Nam', N'Hội LHTN VN', N'Tổ chức chính trị - xã hội của thanh niên Việt Nam', N'http://hointn.vn', N'contact@hointn.vn', N'024-12345678', N'Số 123, Đường ABC, Quận Đống Đa, Hà Nội', 1, 1),
(2, N'Trung ương Hội LHTN Việt Nam', N'TW Hội LHTN VN', N'Cơ quan trung ương của Hội', N'http://hointn.vn', N'tw@hointn.vn', N'024-87654321', N'Số 456, Đường XYZ, Quận Ba Đình, Hà Nội', 1, 1);
SET IDENTITY_INSERT organizations OFF;
GO

-- Contact Info
SET IDENTITY_INSERT contact_info ON;
INSERT INTO contact_info (id, name, email, phone, subject, message, is_read, is_replied) VALUES
(1, N'Nguyễn Văn A', N'nguyenvana@example.com', N'0912345678', N'Hỏi về thông tin hoạt động', N'Xin chào, tôi muốn biết thêm thông tin về các hoạt động sắp tới.', 1, 0),
(2, N'Trần Thị B', N'tranthib@example.com', N'0987654321', N'Đăng ký tham gia sự kiện', N'Tôi muốn đăng ký tham gia hội thảo tháng tới.', 0, 0);
SET IDENTITY_INSERT contact_info OFF;
GO

-- ==================================================
-- 5. TẠO INDEX ĐỂ TỐI ƯU HIỆU NĂNG
-- ==================================================

CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_news_author ON news(author_id);
CREATE INDEX idx_news_published ON news(is_published, published_at);
CREATE INDEX idx_news_slug ON news(slug);

CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

CREATE INDEX idx_activities_category ON activities(category_id);
CREATE INDEX idx_activities_created_by ON activities(created_by);
CREATE INDEX idx_activities_dates ON activities(start_date, end_date);
CREATE INDEX idx_activities_slug ON activities(slug);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE INDEX idx_organizations_parent ON organizations(parent_id);

CREATE INDEX idx_contact_read ON contact_info(is_read);
GO

-- ==================================================
-- HOÀN TẤT - DATABASE ĐÃ SẴN SÀNG SỬ DỤNG
-- ==================================================

PRINT 'Database MyAppDB đã được tạo thành công!';
PRINT 'Tổng số bảng: 7';
PRINT '- users: 2 records';
PRINT '- categories: 9 records (phân theo trang)';
PRINT '- news: 3 records';
PRINT '- documents: 3 records';
PRINT '- activities: 2 records';
PRINT '- organizations: 2 records';
PRINT '- contact_info: 2 records';
GO

-- ==================================================
-- MIGRATION: Thêm cột page_type vào bảng categories đã tồn tại
-- Chạy script này nếu database đã có sẵn và cần cập nhật
-- ==================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('categories') AND name = 'page_type')
BEGIN
    ALTER TABLE categories ADD page_type NVARCHAR(50) NOT NULL DEFAULT 'news';
    PRINT 'Đã thêm cột page_type vào bảng categories';
END
GO