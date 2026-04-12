-- ================================================
-- TẠO DATABASE
-- ================================================
CREATE DATABASE IF NOT EXISTS MyAppDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE MyAppDB;

-- ================================================
-- XÓA BẢNG CŨ
-- ================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS contact_info;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS timeline_events;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS post_templates;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- USERS
-- ================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),
    role ENUM('admin_full', 'utility_only', 'post_author') NOT NULL DEFAULT 'post_author',
    member_type ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
    student_code VARCHAR(30),
    class_name VARCHAR(50),
    department VARCHAR(120),
    department_position VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (
    username,password,email,full_name,avatar_url,role,
    member_type,student_code,class_name,department,department_position,is_active
) VALUES
('admin','123456','admin@myapp.com','Nguyễn Văn Admin',NULL,'admin_full','teacher',NULL,NULL,'ban chấp hành','admin hệ thống',TRUE),
('bi-thu-fit','123456','bithu.fit@neu.edu.vn','TS. Nguyễn Văn A',NULL,'utility_only','teacher',NULL,NULL,'ban chấp hành','bí thư',TRUE),

('bvt-truong-ban','123456','bvt.truongban@neu.edu.vn','Trần Quốc Bảo',NULL,'post_author','student','22120001','22CTT1','ban văn thể','trưởng ban, phó bí thư, ủy viên ban chấp hành',TRUE),
('bvt-pho-ban','123456','bvt.phoban@neu.edu.vn','Phạm Thu Hà',NULL,'post_author','student','22120002','22CTT1','ban văn thể','phó ban',TRUE),
('bvt-tv01','123456','bvt.tv01@neu.edu.vn','Lê Minh Khang',NULL,'post_author','student','22120003','22CTT2','ban văn thể','thành viên',TRUE),
('bvt-tv02','123456','bvt.tv02@neu.edu.vn','Võ Gia Linh',NULL,'post_author','student','22120004','22CTT2','ban văn thể','thành viên',TRUE),
('bvt-tv03','123456','bvt.tv03@neu.edu.vn','Ngô Hoàng Nam',NULL,'post_author','student','22120005','22CTT3','ban văn thể','thành viên',TRUE),

('ttkt-truong-ban','123456','ttkt.truongban@neu.edu.vn','Lý Khánh Vy',NULL,'post_author','student','22120006','22CTT3','ban truyền thông kỹ thuật','trưởng ban, phó bí thư, ủy viên ban chấp hành',TRUE),
('ttkt-pho-ban','123456','ttkt.phoban@neu.edu.vn','Bùi Gia Huy',NULL,'post_author','student','22120007','22CTT4','ban truyền thông kỹ thuật','phó ban',TRUE),
('ttkt-tv01','123456','ttkt.tv01@neu.edu.vn','Đặng Minh Châu',NULL,'post_author','student','22120008','22CTT4','ban truyền thông kỹ thuật','thành viên',TRUE),
('ttkt-tv02','123456','ttkt.tv02@neu.edu.vn','Hoàng Đức Trí',NULL,'post_author','student','22120009','22CTT5','ban truyền thông kỹ thuật','thành viên',TRUE),
('ttkt-tv03','123456','ttkt.tv03@neu.edu.vn','Phan Hải My',NULL,'post_author','student','22120010','22CTT5','ban truyền thông kỹ thuật','thành viên',TRUE),

('tcsk-truong-ban','123456','tcsk.truongban@neu.edu.vn','Nguyễn Thành Đạt',NULL,'post_author','student','22120011','22CTT6','ban tổ chức sự kiện','trưởng ban, ủy viên ban chấp hành',TRUE),
('tcsk-pho-ban','123456','tcsk.phoban@neu.edu.vn','Trần Bảo Anh',NULL,'post_author','student','22120012','22CTT6','ban tổ chức sự kiện','phó ban',TRUE),
('tcsk-tv01','123456','tcsk.tv01@neu.edu.vn','Hồ Thanh Tùng',NULL,'post_author','student','22120013','22CTT1','ban tổ chức sự kiện','thành viên',TRUE),
('tcsk-tv02','123456','tcsk.tv02@neu.edu.vn','Mai Hương Giang',NULL,'post_author','student','22120014','22CTT2','ban tổ chức sự kiện','thành viên',TRUE),
('tcsk-tv03','123456','tcsk.tv03@neu.edu.vn','Đoàn Quang Vinh',NULL,'post_author','student','22120015','22CTT3','ban tổ chức sự kiện','thành viên',TRUE),

('dn-truong-ban','123456','dn.truongban@neu.edu.vn','Vũ Khánh Linh',NULL,'post_author','student','22120016','22CTT4','ban đối ngoại','trưởng ban, ủy viên ban chấp hành',TRUE),
('dn-pho-ban','123456','dn.phoban@neu.edu.vn','Phạm Công Minh',NULL,'post_author','student','22120017','22CTT5','ban đối ngoại','phó ban',TRUE),
('dn-tv01','123456','dn.tv01@neu.edu.vn','Trịnh Ngọc Mai',NULL,'post_author','student','22120018','22CTT6','ban đối ngoại','thành viên',TRUE),
('dn-tv02','123456','dn.tv02@neu.edu.vn','Lương Mạnh Hùng',NULL,'post_author','student','22120019','22CTT1','ban đối ngoại','thành viên',TRUE),
('dn-tv03','123456','dn.tv03@neu.edu.vn','Đinh Tú Uyên',NULL,'post_author','student','22120020','22CTT2','ban đối ngoại','thành viên',TRUE),

('ctdptd-truong-ban','123456','ctdptd.truongban@neu.edu.vn','Nguyễn Đức Long',NULL,'post_author','student','22120021','22CTT3','ban công tác đoàn và phát triển đảng','trưởng ban, ủy viên ban chấp hành',TRUE),
('ctdptd-pho-ban','123456','ctdptd.phoban@neu.edu.vn','Phạm Ngọc Trâm',NULL,'post_author','student','22120022','22CTT4','ban công tác đoàn và phát triển đảng','phó ban',TRUE),
('ctdptd-tv01','123456','ctdptd.tv01@neu.edu.vn','Lê Hoài Phương',NULL,'post_author','student','22120023','22CTT5','ban công tác đoàn và phát triển đảng','thành viên',TRUE),
('ctdptd-tv02','123456','ctdptd.tv02@neu.edu.vn','Trương Gia Bảo',NULL,'post_author','student','22120024','22CTT6','ban công tác đoàn và phát triển đảng','thành viên',TRUE),
('ctdptd-tv03','123456','ctdptd.tv03@neu.edu.vn','Đặng Hải Yến',NULL,'post_author','student','22120025','22CTT1','ban công tác đoàn và phát triển đảng','thành viên',TRUE);

-- ================================================
-- CATEGORIES
-- ================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    intro_image VARCHAR(500),
    parent_id INT,
    page_type VARCHAR(50) DEFAULT 'news',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

INSERT INTO categories (id,name,slug,page_type,description,intro_image,parent_id) VALUES
(1,'Tin tức','tin-tuc','news','Tin tức của Liên Chi đoàn',NULL,NULL),
(2,'Thông báo','thong-bao','news','Thông báo chính thức',NULL,NULL),
(3,'Sự kiện','su-kien','news','Các sự kiện',NULL,NULL),
(4,'Hoạt động học thuật','hoc-thuat','activity','Hoạt động học thuật',NULL,NULL),
(5,'Hoạt động tình nguyện','tinh-nguyen','activity','Hoạt động cộng đồng',NULL,NULL),
(6,'Hoạt động thể thao','the-thao','activity','Hoạt động thể thao',NULL,NULL),
(7,'Thành tích','thanh-tich','achievement','Thành tích nổi bật',NULL,NULL),
(8,'Tài liệu','tai-lieu','document','Tài liệu',NULL,NULL),
(9,'Chương trình thường niên','thuong-nien','activity_annual','Hoạt động thường niên','https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',NULL),
(10,'Khác','khac','news','Danh mục khác',NULL,NULL),
(11,'Chào tân sinh viên','chao-tan-sinh-vien','activity_annual','Lễ chào tân sinh viên khóa mới',NULL,9),
(12,'Quân sự','quan-su','activity_annual','Quân sự huấn luyện sinh viên',NULL,9),
(13,'FIT Cup','fit-cup','activity_annual','Giải bóng đá FIT Cup',NULL,9),
(14,'Prom','prom','activity_annual','Lễ prom sinh viên',NULL,9),
(15,'Talkshow','talkshow','activity_annual','Talkshow và giao lưu',NULL,9),
(16,'Cuộc thi','cuoc-thi','activity_annual','Các cuộc thi và hackathon',NULL,9),
(17,'Hoạt động không thường niên','hoat-dong-khong-thuong-nien','activity_non_annual','Hoạt động không thường niên của Liên Chi đoàn',NULL,NULL),
(18,'Tình nguyện cộng đồng','tinh-nguyen-cong-dong','activity_non_annual','Các hoạt động phục vụ cộng đồng',NULL,17),
(19,'Kết nối doanh nghiệp','ket-noi-doanh-nghiep','activity_non_annual','Các hoạt động kết nối và định hướng nghề nghiệp',NULL,17);

-- ================================================
-- POST TEMPLATES
-- ================================================
CREATE TABLE post_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    title_template VARCHAR(255),
    summary_template TEXT,
    content_template LONGTEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO post_templates (name, category_id, title_template, summary_template, content_template, is_default, created_by) VALUES
(
    'Template Chào tân sinh viên',
    11,
    'Chào tân K67 đã bắt đầu',
    'Chương trình Chào tân sinh viên K67 chính thức khởi động với nhiều hoạt động kết nối và truyền cảm hứng.',
    '<h2>Chào tân K67 đã bắt đầu</h2><p>Chương trình Chào tân K67 đã bắt đầu với không khí sôi động, nhiều hoạt động giao lưu giữa tân sinh viên và các anh chị khóa trên.</p><p>Trong buổi mở màn, Ban tổ chức đã giới thiệu tổng quan về Liên Chi đoàn, định hướng học tập và các câu lạc bộ để các bạn nhanh chóng hòa nhập môi trường đại học.</p><p>Hãy theo dõi fanpage để cập nhật lịch trình chi tiết và các mốc đăng ký hoạt động tiếp theo.</p>',
    TRUE,
    1
),
(
    'Template FIT Cup',
    13,
    'FIT Cup {{year}} chính thức khởi tranh',
    'Giải bóng đá thường niên FIT Cup đã quay trở lại với nhiều đội thi và hoạt động đồng hành hấp dẫn.',
    '<h2>FIT Cup {{year}} chính thức khởi tranh</h2><p>FIT Cup năm nay quy tụ nhiều đội bóng sinh viên và hứa hẹn mang lại những trận đấu bùng nổ.</p><p>Ban tổ chức khuyến khích các bạn sinh viên tham gia cổ vũ văn minh, lan tỏa tinh thần thể thao đoàn kết của khoa CNTT.</p>',
    TRUE,
    1
);

-- ================================================
-- NEWS
-- ================================================
CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    content LONGTEXT,
    thumbnail VARCHAR(255),
    category_id INT,
    author_id INT,
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

INSERT INTO news (title,slug,summary,content,thumbnail,category_id,author_id,is_featured,is_published,published_at) VALUES
('Thông báo kế hoạch học kỳ mới','thong-bao-ke-hoach-hoc-ky-moi',
'Cập nhật kế hoạch hoạt động học kỳ mới của Liên Chi đoàn.',
'Bài viết tổng hợp kế hoạch hoạt động theo từng tháng, kèm định hướng trọng tâm và các mốc triển khai.',
'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
2,1,1,1,DATE_SUB(NOW(), INTERVAL 1 DAY)),

('Ngày hội việc làm IT 2026','ngay-hoi-viec-lam-it-2026',
'Sự kiện kết nối sinh viên với doanh nghiệp công nghệ.',
'Ngày hội việc làm quy tụ nhiều doanh nghiệp, mở rộng cơ hội thực tập và việc làm cho sinh viên.',
'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
3,1,1,1,DATE_SUB(NOW(), INTERVAL 2 DAY)),

('Talkshow ứng dụng AI trong học tập','talkshow-ung-dung-ai-trong-hoc-tap',
'Chia sẻ ứng dụng AI trong học tập và nghiên cứu.',
'Chương trình trao đổi với diễn giả từ doanh nghiệp và giảng viên về các công cụ AI trong học tập.',
'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1400&q=80',
1,2,1,1,DATE_SUB(NOW(), INTERVAL 3 DAY)),

('Lễ chào tân sinh viên K66','le-chao-tan-sinh-vien-k66',
'Sự kiện mở đầu năm học dành cho tân sinh viên.',
'Lễ chào tân sinh viên giới thiệu tổng quan khoa, Liên Chi đoàn và các hoạt động phong trào nổi bật.',
'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80',
11,2,1,1,DATE_SUB(NOW(), INTERVAL 4 DAY)),

('FIT Cup 2026 chính thức khởi tranh','fit-cup-2026-khoi-tranh',
'Giải bóng đá sinh viên thường niên đã quay trở lại.',
'Giải đấu năm nay mở rộng số đội tham gia và có thêm hoạt động đồng hành dành cho cổ động viên.',
'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80',
13,1,1,1,DATE_SUB(NOW(), INTERVAL 5 DAY)),

('Workshop định hướng nghề nghiệp IT','workshop-dinh-huong-nghe-nghiep-it',
'Buổi chia sẻ định hướng nghề nghiệp cho sinh viên năm 3-4.',
'Chương trình tập trung vào kỹ năng CV, phỏng vấn và lộ trình học tập phù hợp theo từng vị trí.',
'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80',
19,3,1,1,DATE_SUB(NOW(), INTERVAL 6 DAY)),

('Chiến dịch tình nguyện mùa hè xanh','chien-dich-tinh-nguyen-mua-he-xanh',
'Hoạt động tình nguyện cộng đồng tại địa phương.',
'Đội hình sinh viên triển khai nhiều phần việc như dạy học, chuyển đổi số cơ bản và hỗ trợ địa phương.',
'https://images.unsplash.com/photo-1469571486292-b53601020f00?auto=format&fit=crop&w=1400&q=80',
18,2,1,1,DATE_SUB(NOW(), INTERVAL 7 DAY)),

('Thành tích nghiên cứu khoa học sinh viên','thanh-tich-nghien-cuu-khoa-hoc-sinh-vien',
'Sinh viên khoa đạt giải cao trong cuộc thi nghiên cứu khoa học.',
'Nhiều đề tài nghiên cứu của sinh viên được đánh giá cao nhờ tính ứng dụng và khả năng triển khai thực tế.',
'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
7,1,1,1,DATE_SUB(NOW(), INTERVAL 8 DAY)),

('Thành tích Olympic Tin học toàn quốc','thanh-tich-olympic-tin-hoc-toan-quoc',
'Đội tuyển khoa giành huy chương tại Olympic Tin học.',
'Đội tuyển sinh viên khoa đạt thành tích xuất sắc sau quá trình ôn luyện nghiêm túc và bền bỉ.',
'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80',
7,3,1,1,DATE_SUB(NOW(), INTERVAL 9 DAY)),

('Bản tin hoạt động tháng này','ban-tin-hoat-dong-thang-nay',
'Tổng hợp nhanh các hoạt động nổi bật trong tháng.',
'Bản tin tổng hợp các sự kiện đã diễn ra cùng lịch hoạt động sắp tới của Liên Chi đoàn.',
'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80',
1,1,0,1,DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ================================================
-- DOCUMENTS
-- ================================================
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    category_id INT,
    uploaded_by INT,
    download_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

INSERT INTO documents (title,file_name,file_path,file_type,category_id,uploaded_by) VALUES
('Quy chế hoạt động','quyche.pdf','/docs/quyche.pdf','pdf',8,1),
('Hướng dẫn sinh viên','huongdan.pdf','/docs/huongdan.pdf','pdf',8,1),
('Tài liệu React','react.pdf','/docs/react.pdf','pdf',8,2),
('Tài liệu NodeJS','nodejs.pdf','/docs/nodejs.pdf','pdf',8,2),
('Slide AI','ai.ppt','/docs/ai.ppt','ppt',8,2),
('Slide Data','data.ppt','/docs/data.ppt','ppt',8,2),
('Tài liệu SQL','sql.pdf','/docs/sql.pdf','pdf',8,3),
('Hướng dẫn Git','git.pdf','/docs/git.pdf','pdf',8,3),
('Tài liệu DevOps','devops.pdf','/docs/devops.pdf','pdf',8,3),
('Tài liệu Docker','docker.pdf','/docs/docker.pdf','pdf',8,3);

-- ================================================
-- ACTIVITIES
-- ================================================
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    content LONGTEXT,
    location VARCHAR(255),
    start_date DATETIME,
    end_date DATETIME,
    thumbnail VARCHAR(255),
    images TEXT,
    organizer VARCHAR(255),
    category_id INT,
    created_by INT,
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT INTO activities (title,slug,description,location,start_date,end_date,category_id,created_by) VALUES
('Lễ chào tân sinh viên 2025','chao-tan-2025','Chương trình chào tân sinh viên khóa 25 được tổ chức nhằm giúp các bạn sinh viên mới làm quen với môi trường đại học.','Hội trường chính','2025-09-01','2025-09-02',11,1),
('Quân sự huấn luyện khóa 25','quan-su-2025','Chương trình quân sự huấn luyện sinh viên khóa mới, giúp các bạn nâng cao tinh thần kỷ luật và thể lực.','Sân trường','2025-09-05','2025-09-10',12,1),
('FIT Cup 2025','fit-cup-2025','Giải bóng đá FIT Cup thường niên, đây là sân chơi lớn nhất của sinh viên khoa CNTT mỗi năm.','Sân bóng đá UTE','2025-10-01','2025-10-20',13,1),
('Prom sinh viên 2025','prom-2025','Lễ prom sinh viên khoa CNTT - sự kiện lớn nhất của năm học với sự tham gia của hàng trăm bạn sinh viên.','Sân khấu trước hội trường','2025-12-15','2025-12-15',14,2),
('Talkshow công nghệ','talkshow-tech','Talkshow về xu hướng công nghệ mới, các chuyên gia chia sẻ kinh nghiệm và cơ hội nghề nghiệp.','Phòng hội thảo','2025-05-20','2025-05-20',15,2),
('Hackathon 2025','hackathon-2025','Cuộc thi Hackathon thường niên dành cho sinh viên lập trình và công nghệ thông tin.','Lab CNTT','2025-08-01','2025-08-02',16,1),
('Giải lập trình sinh viên','giai-lap-trinh','Giải lập trình thường niên với các bài toán thách thức về thuật toán và cấu trúc dữ liệu.','Lab CNTT','2025-12-01','2025-12-05',16,3),
('Workshop lập trình web','workshop-web','Workshop tập trung vào các công nghệ web hiện đại như React, Node.js, và các framework khác.','Phòng lab','2025-06-15','2025-06-15',15,2),
('FIT Cup futsal','fit-cup-futsal','Giải bóng đá futsal trong khuôn khổ FIT Cup với sự tham gia của nhiều đội bóng từ các lớp.','Sân futsal','2025-11-01','2025-11-15',13,1),
('Workshop AI & Data Science','workshop-ai-data','Workshop về ứng dụng AI và Data Science trong doanh nghiệp và nghiên cứu khoa học.','Phòng hội thảo','2025-07-10','2025-07-10',15,2);

-- ================================================
-- TIMELINE EVENTS
-- ================================================
CREATE TABLE timeline_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type ENUM('annual') NOT NULL DEFAULT 'annual',
    month TINYINT NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    summary TEXT,
    sort_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_timeline_month CHECK (month BETWEEN 1 AND 12),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO timeline_events (event_type, month, event_name, summary, sort_order, is_published, created_by) VALUES
('annual', 1, 'Khởi động học kỳ xuân', 'Ra quân đội ngũ cộng tác viên và triển khai kế hoạch học kỳ mới.', 1, TRUE, 1),
('annual', 3, 'Chuỗi workshop học thuật', 'Tổ chức chuyên đề học thuật theo nhóm công nghệ và định hướng nghề nghiệp.', 1, TRUE, 1),
('annual', 5, 'Chiến dịch tình nguyện', 'Các đội hình tình nguyện thực hiện hoạt động cộng đồng tại địa phương.', 1, TRUE, 1),
('annual', 8, 'Hackathon sinh viên FIT', 'Sân chơi công nghệ thường niên cho các đội thi liên ngành.', 1, TRUE, 1),
('annual', 9, 'Chào tân sinh viên', 'Sự kiện kết nối tân sinh viên với các ban chuyên môn của Liên Chi đoàn.', 1, TRUE, 1),
('annual', 10, 'FIT Cup', 'Giải thể thao thường niên với các nội dung thi đấu và cổ vũ tập thể.', 1, TRUE, 1),
('annual', 12, 'Tổng kết cuối năm', 'Tổng kết thành tích, vinh danh và công bố định hướng năm tới.', 1, TRUE, 1);

-- ================================================
-- ORGANIZATIONS
-- ================================================
CREATE TABLE organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_abbr VARCHAR(50),
    description TEXT,
    logo VARCHAR(255),
    website VARCHAR(255),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    parent_id INT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES organizations(id)
);

INSERT INTO organizations (name,name_abbr,description,display_order) VALUES
('Ban Chấp Hành','BCH','Gồm bí thư, phó bí thư và các ủy viên là trưởng ban',0),
('Ban Văn Thể','BVT','Tổ chức các hoạt động văn hóa, văn nghệ, thể dục thể thao',1),
('Ban Truyền Thông Kỹ Thuật','TTKT','Quản lý fanpage, website, thiết kế poster, quay dựng video',2),
('Ban Tổ Chức Sự Kiện','TCSK','Lên kế hoạch và tổ chức các sự kiện của Liên Chi Đoàn',3),
('Ban Đối Ngoại','ĐN','Kết nối với các tổ chức bên ngoài, tìm kiếm tài trợ',4),
('Ban Công Tác Đoàn và Phát Triển Đảng','CTD & PTD','Quản lý đoàn viên, phát triển đảng viên, công tác đoàn',5);

-- ================================================
-- CONTACT INFO
-- ================================================
CREATE TABLE contact_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_replied BOOLEAN DEFAULT FALSE,
    replied_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO contact_info (name,email,phone,subject,message) VALUES
('Nguyễn Văn A','a@gmail.com','0900000001','Hỏi thông tin','Tôi muốn hỏi về hoạt động.'),
('Trần Văn B','b@gmail.com','0900000002','Đăng ký','Tôi muốn đăng ký sự kiện.'),
('Lê Văn C','c@gmail.com','0900000003','Tài liệu','Xin tài liệu học.'),
('Phạm Văn D','d@gmail.com','0900000004','CLB','Hỏi về CLB.'),
('Hoàng Văn E','e@gmail.com','0900000005','Sự kiện','Thông tin sự kiện.'),
('Nguyễn Văn F','f@gmail.com','0900000006','Workshop','Hỏi workshop.'),
('Trần Văn G','g@gmail.com','0900000007','Tuyển thành viên','CLB tuyển người?'),
('Lê Văn H','h@gmail.com','0900000008','Talkshow','Tham gia talkshow.'),
('Phạm Văn I','i@gmail.com','0900000009','Hackathon','Chi tiết hackathon'),
('Hoàng Văn K','k@gmail.com','0900000010','Khác','Liên hệ khác');

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_news_author ON news(author_id);
CREATE INDEX idx_news_published ON news(is_published, published_at);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_activities_category ON activities(category_id);
CREATE INDEX idx_activities_created_by ON activities(created_by);
CREATE INDEX idx_activities_dates ON activities(start_date, end_date);
CREATE INDEX idx_timeline_month_published ON timeline_events(month, is_published);
CREATE INDEX idx_timeline_sort ON timeline_events(sort_order, month);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_page_type ON categories(page_type);
CREATE INDEX idx_organizations_parent ON organizations(parent_id);
CREATE INDEX idx_contact_read ON contact_info(is_read);
CREATE INDEX idx_contact_replied ON contact_info(is_replied);