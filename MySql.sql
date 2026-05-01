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
DROP TABLE IF EXISTS user_teams;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS timeline_events;

DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS post_templates;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- 1. BẢNG TEAMS (Các Ban)
-- ================================================
CREATE TABLE teams (
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO teams (id, name, name_abbr, description, display_order) VALUES
(1, 'Ban Chấp Hành', 'BCH', 'Gồm bí thư, phó bí thư và các ủy viên là trưởng ban, phó ban', 0),
(2, 'Ban Văn Thể', 'BVT', 'Tổ chức các hoạt động văn hóa, văn nghệ, thể dục thể thao', 1),
(3, 'Ban Truyền Thông Kỹ Thuật', 'TTKT', 'Quản lý fanpage, website, thiết kế poster, quay dựng video', 2),
(4, 'Ban Tổ Chức Sự Kiện', 'TCSK', 'Lên kế hoạch và tổ chức các sự kiện của Liên Chi Đoàn', 3),
(5, 'Ban Đối Ngoại', 'ĐN', 'Kết nối với các tổ chức bên ngoài, tìm kiếm tài trợ', 4),
(6, 'Ban Công Tác Đoàn và Phát Triển Đảng', 'CTD & PTD', 'Quản lý đoàn viên, phát triển đảng viên, công tác đoàn', 5);

-- ================================================
-- 2. BẢNG USERS (Người dùng cốt lõi)
-- ================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),
    role ENUM('admin_full', 'utility_only', 'contact_manager', 'post_author') NOT NULL DEFAULT 'post_author',
    member_type ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
    student_code VARCHAR(30),
    class_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (id, username, password, email, full_name, avatar_url, role, member_type, student_code, class_name, is_active, created_at, updated_at) VALUES
(1, 'admin', '123456', 'admin@myapp.com', 'Nguyễn Văn Admin', NULL, 'admin_full', 'teacher', NULL, NULL, TRUE, '2026-04-24 10:28:01', '2026-04-30 20:28:44'),
(2, 'bi-thu-fit', '123456', 'bithu.fit@neu.edu.vn', 'TS. Nguyễn Văn A', NULL, 'utility_only', 'teacher', NULL, NULL, TRUE, '2026-04-24 10:28:01', '2026-04-30 20:28:44'),
(3, 'khuatminhtrang2005', '11236221', 'khuatminhtrang2005@gmail.com', 'Khuất Minh Trang', NULL, 'post_author', 'student', '11236221', 'CNTT65C', TRUE, '2026-04-24 10:56:12', '2026-04-24 10:56:12'),
(4, 'thuyvu123456', 'thuyvu', 'thuyvu@gmail.com', 'Vũ Thị Thuỷ', NULL, 'admin_full', 'student', '11235671', 'CNTT65B', TRUE, '2026-04-24 11:15:02', '2026-04-26 13:37:09'),
(5, 'nth123456', 'nth', 'nth@gmail.com', 'Nguyễn Thanh Hoa', NULL, 'post_author', 'teacher', NULL, NULL, TRUE, '2026-04-25 14:07:06', '2026-04-25 14:07:06');


-- ================================================
-- 3. BẢNG TRUNG GIAN USER_TEAMS (Phân công người dùng vào ban)
-- ================================================
CREATE TABLE user_teams (
    user_id INT,
    team_id INT,
    position VARCHAR(100),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, team_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

INSERT INTO user_teams (user_id, team_id, position) VALUES
(1, 1, 'admin hệ thống'),
(2, 1, 'bí thư'),
(3, 2, 'trường ban'),
(4, 3, 'phó ban'),



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
(4,'Hoạt động học thuật','hoc-thuat','event_non_annual','Hoạt động học thuật',NULL,NULL),
(5,'Hoạt động tình nguyện','tinh-nguyen','event_non_annual','Hoạt động cộng đồng',NULL,NULL),
(6,'Hoạt động thể thao','the-thao','event_non_annual','Hoạt động thể thao',NULL,NULL),
(7,'Thành tích','thanh-tich','achievement','Thành tích nổi bật',NULL,NULL),
(8,'Tài liệu','tai-lieu','document','Tài liệu',NULL,NULL),
(9,'Chương trình thường niên','thuong-nien','event_annual','Hoạt động thường niên',NULL,NULL),
(10,'Khác','khac','news','Danh mục khác',NULL,NULL),
(11,'Chào tân sinh viên','chao-tan-sinh-vien','event_annual','Lễ chào tân sinh viên khóa mới',NULL,9),
(12,'Quân sự','quan-su','event_annual','Quân sự huấn luyện sinh viên',NULL,9),
(13,'FIT Cup','fit-cup','event_annual','Giải bóng đá FIT Cup',NULL,9),
(14,'Prom','prom','event_annual','Lễ prom sinh viên',NULL,9),
(15,'Talkshow','talkshow','event_annual','Talkshow và giao lưu',NULL,9),
(16,'Cuộc thi','cuoc-thi','event_annual','Các cuộc thi và hackathon',NULL,9);


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
    'Template Chào tân sinh viên', 11, 'Chào tân K67 đã bắt đầu', 'Chương trình Chào tân sinh viên K67 chính thức khởi động với nhiều hoạt động kết nối và truyền cảm hứng.',
    '<h2>Chào tân K67 đã bắt đầu</h2><p>Chương trình Chào tân K67 đã bắt đầu với không khí sôi động, nhiều hoạt động giao lưu giữa tân sinh viên và các anh chị khóa trên.</p><p>Trong buổi mở màn, Ban tổ chức đã giới thiệu tổng quan về Liên Chi đoàn, định hướng học tập và các câu lạc bộ để các bạn nhanh chóng hòa nhập môi trường đại học.</p><p>Hãy theo dõi fanpage để cập nhật lịch trình chi tiết và các mốc đăng ký hoạt động tiếp theo.</p>',
    TRUE, 1
),
(
    'Template FIT Cup', 13, 'FIT Cup {{year}} chính thức khởi tranh', 'Giải bóng đá thường niên FIT Cup đã quay trở lại với nhiều đội thi và hoạt động đồng hành hấp dẫn.',
    '<h2>FIT Cup {{year}} chính thức khởi tranh</h2><p>FIT Cup năm nay quy tụ nhiều đội bóng sinh viên và hứa hẹn mang lại những trận đấu bùng nổ.</p><p>Ban tổ chức khuyến khích các bạn sinh viên tham gia cổ vũ văn minh, lan tỏa tinh thần thể thao đoàn kết của khoa CNTT.</p>',
    TRUE, 1
);


-- ================================================
-- POSTS (Với đầy đủ 12 bản ghi)
-- ================================================
CREATE TABLE posts (
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

INSERT INTO posts (id, title, slug, summary, content, thumbnail, category_id, author_id, view_count, is_featured, is_published, published_at, created_at, updated_at) VALUES 
(
    1, 'CHÍNH THỨC RA MẮT SỰ KIỆN CHÀO TÂN K67 - AETERNIA', 'chao-tan-k67-aeternia', 'Ra mắt chuỗi sự kiện chào tân sinh viên K67', 
    '“Ngai vàng có thể chỉ thuộc về một gia tộc, nhưng vinh quang thuộc về tất cả những ai đã dũng cảm bước vào cuộc chiến này.” Chuỗi sự kiện chào tân K67 của Khoa Công nghệ thông tin đã chính thức khởi động với chủ đề Aeternia - hành trình trở về vương quốc huy hoàng, nơi những tân sinh viên K67 sẽ đấu tranh và khẳng định bản lĩnh của mình. Từ những bước chân đầu tiên cho đến khi ánh sáng đêm gala bùng cháy, tất cả sẽ trở thành thử thách về tinh thần, ý chí và tài năng. Hãy theo dõi và đồng hành cùng LCĐ để chứng kiến hành trình chinh phục đầy cảm hứng này.', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777026774/lcd/activity-post-images/slfkyfyv18gp2ynyde57.jpg', 
    11, 1, 20, 1, 1, '2026-04-24 10:28:06', '2026-04-24 10:28:06', '2026-04-25 11:52:54'
),
(
    2, 'RECAP TEAM BUILDING CHÀO TÂN SINH VIÊN K67', 'recap-team-building-k67', 'Tổng kết hoạt động team building chào tân K67', 
    'Vào Chủ nhật ngày 12/10, sự kiện team building chào đón tân sinh viên K67 của Khoa Công Nghệ Thông Tin đã diễn ra trong không khí sôi nổi, hào hứng và đầy cảm xúc. Với sự góp mặt đông đảo của các bạn sinh viên K67 cùng sự chuẩn bị chu đáo từ ban tổ chức AETERNIA, chương trình đã trở thành cầu nối giúp các bạn xóa tan sự bỡ ngỡ ban đầu, tạo nên những khoảnh khắc gắn kết và khơi dậy tinh thần nhiệt huyết. Những trò chơi đồng đội và thử thách sáng tạo đã giúp sinh viên thể hiện cá tính và tinh thần đoàn kết. K67 – hãy tiếp tục lan tỏa tinh thần Dám nghĩ – Dám làm – Dám bứt phá!', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777026790/lcd/activity-post-images/jr9zsl3eegmyocavraiw.jpg', 
    11, 1, 14, 1, 1, '2026-04-24 10:28:06', '2026-04-24 10:28:06', '2026-04-25 15:03:35'
),
(
    3, 'THÔNG BÁO LỊCH THI ĐẤU TỨ KẾT – FIT CUP S2', 'fit-cup-tu-ket-s2', 'Lịch thi đấu vòng tứ kết FIT CUP', 
    'Sau những vòng đấu đầy kịch tính, FIT CUP S2 đã chính thức bước vào giai đoạn Tứ kết – nơi chỉ còn lại những đội bóng xuất sắc nhất tranh tài cho tấm vé đi tiếp. Ban tổ chức công bố lịch thi đấu với những cặp đấu hấp dẫn và khó đoán. Đây là những trận đấu mang tính quyết định, nơi bản lĩnh và chiến thuật được đẩy lên cao nhất. Hãy theo dõi và cổ vũ cho đội bóng bạn yêu thích!', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777027372/lcd/activity-post-images/csrobm7vzxc3uktzjfu6.jpg', 
    13, 1, 12, 1, 1, '2026-04-24 10:28:06', '2026-04-24 10:28:06', '2026-04-24 11:46:42'
),
(
    4, 'FIT RACE – BỨT PHÁ GIỚI HẠN, LAN TỎA TINH THẦN THỂ THAO', 'fit-race-2026', 'Giải chạy FIT RACE 2026', 
    'FIT RACE không chỉ là một giải chạy mà còn là hành trình vượt qua giới hạn bản thân. Trên mỗi cung đường, từng bước chân là sự kiên trì, nỗ lực và quyết tâm không bỏ cuộc. Mỗi chặng đường mang đến cảm xúc riêng và lan tỏa năng lượng tích cực của tuổi trẻ. FIT RACE – nơi mỗi bước chạy là một lần bứt phá.', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777215718/lcd/activity-post-images/cvtdrzjnjz8ea0i59g9j.jpg', 
    6, 1, 0, 1, 1, '2026-04-24 10:28:06', '2026-04-24 10:28:06', '2026-04-26 15:53:02'
),
(
    5, 'CHÀO MỪNG 95 NĂM NGÀY THÀNH LẬP ĐOÀN TNCS HỒ CHÍ MINH', 'chao-mung-95-nam-doan', 'Kỷ niệm 95 năm thành lập Đoàn TNCS Hồ Chí Minh', 
    'Tuổi trẻ Khoa Công nghệ thông tin xin gửi lời chúc mừng tới tổ chức Đoàn TNCS Hồ Chí Minh nhân dịp kỷ niệm 95 năm thành lập. Đây là hành trình của lý tưởng, cống hiến và khát vọng tuổi trẻ Việt Nam. Chúc các cán bộ Đoàn và đoàn viên luôn giữ vững nhiệt huyết, sáng tạo và sẵn sàng cống hiến.', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777026944/lcd/news-post-images/hwhb8vvwbcqjbm5xgc4f.jpg', 
    2, 1, 18, 1, 1, '2026-04-24 10:28:06', '2026-04-24 10:28:06', '2026-04-27 08:47:12'
),
(
    6, 'TUYÊN DƯƠNG TRẦN MINH KHÁNH – CÁN BỘ ĐOÀN TIÊU BIỂU 2026', 'tuyen-duong-tran-minh-khanh-2026', 'Tuyên dương cán bộ đoàn tiêu biểu năm 2026', 
    'Đồng chí Trần Minh Khánh – Phó Bí thư Liên chi Đoàn Khoa Công nghệ thông tin đã được tuyên dương là cán bộ Đoàn tiêu biểu năm 2026. Đây là sự ghi nhận xứng đáng cho những nỗ lực trong học tập và công tác Đoàn. Chúc đồng chí tiếp tục phát huy năng lực và đóng góp cho phong trào sinh viên.', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777026734/lcd/achievement-images/tvq1eg8kpyqeduhbd83t.jpg', 
    7, 1, 18, 1, 1, '2026-04-24 10:28:07', '2026-04-24 10:28:07', '2026-04-27 08:52:13'
),
(
    7, 'MERRY CHRISTMAS', 'merry-christmas', 'MERRY CHRISTMAS – KHOA CÔNG NGHỆ THÔNG TIN ', 
    '<div class="xdj266r x14z9mp xat24cr x1lziwak x1vvkbs x126k92a" style="white-space: pre-wrap; margin-inline: 0px; overflow-wrap: break-word; margin-bottom: 0px; margin-top: 0px; font-family: &quot;Segoe UI Historic&quot;, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif; color: rgb(8, 8, 9); font-size: 15px;"><div dir="auto" style="font-family: inherit;">🎄✨ Giữa những ngày cuối năm se lạnh, Khoa Công nghệ Thông tin xin gửi tới toàn thể thầy cô và các bạn sinh viên lời chúc Giáng sinh an lành, ấm áp và tràn đầy yêu thương. Mong rằng mùa Noel này sẽ mang đến thật nhiều niềm vui, những khoảnh khắc bình yên và nụ cười rạng rỡ bên gia đình, bạn bè.</div></div><div class="x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a" style="white-space: pre-wrap; margin-inline: 0px; overflow-wrap: break-word; margin-bottom: 0px; margin-top: 0.5em;"><div dir="auto" style="font-family: inherit;">🌟 Giáng sinh cũng là dịp để chúng ta nhìn lại hành trình đã qua, trân trọng những nỗ lực, cố gắng và những kỷ niệm đẹp đã cùng nhau tạo nên dưới mái nhà FIT.</div></div><div class="x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a" style="white-space: pre-wrap; margin-inline: 0px; overflow-wrap: break-word; margin-bottom: 0px; margin-top: 0.5em;"><div dir="auto" style="font-family: inherit;">💙 Chúc đại gia đình CNTT luôn giữ vững nhiệt huyết, tiếp tục lan tỏa tinh thần học hỏi, sáng tạo và cùng nhau đón chờ một năm mới với thật nhiều điều tốt đẹp phía trước.</div><div dir="auto" style="font-family: inherit;">---------------------------------------------</div><div dir="auto" style="font-family: inherit;">KHOA CÔNG NGHỆ THÔNG TIN - TRƯỜNG CÔNG NGHỆ (NEU)</div><div dir="auto" style="font-family: inherit;">Email: fit@neu.edu.vn</div></div>', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777119129/lcd/news-post-images/uslebqyt87a8eypxwoez.jpg', 
    3, 1, 7, 1, 1, '2026-04-25 12:12:32', '2026-04-25 12:12:32', '2026-04-25 15:03:54'
),
(
    8, 'CHƯƠNG TRÌNH TẬP HUẤN NỘI BỘ VÀ THIỆN NGUYỆN 2025 - 2026: VƯỢT VŨ', 'chuong-trinh-tap-huan-noi-bo-va-thien-nguyen-2025---2026-vuot-vu', 'Chương trình Tập huấn nội bộ & Thiện nguyện 2025 “Vượt Vũ” là điểm khởi đầu để mỗi cá nhân không ngừng hoàn thiện bản thân, sẵn sàng đảm nhận vai trò dẫn dắt và cống hiến.', 
    '<p>“𝐶ℎ𝑎̆́𝑝 𝑐𝑎́𝑛ℎ 𝑔𝑖𝑢̛̃𝑎 𝑏𝑎̃𝑜 𝑔𝑖𝑜̂𝑛𝑔, 𝑣𝑢̛𝑜̛𝑛 𝑚𝑖̀𝑛ℎ đ𝑒̂́𝑛 𝑏𝑎̂̀𝑢 𝑡𝑟𝑜̛̀𝑖 𝑚𝑜̛́𝑖”<br><br>☘ Bước sang một chặng đường mới, hành trình rèn luyện của các cán bộ Đoàn chính thức bắt đầu. Với ý nghĩa sâu sắc, Chương trình Tập huấn nội bộ & Thiện nguyện 2025 “Vượt Vũ” là điểm khởi đầu để mỗi cá nhân không ngừng hoàn thiện bản thân, sẵn sàng đảm nhận vai trò dẫn dắt và cống hiến.<br><br>🌷 “Vượt Vũ” gợi lên hình ảnh những cánh chim vươn mình giữa bầu trời rộng lớn, sẵn sàng đối mặt với gió ngược và thử thách. Đó là hành trình chắp cánh cho ý chí, tôi rèn bản lĩnh, giúp các cán bộ Đoàn vượt qua giới hạn của chính mình để trưởng thành hơn trong tư duy, kỹ năng và tinh thần trách nhiệm.<br><br>🌱 Hãy cùng Khoa Công nghệ thông tin bước vào hành trình Vượt Vũ – nơi những đôi cánh được chắp lên giữa bão giông.<br>__________________________<br>CHƯƠNG TRÌNH TẬP HUẤN NỘI BỘ 2025 - 2026: " VƯỢT VŨ "<br>⏰ Thời gian: 28/02/2026 – 01/03/2026<br>🗺️ Địa điểm: Trung tâm cứu trợ trẻ em tàn tật TP. Nam Định - 153 Nguyễn Trãi<br>🚨 Hotline: Trưởng Ban Tổ chức - Nông Minh Hải - 0966473314</p>', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777120623/lcd/activity-post-images/qbbkjqnmtu7zoschqo3m.jpg', 
    3, 1, 4, 1, 1, '2026-04-25 12:37:45', '2026-04-25 12:37:45', '2026-04-25 16:39:25'
),
(
    9, 'HEDERA VIETNAM BUILDERS MEETUP', 'Hedera-vn-builders-meetup', 'CLB Công nghệ Thông tin Đại học Kinh tế Quốc dân (NITC) phối hợp cùng Varmeta và Hashgraph hân hạnh được tổ chức workshop Hedera Vietnam Builders Meetup #3', 
    '<p>𝐇𝐄𝐃𝐄𝐑𝐀 𝐕𝐈𝐄𝐓𝐍𝐀𝐌 𝐁𝐔𝐈𝐋𝐃𝐄𝐑𝐒 𝐌𝐄𝐄𝐓𝐔𝐏</p><p>CLB Công nghệ Thông tin Đại học Kinh tế Quốc dân (NITC) phối hợp cùng Varmeta và Hashgraph hân hạnh được tổ chức workshop Hedera Vietnam Builders Meetup #3, nhằm giúp sinh viên tiếp cận sớm Blockchain, Web3 và làm quen với Hedera Network cùng các ứng dụng thực tiễn.<br><br>📅 Thời gian: 14:00 – 16:00, Thứ Bảy, 31/01/2026<br>📍 Địa điểm: MB Digital Hub, Tầng G, Tòa A2, ĐH Kinh tế Quốc dân (NEU)<br>👥 Đối tượng: Sinh viên quan tâm đến Blockchain, Web3 & Phát triển phần mềm<br>⚠️ Số lượng có hạn – đăng ký trước tại Form Online<br><br>💡 Nội dung chính:<br>- Kiến thức nền tảng về Blockchain & Hedera Hashgraph<br>- Giới thiệu Hedera Network, hệ sinh thái và các use case thực tế kết hợp AI & Blockchain<br>- Workshop thực hành: Hướng dẫn từng bước xây dựng ứng dụng (mang theo laptop)<br>- Q&A & Hackathon<br>------------------------------------<br>CLB Công nghệ thông tin Đại học Kinh tế Quốc dân - NITC<br>Email: nitc.neu@gmail.com</p>', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777123507/lcd/news-post-images/nnfji9wfrl7fkrxtxsky.jpg', 
    2, 1, 6, 1, 1, '2026-04-25 13:29:31', '2026-04-25 13:29:31', '2026-04-25 14:36:20'
),
(
    10, 'MỞ ĐƠN ĐĂNG KÝ THAM GIA NGÀY HỘI THỰC TẬP VÀ VIỆC LÀM - NCT Job Fair 2025', 'mo-don-dang-ky-tham-gia-ngay-hoi-thuc-tap-va-viec-lam--', 'Trên cơ sở đó, Trường Công Nghệ - Đại học Kinh tế Quốc dân tổ chức Ngày hội thực tập và việc làm - NCT Job Fair nhằm tăng cường kết nối giữa sinh viên và doanh nghiệp, cung cấp thông tin thị trường lao động và tạo môi trường để sinh viên tham gia các hoạt động trải nghiệm, tư vấn và tuyển dụng thực tế.', 
    '<p>🔗 Link đăng ký: Online Form<br>🕒 Hạn đăng ký: đến hết ngày 26/12/2025<br>⏰ Thời gian tổ chức: 8h00 - 12h00 Thứ Bảy, ngày 27/12/2025<br>🏢 Địa điểm:<br>8h00 - 9h00: Hội trường A2 - Đại học Kinh tế Quốc dân<br>9h00 - 12h00: Sảnh nối A1 - A2<br>❗ Thời gian check-in: 7h30 - 8h00 Thứ Bảy, ngày 27/12/2025<br>✨ Quyền lợi: 3 điểm Đoàn và fill tiêu chí Hội nhập Tốt - SV5T<br>___________________________________<br>TRƯỜNG CÔNG NGHỆ - ĐẠI HỌC KINH TẾ QUỐC DÂN<br>✦ Địa chỉ: Phòng 1210, Tòa A1, Đại học Kinh tế Quốc dân, Hà Nội</p>', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777128029/lcd/news-post-images/zfmcrlxupre7nefbwwqy.jpg', 
    1, 1, 8, 1, 1, '2026-04-25 14:40:37', '2026-04-25 14:40:37', '2026-04-26 15:02:43'
),
(
    11, 'VINH DANH ĐỒNG CHÍ NGUYỄN THỊ THU SV5T CẤP ĐẠI HỌC', 'vinh-danh-dong-chi-nguyen-thi-thu-sv5t-cap-dai-hoc', '', 
    '<p>Đ/c Nguyễn Thị Thu<br>- ĐRL năm học đạt 98/100; Tham gia và lọt vào vòng Bán kết cuộc thi “Học tập và làm theo tư tưởng, đạo đức Hồ Chí Minh” năm 2024 - 2025.<br>- Tác giả chính 02 bài báo được đăng trong Kỷ yếu HTQG.<br>- Tham gia và đạt thành tích tại các giải chạy Eco Marathon 2025.<br>- Tham gia hơn 30 ngày tình nguyện lớn nhỏ.<br>- Nhận Giấy khen của Ban Chấp hành Đoàn Thanh niên Cộng sản Hồ Chí Minh Đại học Kinh tế Quốc dân.<br>- Đạt danh hiệu “Đoàn viên tiêu biểu xuất sắc” cấp Đại học năm học 2024 - 2025.<br>- Lớp trưởng Công nghệ thông tin 66A.<br>- Uỷ viên BCH Liên chi đoàn Khoa Công nghệ thông tin.</p>', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777128392/lcd/achievement-images/zlpsq05alvfjn3hlwjn3.jpg', 
    7, 1, 6, 1, 1, '2026-04-25 14:45:54', '2026-04-25 14:45:54', '2026-04-25 14:59:51'
),
(
    12, 'CHÍNH THỨC CÔNG BỐ ĐỊA ĐIỂM DIỄN RA GIẢI CHẠY FIT RACE 2026: "THANH ÂM SẢI BƯỚC"', 'chinh-thuc-cong-bo-dia-diem-dien-ra-giai-chay-fit-race-2026-thanh-am-sai-buoc', 'Ngay từ khi FIT RACE được hé lộ, BTC đã nhận về sự quan tâm lớn cùng tinh thần sẵn sàng chinh phục thử thách từ các vận động viên. Điều đó đặt ra một câu hỏi: Đâu sẽ là không gian đủ rộng để sức nóng ấy được bùng nổ?', 
    '<p>💥 Ngay từ khi FIT RACE được hé lộ, BTC đã nhận về sự quan tâm lớn cùng tinh thần sẵn sàng chinh phục thử thách từ các vận động viên.<br>🚩 Sau quá trình chuẩn bị và tìm kiếm không gian phù hợp cho những thử thách vận động ngoài trời, BTC đã chính thức lựa chọn Công viên Thống Nhất làm nơi diễn ra đường đua chính thức.<br>📍 Địa điểm: Công viên Thống Nhất - 430 Đ. Lê Duẩn, Phương Liên, Đống Đa, Hà Nội<br>🏁 Đường đua đã sẵn sàng, các thử thách đang chờ được chinh phục. FIT RACE hứa hẹn sẽ mang đến những khoảnh khắc bùng nổ và đầy năng lượng.<br>⚡ Hẹn gặp bạn tại FIT RACE !<br>______________________<br>FIT RACE 2026: "Thanh âm sải bước"<br>🚨 Thông tin liên hệ:<br>▪ Website: https://fit.neu.edu.vn/<br>▪ Hotline: Trưởng Ban Tổ chức - Nguyễn Thị Thu - 0338909486</p>', 
    'https://res.cloudinary.com/dcny8f58b/image/upload/v1777026871/lcd/activity-post-images/qgwbgzuysqzm5hwlkqfy.jpg', 
    6, 1, 0, 1, 1, '2026-04-26 15:08:40', '2026-04-26 15:08:40', '2026-04-26 15:57:02'
);


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




-- ================================================
-- TIMELINE EVENTS
-- ================================================
CREATE TABLE timeline_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type ENUM('annual') NOT NULL DEFAULT 'annual',
    month TINYINT NOT NULL,
    year SMALLINT NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    summary TEXT,
    sort_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_timeline_month CHECK (month BETWEEN 1 AND 12),
    CONSTRAINT chk_timeline_year CHECK (year BETWEEN 2000 AND 2100),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);


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
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(is_published, published_at);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

CREATE INDEX idx_timeline_year_month_published ON timeline_events(year, month, is_published);
CREATE INDEX idx_timeline_year_sort ON timeline_events(year, sort_order, month);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_page_type ON categories(page_type);
CREATE INDEX idx_teams_parent ON teams(parent_id);
CREATE INDEX idx_contact_read ON contact_info(is_read);
CREATE INDEX idx_contact_replied ON contact_info(is_replied);
CREATE INDEX idx_contact_deleted ON contact_info(is_deleted);

USE MyAppDB;
SHOW TABLES;
SELECT COUNT(*) AS total_posts FROM posts;
SELECT COUNT(*) AS total_categories FROM categories;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_user_team_mappings FROM user_teams;