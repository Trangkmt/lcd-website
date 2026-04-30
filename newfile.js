const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  Footer, PageNumber, LevelFormat, VerticalAlign, PageBreak
} = require('docx');
const fs = require('fs');

const TNR = "Times New Roman";
const SZ = 26; // 13pt
const PAGE_MARGINS = { top: 1417, bottom: 1417, left: 1984, right: 1417 };

const STYLES = {
  default: {
    document: {
      run: { font: TNR, size: SZ },
      paragraph: { spacing: { line: 312, lineRule: "auto", after: 120 } }
    }
  },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal",
      run: { font: TNR, size: 36, bold: true, allCaps: true },
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240 }, outlineLevel: 0 }
    },
    {
      id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal",
      run: { font: TNR, size: 26, bold: true },
      paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 1 }
    },
    {
      id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal",
      run: { font: TNR, size: 26, bold: true },
      paragraph: { spacing: { before: 120, after: 60 }, outlineLevel: 2 }
    },
    {
      id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal",
      run: { font: TNR, size: 26, bold: true, italics: true },
      paragraph: { spacing: { before: 100, after: 60 }, outlineLevel: 3 }
    }
  ]
};

const footer = new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new PageNumber()]
  })]
});

// Helper functions
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: TNR, size: 36, bold: true, allCaps: true })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: TNR, size: SZ, bold: true })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, font: TNR, size: SZ, bold: true })] });
}
function h4(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_4, children: [new TextRun({ text, font: TNR, size: SZ, bold: true, italics: true })] });
}
function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 709 },
    children: [new TextRun({ text, font: TNR, size: SZ })]
  });
}
function bodyNoIndent(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: TNR, size: SZ })]
  });
}
function bold(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 709 },
    children: [new TextRun({ text, font: TNR, size: SZ, bold: true })]
  });
}
function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: TNR, size: SZ, bold: true })]
  });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}
function emptyLine() {
  return new Paragraph({ children: [new TextRun({ text: "", font: TNR, size: SZ })] });
}

// Code block style
function codeBlock(lines) {
  return lines.map(line => new Paragraph({
    alignment: AlignmentType.LEFT,
    indent: { left: 720 },
    children: [new TextRun({ text: line, font: "Courier New", size: 20 })]
  }));
}

// Table helpers
const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };

function makeCell(text, isHeader = false, width = 1800) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: isHeader ? { fill: "D0E4F7", type: ShadingType.CLEAR } : { fill: "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, font: TNR, size: 22, bold: isHeader })]
    })]
  });
}

function makeTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h, i) => makeCell(h, true, colWidths[i])) }),
      ...rows.map(row => new TableRow({ children: row.map((c, i) => makeCell(c, false, colWidths[i])) }))
    ]
  });
}

// UML PlantUML / Mermaid code block with label
function umlBlock(title, code, figNum) {
  const result = [
    emptyLine(),
    caption(`Hình ${figNum}: ${title}`),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "(Biểu đồ Mermaid/PlantUML — render bằng công cụ hỗ trợ UML)", font: TNR, size: 22, italics: true, color: "666666" })]
    }),
    emptyLine(),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { left: 360 },
      children: [new TextRun({ text: "```", font: "Courier New", size: 20, color: "222222" })]
    }),
    ...codeBlock(code.split('\n')),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { left: 360 },
      children: [new TextRun({ text: "```", font: "Courier New", size: 20, color: "222222" })]
    }),
    emptyLine()
  ];
  return result;
}

// ========== CONTENT ARRAYS ==========

// --------- COVER PAGE ---------
function coverPage() {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "ĐẠI HỌC KINH TẾ QUỐC DÂN", font: TNR, size: 28, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "TRƯỜNG CÔNG NGHỆ", font: TNR, size: 28, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "KHÓA LUẬN TỐT NGHIỆP", font: TNR, size: 40, bold: true, allCaps: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Tên đề tài:", font: TNR, size: 28, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "XÂY DỰNG WEBSITE LIÊN CHI ĐOÀN KHOA", font: TNR, size: 32, bold: true, allCaps: true })] }),
    new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 400, after: 120 }, indent: { left: 2000 }, children: [new TextRun({ text: "Tên sinh viên\t: Nguyễn Văn A", font: TNR, size: SZ })] }),
    new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 120 }, indent: { left: 2000 }, children: [new TextRun({ text: "Mã sinh viên\t: 111.....", font: TNR, size: SZ })] }),
    new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 120 }, indent: { left: 2000 }, children: [new TextRun({ text: "Lớp\t\t\t: Khoa học máy tính K64", font: TNR, size: SZ })] }),
    new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 120 }, indent: { left: 2000 }, children: [new TextRun({ text: "Ngành\t\t: Khoa học máy tính", font: TNR, size: SZ })] }),
    new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 120 }, indent: { left: 2000 }, children: [new TextRun({ text: "Khoa\t\t\t: Công nghệ thông tin", font: TNR, size: SZ })] }),
    new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 400 }, indent: { left: 2000 }, children: [new TextRun({ text: "Giảng viên hướng dẫn\t: Nguyễn Văn A", font: TNR, size: SZ })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600 }, children: [new TextRun({ text: "Hà Nội, 5/2025", font: TNR, size: SZ, bold: true })] }),
    pageBreak()
  ];
}

// --------- LOI CAM DOAN ---------
function loiCamDoan() {
  return [
    h1("LỜI CAM ĐOAN"),
    emptyLine(),
    body("Tôi xin cam đoan đây là công trình nghiên cứu của riêng tôi dưới sự hướng dẫn của giảng viên hướng dẫn. Các số liệu và kết quả trong khóa luận là trung thực và chưa được công bố trong bất kỳ công trình nào khác."),
    emptyLine(),
    new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 400 }, children: [new TextRun({ text: "Hà nội, ngày       tháng       năm 2025", font: TNR, size: SZ })] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 400 }, children: [new TextRun({ text: "Sinh viên", font: TNR, size: SZ, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "(ký, ghi rõ họ tên)", font: TNR, size: SZ, italics: true })] }),
    pageBreak()
  ];
}

// --------- LOI CAM ON ---------
function loiCamOn() {
  return [
    h1("LỜI CẢM ƠN"),
    emptyLine(),
    body("Trước tiên, tôi xin gửi lời cảm ơn chân thành và sâu sắc đến giảng viên hướng dẫn đã tận tâm hướng dẫn, góp ý và động viên tôi trong suốt quá trình thực hiện khóa luận tốt nghiệp này."),
    body("Tôi cũng xin trân trọng cảm ơn Ban lãnh đạo Trường Công nghệ – Đại học Kinh tế Quốc dân, các thầy cô giáo trong Khoa Công nghệ Thông tin đã truyền đạt kiến thức và tạo điều kiện thuận lợi cho tôi trong suốt bốn năm học tập tại trường."),
    body("Xin cảm ơn Ban Chấp hành Liên Chi đoàn Khoa CNTT đã hỗ trợ thu thập dữ liệu khảo sát và cung cấp thông tin nghiệp vụ thực tế phục vụ cho quá trình phân tích và thiết kế hệ thống."),
    body("Cuối cùng, tôi xin gửi lời cảm ơn đến gia đình và bạn bè đã luôn ủng hộ, động viên tôi trong suốt quá trình học tập và nghiên cứu."),
    pageBreak()
  ];
}

// --------- TU VIET TAT ---------
function danhMucTuVietTat() {
  return [
    h1("DANH MỤC CÁC TỪ VIẾT TẮT"),
    emptyLine(),
    makeTable(
      ["Từ viết tắt", "Ý nghĩa"],
      [
        ["API", "Giao diện lập trình ứng dụng (Application Programming Interface)"],
        ["CNTT", "Công nghệ thông tin"],
        ["CRUD", "Tạo, Đọc, Cập nhật, Xóa (Create, Read, Update, Delete)"],
        ["CDN", "Mạng phân phối nội dung (Content Delivery Network)"],
        ["ERD", "Sơ đồ thực thể quan hệ (Entity Relationship Diagram)"],
        ["GVHD", "Giảng viên hướng dẫn"],
        ["HTTP", "Giao thức truyền tải siêu văn bản (Hypertext Transfer Protocol)"],
        ["JWT", "JSON Web Token"],
        ["LLM", "Mô hình ngôn ngữ lớn (Large Language Model)"],
        ["MVC", "Model – View – Controller"],
        ["RDBMS", "Hệ quản trị cơ sở dữ liệu quan hệ (Relational Database Management System)"],
        ["REST", "Kiến trúc truyền tải trạng thái đại diện (Representational State Transfer)"],
        ["RBAC", "Kiểm soát truy cập dựa trên vai trò (Role-Based Access Control)"],
        ["SV", "Sinh viên"],
        ["UML", "Ngôn ngữ mô hình hóa thống nhất (Unified Modeling Language)"],
        ["UX", "Trải nghiệm người dùng (User Experience)"],
        ["UI", "Giao diện người dùng (User Interface)"],
        ["EUD", "Phát triển ứng dụng người dùng cuối (End-User Development)"],
      ],
      [2200, 6000]
    ),
    pageBreak()
  ];
}

// --------- MO DAU ---------
function moDau() {
  return [
    h1("MỞ ĐẦU"),
    emptyLine(),
    body("Trong bối cảnh chuyển đổi số đang diễn ra mạnh mẽ trong môi trường giáo dục đại học, các tổ chức Đoàn – Hội không chỉ cần triển khai tốt các hoạt động phong trào mà còn cần một hệ thống truyền thông chính thức để kết nối với sinh viên. Website của Liên Chi đoàn được xây dựng nhằm mục tiêu số hóa thông tin, tập trung dữ liệu hoạt động và tạo ra một kênh giao tiếp minh bạch, chuyên nghiệp giữa tổ chức và sinh viên."),
    body("Đề tài khóa luận \"Xây dựng website Liên Chi đoàn Khoa\" được thực hiện nhằm giải quyết bài toán thực tiễn cấp bách: thông tin hoạt động Liên Chi đoàn Khoa Công nghệ Thông tin, Đại học Kinh tế Quốc dân hiện đang bị phân tán trên nhiều nền tảng mạng xã hội khác nhau, gây khó khăn cho cả sinh viên lẫn cán bộ trong việc tra cứu và quản lý thông tin."),
    body("Khóa luận được trình bày theo bốn chương: Chương 1 trình bày tổng quan về đề tài và xác định yêu cầu hệ thống; Chương 2 giới thiệu các công nghệ được sử dụng; Chương 3 trình bày quá trình phân tích và thiết kế hệ thống; Chương 4 mô tả quá trình xây dựng, kết quả đạt được và đánh giá hệ thống."),
    pageBreak()
  ];
}

// --------- CHUONG 1 ---------
function chuong1() {
  return [
    h1("CHƯƠNG 1. TỔNG QUAN VỀ ĐỀ TÀI"),
    emptyLine(),
    h2("1.1. Tổng quan về đề tài nghiên cứu"),
    body("Liên Chi đoàn Khoa Công nghệ Thông tin, Đại học Kinh tế Quốc dân tổ chức nhiều hoạt động học thuật và phong trào dành cho sinh viên. Tuy nhiên, các thông tin hiện nay thường được phân tán trên nhiều nền tảng khác nhau như mạng xã hội, bài đăng rời rạc hoặc tài liệu nội bộ. Điều này khiến việc tra cứu thông tin trở nên khó khăn, đặc biệt đối với sinh viên mới."),
    body("Website được xây dựng nhằm tập trung hóa toàn bộ thông tin của Liên Chi đoàn. Hệ thống giúp quản lý tin tức, hoạt động, thành tích, cơ cấu tổ chức và các thông tin liên hệ một cách rõ ràng. Đây là bước quan trọng trong quá trình chuyển đổi số hoạt động của tổ chức."),
    h3("1.1.1. Vấn đề và nhu cầu tại Kinh tế Quốc dân"),
    h4("1.1.1.1. Thực trạng tìm kiếm thông tin của Liên Chi đoàn Khoa"),
    body("Liên Chi đoàn Khoa Công nghệ Thông tin, Đại học Kinh tế Quốc dân hiện đang hoạt động tích cực với nhiều chương trình học thuật, phong trào văn hóa – thể thao và các sự kiện kết nối sinh viên trong suốt năm học. Tuy nhiên, một trong những thách thức lớn nhất mà tổ chức đang đối mặt chính là sự phân tán thông tin trên nhiều kênh truyền thông khác nhau."),
    body("Hiện tại, thông tin hoạt động của Liên Chi đoàn chủ yếu được phổ biến qua các nhóm Facebook, trang Zalo và các tài liệu nội bộ. Mỗi kênh hoạt động độc lập, không có sự liên kết thống nhất, dẫn đến tình trạng thông tin bị phân tán, dễ thất lạc và khó tra cứu khi cần thiết. Đặc biệt, trên các nền tảng mạng xã hội, bài đăng liên tục bị đẩy xuống theo dòng thời gian, khiến các thông báo quan trọng nhanh chóng bị chìm khuất sau một thời gian ngắn."),
    body("Về phía cán bộ Đoàn, công tác truyền thông nội dung hiện nay đòi hỏi phải đăng tải thủ công trên nhiều kênh, tốn nhiều thời gian và công sức mà hiệu quả tiếp cận vẫn chưa được đảm bảo. Tình trạng trên đặt ra yêu cầu cấp thiết phải xây dựng một nền tảng số hóa tập trung, có khả năng tổng hợp toàn bộ thông tin của Liên Chi đoàn vào một hệ thống duy nhất, dễ truy cập và dễ quản lý."),
    h4("1.1.1.2. Khảo sát đánh giá của sinh viên"),
    body("Để có cơ sở thực tiễn vững chắc cho việc xây dựng hệ thống, nhóm nghiên cứu đã tiến hành khảo sát nhu cầu sử dụng website Liên Chi đoàn với tổng số 23 phiếu phản hồi hợp lệ. Đối tượng tham gia khảo sát bao gồm cả cán bộ Đoàn/Hội và sinh viên nhằm thu thập ý kiến đa chiều."),
    emptyLine(),
    caption("Bảng 1.1: Kết quả khảo sát nhu cầu sử dụng website Liên Chi đoàn"),
    makeTable(
      ["Chỉ tiêu khảo sát", "Kết quả"],
      [
        ["Tổng số phiếu hợp lệ", "23 phiếu"],
        ["Cán bộ Đoàn/Hội", "12 người (52,2%)"],
        ["Sinh viên", "11 người (47,8%)"],
        ["Điểm TB mức độ cần thiết của website", "4,04/5"],
        ["Tỷ lệ chắc chắn/có thể sẽ dùng", "Hơn 95%"],
        ["Chức năng ưu tiên nhất: Lịch hoạt động/Timeline", "4,48/5"],
        ["Chức năng ưu tiên 2: Tìm kiếm thông tin", "4,35/5"],
        ["Gặp khó khăn khi tìm lại thông báo cũ", "100% có gặp"],
      ],
      [4000, 4200]
    ),
    emptyLine(),
    body("Kết quả khảo sát cho thấy nhu cầu xây dựng website là cấp thiết với tỷ lệ đồng thuận rất cao. 100% đối tượng khảo sát thừa nhận gặp khó khăn ở các mức độ khác nhau khi tìm lại thông báo cũ trên các kênh truyền thông hiện tại."),
    h4("1.1.1.3. Kết luận"),
    body("Qua quá trình phân tích thực trạng và dữ liệu khảo sát, có thể rút ra các kết luận sau: Thứ nhất, việc xây dựng website là yêu cầu khách quan và cấp bách nhằm khắc phục tình trạng thông tin phân tán. Thứ hai, cả cán bộ và sinh viên đều thể hiện sự ủng hộ mạnh mẽ với tỷ lệ có nhu cầu sử dụng hơn 95%. Thứ ba, website cần tập trung vào khả năng tra cứu thông tin và quản lý lịch trình hoạt động. Thứ tư, với tần suất sử dụng dự kiến cao, website hứa hẹn sẽ trở thành kênh thông tin chủ chốt của tổ chức."),
    h2("1.2. Mục tiêu của đề tài nghiên cứu"),
    body("Mục tiêu chính của đề tài là nghiên cứu và xây dựng một hệ thống website phục vụ truyền thông và quản lý hoạt động của Liên Chi đoàn Khoa Công nghệ Thông tin, Đại học Kinh tế Quốc dân. Hệ thống phải đảm bảo các tiêu chí: dễ sử dụng, dễ quản trị, có khả năng mở rộng và phù hợp với môi trường sinh viên."),
    body("Các mục tiêu cụ thể bao gồm: (1) Xây dựng website công khai dành cho người dùng với giao diện thân thiện; (2) Xây dựng hệ thống quản trị nội dung cho cán bộ; (3) Triển khai hệ thống phân quyền linh hoạt theo vai trò (RBAC); (4) Tích hợp hỗ trợ biên tập nội dung bằng Gemini AI; (5) Đảm bảo kiến trúc hệ thống rõ ràng, có khả năng mở rộng theo mô hình REST API."),
    h2("1.3. Các yêu cầu của hệ thống"),
    h3("1.3.1. Yêu cầu chức năng"),
    body("Dựa trên kết quả phân tích thực trạng, khảo sát nhu cầu người dùng và quá trình làm rõ yêu cầu nghiệp vụ, hệ thống cần đáp ứng các yêu cầu chức năng sau:"),
    body("Đăng nhập và phân quyền quản trị; Quản lý bài viết và nội dung truyền thông; Hỗ trợ biên tập nội dung tự động bằng AI; Quản lý danh mục và cấu trúc nội dung; Quản lý thành viên và tài khoản hệ thống; Quản lý liên hệ từ người dùng; Quản lý timeline sự kiện; Quản lý cơ cấu tổ chức; Tiếp nhận và hiển thị thông tin công khai; Quản lý ảnh và tài nguyên đa phương tiện; Tiện ích xuất dữ liệu phục vụ vận hành."),
    h3("1.3.2. Yêu cầu phi chức năng"),
    body("Bên cạnh các yêu cầu chức năng, hệ thống cần thỏa mãn các yêu cầu phi chức năng: Hiệu năng (thời gian phản hồi tốt, ổn định khi nhiều người dùng đồng thời); Tính sẵn sàng và độ tin cậy; Bảo mật và kiểm soát truy cập (JWT, RBAC); Toàn vẹn và nhất quán dữ liệu; Khả năng mở rộng; Khả năng bảo trì (mã nguồn tổ chức theo lớp); Trải nghiệm người dùng tốt; Thiết kế giao diện đáp ứng (Responsive Design); Tính tương thích với các trình duyệt phổ biến."),
    emptyLine(),
    new Paragraph({ children: [new TextRun({ text: "Tóm tắt Chương 1: ", font: TNR, size: SZ, bold: true }), new TextRun({ text: "Chương 1 đã trình bày bối cảnh, thực trạng và nhu cầu thực tiễn thúc đẩy việc xây dựng website Liên Chi đoàn. Kết quả khảo sát 23 người dùng xác nhận tính cấp thiết với tỷ lệ đồng thuận hơn 95%. Các mục tiêu và yêu cầu hệ thống được xác định cụ thể, tạo nền tảng vững chắc cho các chương tiếp theo.", font: TNR, size: SZ, italics: true })] }),
    pageBreak()
  ];
}

// --------- CHUONG 2 ---------
function chuong2() {
  return [
    h1("CHƯƠNG 2. CÁC CÔNG NGHỆ SỬ DỤNG"),
    emptyLine(),
    body("Hệ thống website Liên Chi đoàn được xây dựng dựa trên một bộ công nghệ web hiện đại, được lựa chọn cẩn thận dựa trên tiêu chí hiệu năng, tính phổ biến trong cộng đồng phát triển, khả năng mở rộng và sự phù hợp với mô hình kiến trúc tách biệt frontend – backend."),
    emptyLine(),
    caption("Bảng 2.1: Tổng quan các công nghệ sử dụng trong hệ thống"),
    makeTable(
      ["Công nghệ", "Vai trò", "Phiên bản"],
      [
        ["ReactJS", "Frontend – Giao diện người dùng", "18.x"],
        ["Node.js", "Backend – Runtime máy chủ", "18.x LTS"],
        ["Express.js", "Backend – Framework API", "4.x"],
        ["MySQL", "Cơ sở dữ liệu quan hệ", "8.x"],
        ["Vite", "Build tool – Công cụ phát triển frontend", "5.x"],
        ["Cloudinary", "Dịch vụ lưu trữ và phân phối ảnh", "Cloud API"],
        ["Gemini AI", "Mô hình ngôn ngữ lớn hỗ trợ biên tập", "Google AI API"],
      ],
      [2200, 3800, 2200]
    ),
    emptyLine(),
    h2("2.1. ReactJS"),
    body("React.js là thư viện JavaScript mã nguồn mở được Facebook (nay là Meta) phát triển và công bố lần đầu vào năm 2013. Triết lý thiết kế cốt lõi của React là xây dựng giao diện theo mô hình component. Mỗi component là một đơn vị giao diện độc lập, có trạng thái riêng và có thể được tái sử dụng ở nhiều vị trí khác nhau trong ứng dụng. React sử dụng cơ chế Virtual DOM để tối ưu hóa hiệu năng render."),
    body("Trong dự án này, React được lựa chọn làm nền tảng xây dựng toàn bộ giao diện người dùng, bao gồm cả website công khai dành cho sinh viên lẫn khu vực quản trị dành cho cán bộ Liên Chi đoàn. Ưu điểm: tái sử dụng component cao, cộng đồng đông đảo, dễ mở rộng. Nhược điểm: đòi hỏi nắm vững tư duy component và quản lý trạng thái."),
    h2("2.2. Node.js"),
    body("Node.js là môi trường chạy JavaScript phía máy chủ, sử dụng mô hình I/O bất đồng bộ (asynchronous non-blocking I/O). Ưu điểm đặc biệt là cho phép sử dụng chung JavaScript cho cả frontend (React) và backend (Node.js), giảm chi phí học tập và chuyển đổi ngữ cảnh. Trong hệ thống, Node.js đảm nhiệm vai trò vận hành toàn bộ backend: tiếp nhận HTTP request, xử lý nghiệp vụ, truy vấn MySQL và kết nối Cloudinary, Gemini AI."),
    h2("2.3. Express.js"),
    body("Express.js là framework backend tối giản và linh hoạt chạy trên Node.js, cung cấp lớp trừu tượng mỏng trên HTTP module giúp định nghĩa routes và middleware đơn giản, trực quan. Cốt lõi của Express là mô hình pipeline middleware: mỗi request HTTP đi qua chuỗi middleware trước khi đến route handler. Trong hệ thống, Express.js tổ chức backend theo mô hình MVC với ba lớp: router, controller và middleware."),
    h2("2.4. Vite"),
    body("Vite là build tool frontend thế hệ mới do Evan You giới thiệu năm 2020. Thay vì đóng gói toàn bộ mã nguồn trước khi phục vụ, Vite tận dụng khả năng nạp module ES gốc của trình duyệt, cho phép thời gian khởi động gần như tức thì. Kết hợp Hot Module Replacement (HMR) cực nhanh, Vite đóng vai trò môi trường phát triển và build tool cho cả hai dự án React."),
    h2("2.5. MySQL"),
    body("MySQL là hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mã nguồn mở phổ biến nhất thế giới. MySQL được chọn vì cấu trúc dữ liệu nghiệp vụ của hệ thống có tính quan hệ rõ ràng: người dùng tạo bài viết, bài viết thuộc danh mục, danh mục có cấu trúc cha – con. Kết nối sử dụng thư viện mysql2 với pool connection để quản lý hiệu quả."),
    h2("2.6. Cloudinary"),
    body("Cloudinary là nền tảng quản lý tài nguyên đa phương tiện trên đám mây, cung cấp lưu trữ, xử lý và phân phối ảnh qua CDN toàn cầu. Trong hệ thống, Cloudinary đảm nhiệm toàn bộ vòng đời quản lý ảnh: khi cán bộ tải lên ảnh, frontend gửi file đến Cloudinary, nhận URL cố định và lưu vào MySQL. Cách tiếp cận này giảm tải máy chủ và tối ưu phân phối ảnh."),
    h2("2.7. Gemini AI"),
    body("Gemini là mô hình ngôn ngữ lớn (LLM) do Google DeepMind phát triển, hỗ trợ đa ngôn ngữ trong đó có tiếng Việt. Trong hệ thống, Gemini AI được tích hợp để hỗ trợ biên tập nội dung: cán bộ nhập từ khóa, backend gọi Gemini API với prompt phù hợp và trả về bản nháp nội dung để cán bộ chỉnh sửa trước khi xuất bản."),
    emptyLine(),
    new Paragraph({ children: [new TextRun({ text: "Tóm tắt Chương 2: ", font: TNR, size: SZ, bold: true }), new TextRun({ text: "Chương 2 đã giới thiệu bộ công nghệ được lựa chọn cho hệ thống gồm ReactJS, Node.js, Express.js, Vite, MySQL, Cloudinary và Gemini AI. Mỗi công nghệ được phân tích vai trò, ưu nhược điểm và lý do lựa chọn phù hợp với đặc thù dự án, tạo nền tảng kỹ thuật vững chắc cho giai đoạn phân tích và thiết kế.", font: TNR, size: SZ, italics: true })] }),
    pageBreak()
  ];
}

// --------- CHUONG 3 ---------
function chuong3() {
  const useCaseDiagram = `@startuml
!theme plain
left to right direction
skinparam actorStyle awesome

actor "Người dùng công khai" as User
actor "Biên tập viên (Editor)" as Editor
actor "Quản trị viên (Admin)" as Admin
actor "Quản lý liên hệ" as ContactMgr
actor "Người dùng tiện ích" as Utility

rectangle "Website Công Khai" {
  usecase "Xem trang chủ" as UC_Home
  usecase "Xem tin tức / hoạt động" as UC_News
  usecase "Xem chi tiết bài viết" as UC_Detail
  usecase "Xem cơ cấu tổ chức" as UC_Org
  usecase "Xem timeline sự kiện" as UC_Timeline
  usecase "Gửi liên hệ" as UC_Contact
}

rectangle "Hệ thống Quản trị" {
  usecase "Đăng nhập / Đăng xuất" as UC_Login
  usecase "Quản lý bài viết" as UC_Manage_News
  usecase "Hỗ trợ AI biên tập" as UC_AI
  usecase "Quản lý danh mục" as UC_Category
  usecase "Quản lý thành viên" as UC_Members
  usecase "Phân quyền vai trò" as UC_Role
  usecase "Quản lý liên hệ" as UC_ContactMgr
  usecase "Quản lý timeline" as UC_TimelineMgr
  usecase "Tạo giấy mời/chứng chỉ" as UC_Cert
}

User --> UC_Home
User --> UC_News
User --> UC_Detail
User --> UC_Org
User --> UC_Timeline
User --> UC_Contact

Editor --> UC_Login
Editor --> UC_Manage_News
Editor --> UC_AI
Editor --> UC_Category

Admin --> UC_Login
Admin --> UC_Manage_News
Admin --> UC_AI
Admin --> UC_Category
Admin --> UC_Members
Admin --> UC_Role
Admin --> UC_TimelineMgr

ContactMgr --> UC_Login
ContactMgr --> UC_ContactMgr

Utility --> UC_Login
Utility --> UC_Cert

Editor --|> User
Admin --|> Editor
@enduml`;

  const activityLogin = `@startuml
!theme plain
title Biểu đồ hoạt động: Đăng nhập và Phân quyền

start
:Người dùng truy cập trang quản trị;
:Hiển thị form đăng nhập;
:Nhập username và password;
:Gửi thông tin đến backend (/api/auth/login);

if (Thông tin hợp lệ?) then (Có)
  :Tạo JWT token chứa thông tin vai trò;
  :Lưu token vào bộ nhớ phiên;
  if (Vai trò là Admin?) then (Có)
    :Chuyển đến Dashboard toàn quyền;
  else (Không)
    if (Vai trò là Editor?) then (Có)
      :Chuyển đến Dashboard biên tập;
    else (Không)
      if (Vai trò là ContactMgr?) then (Có)
        :Chuyển đến trang Quản lý liên hệ;
      else (Không)
        :Chuyển đến trang Tiện ích;
      endif
    endif
  endif
  :Hiển thị menu theo đúng quyền;
else (Không)
  :Hiển thị thông báo lỗi đăng nhập;
  :Cho phép thử lại;
endif
stop
@enduml`;

  const activityCreatePost = `@startuml
!theme plain
title Biểu đồ hoạt động: Tạo và Xuất bản Bài viết

start
:Biên tập viên chọn "Tạo bài viết mới";
:Hiển thị form tạo bài viết;

fork
  :Nhập tiêu đề và tóm tắt;
fork again
  :Chọn danh mục;
fork again
  :Tải ảnh đại diện lên Cloudinary;
  :Nhận URL ảnh;
end fork

if (Dùng hỗ trợ AI?) then (Có)
  :Nhập từ khóa/chủ đề;
  :Gọi Gemini API;
  :Nhận gợi ý nội dung;
  :Chỉnh sửa nội dung gợi ý;
else (Không)
  :Nhập nội dung thủ công;
endif

:Chọn trạng thái (Nháp hoặc Chờ duyệt);
:Nhấn Lưu;
:Backend kiểm tra quyền và dữ liệu;

if (Dữ liệu hợp lệ?) then (Có)
  :Lưu bài viết vào MySQL;
  :Hiển thị thông báo thành công;
  if (Admin muốn xuất bản?) then (Có)
    :Đổi trạng thái → Đã xuất bản;
    :Bài hiển thị trên website công khai;
  else (Không)
    :Bài lưu dạng nháp;
  endif
else (Không)
  :Hiển thị thông báo lỗi;
  :Giữ nguyên dữ liệu form;
endif
stop
@enduml`;

  const activityUserView = `@startuml
!theme plain
title Biểu đồ hoạt động: Người dùng xem và lọc nội dung

start
:Người dùng truy cập website;
:Tải trang chủ (gọi API lấy dữ liệu nổi bật);

if (Tải dữ liệu thành công?) then (Có)
  :Hiển thị tin tức, hoạt động, thành tích nổi bật;
else (Không)
  :Hiển thị thông báo lỗi thân thiện;
endif

:Người dùng chọn mục nội dung (Tin tức/Hoạt động/Thành tích);
:Tải danh sách bài viết theo danh mục;

if (Muốn lọc?) then (Có)
  :Chọn bộ lọc (danh mục / từ khóa);
  :Gửi request lọc đến API;
  :Cập nhật danh sách kết quả;
else (Không)
endif

:Chọn một bài viết;
:Gọi API lấy chi tiết bài viết;
:Backend tăng bộ đếm lượt xem;

if (Bài tồn tại và đã xuất bản?) then (Có)
  :Hiển thị nội dung đầy đủ;
else (Không)
  :Hiển thị trang lỗi 404 thân thiện;
endif
stop
@enduml`;

  const activityContact = `@startuml
!theme plain
title Biểu đồ hoạt động: Gửi và Xử lý Liên hệ

start
fork
  partition "Người dùng công khai" {
    :Điền form liên hệ (họ tên, email, nội dung);
    :Kiểm tra hợp lệ phía frontend;
    if (Hợp lệ?) then (Có)
      :Gửi POST /api/contacts;
      :Hiển thị thông báo "Đã gửi thành công";
    else (Không)
      :Hiển thị lỗi validation;
      :Giữ nguyên dữ liệu form;
    endif
  }
fork again
  partition "Cán bộ quản lý liên hệ" {
    :Đăng nhập với role ContactMgr;
    :Xem danh sách liên hệ (lọc theo trạng thái);
    :Mở chi tiết liên hệ;
    :Hệ thống tự đánh dấu "Đã đọc";
    :Xử lý / phản hồi qua email;
    :Đánh dấu "Đã phản hồi";
    if (Cần xóa?) then (Có)
      :Xác nhận xóa;
      :Xóa bản ghi khỏi hệ thống;
    else (Không)
    endif
  }
end fork
stop
@enduml`;

  const activityCert = `@startuml
!theme plain
title Biểu đồ hoạt động: Tạo giấy mời/chứng chỉ hàng loạt

start
:Cán bộ truy cập trang Tiện ích;
:Tải lên file ảnh mẫu nền (template);
:Cấu hình font, màu, vị trí chữ;
:Xem trước kết quả trên mẫu;
:Tải lên file Excel danh sách tên;
:Hệ thống đọc và parse danh sách;

if (File hợp lệ?) then (Có)
  :Lặp qua từng tên trong danh sách;
  :Render tên lên ảnh template;
  :Lưu file ảnh cá nhân;
  :Gộp tất cả vào file ZIP;
  :Cung cấp đường dẫn tải về;
else (Không)
  :Hiển thị thông báo lỗi định dạng;
  :Yêu cầu tải lại file đúng;
endif
stop
@enduml`;

  const classERD = `erDiagram
    USERS {
        int id PK
        varchar username
        varchar email
        varchar password_hash
        enum role
        boolean is_active
        timestamp created_at
    }
    CATEGORIES {
        int id PK
        varchar name
        varchar slug
        int parent_id FK
        varchar page_type
        int display_order
    }
    NEWS {
        int id PK
        varchar title
        varchar slug
        text summary
        longtext content
        varchar thumbnail_url
        enum status
        int category_id FK
        int author_id FK
        int view_count
        timestamp published_at
        timestamp created_at
    }
    ACTIVITIES {
        int id PK
        varchar title
        varchar slug
        text description
        varchar location
        datetime event_date
        enum status
        int category_id FK
        int author_id FK
    }
    ORGANIZATIONS {
        int id PK
        varchar name
        text description
        int parent_id FK
        int display_order
        boolean is_active
    }
    TIMELINE_EVENTS {
        int id PK
        varchar title
        text description
        int month
        int year
        boolean is_visible
        timestamp created_at
    }
    CONTACT_MESSAGES {
        int id PK
        varchar full_name
        varchar email
        varchar subject
        text message
        boolean is_read
        boolean is_replied
        timestamp created_at
    }
    POST_TEMPLATES {
        int id PK
        varchar name
        int category_id FK
        text content_template
    }

    USERS ||--o{ NEWS : "tạo"
    USERS ||--o{ ACTIVITIES : "tạo"
    CATEGORIES ||--o{ NEWS : "phân loại"
    CATEGORIES ||--o{ ACTIVITIES : "phân loại"
    CATEGORIES ||--o{ POST_TEMPLATES : "áp dụng"
    CATEGORIES }o--o| CATEGORIES : "cha-con"
    ORGANIZATIONS }o--o| ORGANIZATIONS : "phân cấp"`;

  const classDiagram = `@startuml
!theme plain
skinparam classAttributeIconSize 0
title Biểu đồ lớp hệ thống Website Liên Chi đoàn

class User {
  -int id
  -String username
  -String email
  -String passwordHash
  -Role role
  -boolean isActive
  -Date createdAt
  +login(username, password): Token
  +logout(): void
  +updateProfile(data): User
}

class Category {
  -int id
  -String name
  -String slug
  -Category parent
  -String pageType
  -int displayOrder
  +getChildren(): List~Category~
  +getFullPath(): String
}

class Article {
  -int id
  -String title
  -String slug
  -String summary
  -String content
  -String thumbnailUrl
  -Status status
  -User author
  -Category category
  -int viewCount
  -Date publishedAt
  +publish(): void
  +hide(): void
  +incrementView(): void
}

class ContactMessage {
  -int id
  -String fullName
  -String email
  -String subject
  -String message
  -boolean isRead
  -boolean isReplied
  -Date createdAt
  +markRead(): void
  +markReplied(): void
}

class TimelineEvent {
  -int id
  -String title
  -String description
  -int month
  -int year
  -boolean isVisible
  +toggleVisibility(): void
}

class Organization {
  -int id
  -String name
  -String description
  -Organization parent
  -int displayOrder
  +getChildUnits(): List~Organization~
}

class AIService {
  +generateContent(keywords: String): String
  +buildPrompt(topic: String): String
}

class MediaService {
  +uploadImage(file: File): String
  +deleteImage(publicId: String): void
}

enum Role {
  ADMIN
  EDITOR
  CONTACT_MANAGER
  UTILITY_USER
}

enum Status {
  DRAFT
  PUBLISHED
  HIDDEN
}

User "1" --> "many" Article : tạo
User --> Role : có vai trò
Article --> Status : trạng thái
Article "many" --> "1" Category : thuộc về
Category "0..1" --> "many" Category : cha-con
Organization "0..1" --> "many" Organization : phân cấp
Article --> AIService : sử dụng hỗ trợ
Article --> MediaService : lưu ảnh
@enduml`;

  const seqLogin = `@startuml
!theme plain
title Biểu đồ tuần tự: Đăng nhập và Phân quyền

actor "Cán bộ" as Actor
participant "Frontend\n(React)" as FE
participant "Backend\n(Express)" as BE
participant "Middleware\nJWT" as MW
database "MySQL" as DB

Actor -> FE: Nhập username, password
FE -> BE: POST /api/auth/login\n{username, password}
BE -> DB: SELECT user WHERE username = ?
DB --> BE: User record (hashed password, role)
BE -> BE: Verify bcrypt(password, hash)
alt Xác thực thành công
  BE -> BE: Tạo JWT token (payload: {id, role, exp})
  BE --> FE: 200 OK {token, user: {id, role, name}}
  FE -> FE: Lưu token vào sessionStorage
  FE --> Actor: Chuyển hướng đến Dashboard\n(theo vai trò)
else Xác thực thất bại
  BE --> FE: 401 Unauthorized
  FE --> Actor: Hiển thị thông báo lỗi
end
@enduml`;

  const seqCreatePost = `@startuml
!theme plain
title Biểu đồ tuần tự: Tạo và Xuất bản Bài viết

actor "Biên tập viên" as Editor
actor "Quản trị viên" as Admin
participant "Frontend" as FE
participant "Backend" as BE
participant "Middleware JWT" as MW
database "MySQL" as DB
participant "Gemini AI" as AI
participant "Cloudinary" as CDN

Editor -> FE: Mở form tạo bài viết
Editor -> FE: Tải lên ảnh đại diện
FE -> CDN: Upload file ảnh
CDN --> FE: URL ảnh cố định

opt Yêu cầu gợi ý AI
  Editor -> FE: Nhập từ khóa, nhấn "Gợi ý AI"
  FE -> BE: POST /api/ai/generate {keywords}
  BE -> MW: Kiểm tra JWT token
  MW --> BE: Token hợp lệ
  BE -> AI: Gọi Gemini API với prompt
  AI --> BE: Nội dung gợi ý
  BE --> FE: {content: "..."}
  FE --> Editor: Hiển thị gợi ý trong editor
end

Editor -> FE: Điền form và nhấn "Lưu nháp"
FE -> BE: POST /api/news {title, content, status: draft, ...}
BE -> MW: Kiểm tra JWT token
MW --> BE: Token hợp lệ (role: editor)
BE -> DB: INSERT INTO news (status='draft')
DB --> BE: Bài viết được tạo
BE --> FE: 201 Created {article}
FE --> Editor: Thông báo lưu nháp thành công

Admin -> FE: Xem bài nháp, quyết định xuất bản
FE -> BE: PATCH /api/news/:id {status: published}
BE -> MW: Kiểm tra JWT token
MW --> BE: Token hợp lệ (role: admin)
BE -> DB: UPDATE news SET status='published'
DB --> BE: Cập nhật thành công
BE --> FE: 200 OK
FE --> Admin: Thông báo xuất bản thành công
@enduml`;

  const seqContact = `@startuml
!theme plain
title Biểu đồ tuần tự: Gửi và Xử lý Liên hệ

actor "Người dùng" as User
actor "Cán bộ phụ trách" as Staff
participant "Frontend" as FE
participant "Backend" as BE
database "MySQL" as DB

User -> FE: Điền form liên hệ\n(họ tên, email, nội dung)
FE -> FE: Validate dữ liệu phía client
alt Dữ liệu hợp lệ
  FE -> BE: POST /api/contacts\n{name, email, subject, message}
  BE -> DB: INSERT INTO contact_messages
  DB --> BE: Bản ghi được tạo
  BE --> FE: 201 Created
  FE --> User: Thông báo gửi thành công
else Dữ liệu không hợp lệ
  FE --> User: Hiển thị lỗi validation\nGiữ nguyên dữ liệu form
end

Staff -> FE: Đăng nhập và mở trang Quản lý liên hệ
FE -> BE: GET /api/contacts?status=unread
BE -> DB: SELECT * FROM contact_messages
DB --> BE: Danh sách liên hệ
BE --> FE: {contacts: [...]}
FE --> Staff: Hiển thị danh sách
Staff -> FE: Mở chi tiết liên hệ
FE -> BE: GET /api/contacts/:id\n+ PATCH status: is_read=true
BE -> DB: UPDATE contact_messages SET is_read=true
DB --> BE: OK
BE --> FE: Chi tiết liên hệ
FE --> Staff: Hiển thị nội dung đầy đủ
Staff -> FE: Đánh dấu "Đã phản hồi"
FE -> BE: PATCH /api/contacts/:id\n{is_replied: true}
BE -> DB: UPDATE contact_messages
DB --> BE: OK
BE --> FE: 200 OK
FE --> Staff: Cập nhật trạng thái thành công
@enduml`;

  const seqTimeline = `@startuml
!theme plain
title Biểu đồ tuần tự: Xem và Quản lý Timeline Sự kiện

actor "Người dùng" as User
actor "Quản trị viên" as Admin
participant "Frontend" as FE
participant "Backend" as BE
database "MySQL" as DB

User -> FE: Truy cập trang Timeline
FE -> BE: GET /api/timeline?year=2025
BE -> DB: SELECT * FROM timeline_events\nWHERE year=2025 AND is_visible=true\nORDER BY month ASC
DB --> BE: Danh sách mốc sự kiện
BE --> FE: {events: [...]}
FE --> User: Hiển thị timeline theo tháng

User -> FE: Chọn năm khác (VD: 2024)
FE -> BE: GET /api/timeline?year=2024
BE -> DB: SELECT ... WHERE year=2024
DB --> BE: Kết quả
BE --> FE: {events: [...]}
FE --> User: Cập nhật timeline

Admin -> FE: Thêm mốc sự kiện mới
FE -> BE: POST /api/timeline\n{title, month, year, description}
BE -> DB: INSERT INTO timeline_events
DB --> BE: OK
BE --> FE: 201 Created
FE --> Admin: Thông báo thêm thành công
@enduml`;

  const packageDiagram = `@startuml
!theme plain
title Biểu đồ gói hệ thống Website Liên Chi đoàn

package "Frontend - User Website" {
  [pages/Home]
  [pages/News]
  [pages/Activities]
  [pages/Organization]
  [pages/Timeline]
  [pages/Contact]
  [components/Shared]
  [hooks/useAPI]
}

package "Frontend - Admin Website" {
  [pages/Dashboard]
  [pages/ArticleManager]
  [pages/CategoryManager]
  [pages/MemberManager]
  [pages/ContactManager]
  [pages/TimelineManager]
  [pages/Utility]
  [components/AdminShared]
  [hooks/useAuth]
}

package "Backend (Node.js + Express)" {
  package "Routes" {
    [auth.routes]
    [news.routes]
    [category.routes]
    [user.routes]
    [timeline.routes]
    [organization.routes]
    [contact.routes]
    [ai.routes]
    [upload.routes]
  }
  package "Controllers" {
    [AuthController]
    [NewsController]
    [CategoryController]
    [UserController]
    [TimelineController]
    [ContactController]
    [AIController]
  }
  package "Middlewares" {
    [verifyJWT]
    [checkRole]
    [errorHandler]
  }
  package "Services" {
    [CloudinaryService]
    [GeminiService]
  }
  package "DB" {
    [mysql2.pool]
    [queryHelpers]
  }
}

database "MySQL Database" {
  [users]
  [news]
  [categories]
  [activities]
  [organizations]
  [timeline_events]
  [contact_messages]
  [post_templates]
}

cloud "External Services" {
  [Cloudinary CDN]
  [Gemini AI API]
}

[Frontend - User Website] --> [Routes] : REST API
[Frontend - Admin Website] --> [Routes] : REST API (+ JWT)
[Routes] --> [Controllers]
[Controllers] --> [Middlewares]
[Controllers] --> [Services]
[Controllers] --> [DB]
[DB] --> [MySQL Database]
[Services] --> [Cloudinary CDN]
[Services] --> [Gemini AI API]
@enduml`;

  const deployDiagram = `@startuml
!theme plain
title Biểu đồ triển khai hệ thống

node "Client Browser" {
  artifact "React User App\n(Vite build)" as UserApp
  artifact "React Admin App\n(Vite build)" as AdminApp
}

node "Web Server (Hosting)" {
  artifact "Static Files\n(dist/)" as StaticFiles
  node "Node.js Runtime" {
    artifact "Express.js Backend\nAPI Server (:3000)" as BackendServer
  }
}

node "Database Server" {
  database "MySQL 8.x\n:3306" as MySQLDB
}

cloud "Cloudinary Cloud" {
  artifact "Image Storage\n& CDN" as CloudinaryStorage
}

cloud "Google AI Platform" {
  artifact "Gemini AI API" as GeminiAPI
}

UserApp --> StaticFiles : HTTPS (port 80/443)
AdminApp --> StaticFiles : HTTPS
UserApp --> BackendServer : REST API calls
AdminApp --> BackendServer : REST API calls (+ JWT)
BackendServer --> MySQLDB : mysql2 TCP :3306
BackendServer --> CloudinaryStorage : HTTPS API
BackendServer --> GeminiAPI : HTTPS API
@enduml`;

  return [
    h1("CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG"),
    emptyLine(),
    body("Chương 3 trình bày toàn bộ quá trình phân tích và thiết kế hệ thống website Liên Chi đoàn theo phương pháp luận phân tích hệ thống của Dennis, Wixom & Roth (2015). Quá trình được thực hiện theo vòng đời: Phân tích yêu cầu → Phân tích chức năng → Phân tích cấu trúc → Phân tích hành vi → Thiết kế hệ thống."),
    h2("3.1. Phân tích hệ thống"),
    h3("3.1.1. Phân tích yêu cầu"),
    h4("3.1.1.1. Xác định các tác nhân người dùng (Actors)"),
    body("Hệ thống xác định các tác nhân chính như sau: Người dùng công khai (sinh viên, giảng viên) – tương tác với website công khai để tra cứu thông tin; Biên tập viên (Editor) – tạo và chỉnh sửa nội dung bài viết; Quản trị viên (Admin) – có toàn quyền quản lý hệ thống; Quản lý liên hệ (Contact Manager) – xử lý phản hồi từ người dùng; Người dùng tiện ích (Utility User) – sử dụng các công cụ xuất dữ liệu."),
    emptyLine(),
    caption("Bảng 3.1: Danh sách các vai trò và phạm vi quyền"),
    makeTable(
      ["Vai trò", "Mô tả", "Phạm vi quyền chính"],
      [
        ["Admin", "Quản trị viên toàn quyền", "Toàn bộ chức năng hệ thống"],
        ["Editor", "Biên tập viên nội dung", "Tạo/sửa bài viết, quản lý danh mục"],
        ["Contact Manager", "Phụ trách liên hệ", "Xem và xử lý phản hồi liên hệ"],
        ["Utility User", "Người dùng tiện ích", "Sử dụng công cụ xuất dữ liệu"],
        ["Người dùng công khai", "Sinh viên, giảng viên", "Xem nội dung, gửi liên hệ"],
      ],
      [2200, 2200, 3800]
    ),
    h4("3.1.1.2. Danh sách User Story"),
    body("Hệ thống được xây dựng dựa trên 35 User Story được phân loại theo nhóm tác nhân và mức độ ưu tiên (MoSCoW). Chi tiết các User Story quan trọng được trình bày trong Bảng 3.2."),
    emptyLine(),
    caption("Bảng 3.2: Danh sách User Story theo nhóm chức năng (trích lược)"),
    makeTable(
      ["Mã", "Tác nhân", "Mô tả", "Ưu tiên"],
      [
        ["US-U01", "Người dùng công khai", "Xem trang chủ có nội dung nổi bật", "Must-have"],
        ["US-U03", "Người dùng công khai", "Xem chi tiết bài viết đầy đủ nội dung", "Must-have"],
        ["US-U09", "Người dùng công khai", "Xem timeline theo năm để theo dõi sự kiện", "Should-have"],
        ["US-U10", "Người dùng công khai", "Gửi form liên hệ để gửi câu hỏi/góp ý", "Must-have"],
        ["US-A01", "Quản trị viên", "Đăng nhập hệ thống vào khu vực quản trị", "Must-have"],
        ["US-A02", "Hệ thống", "Phân quyền theo vai trò sau đăng nhập", "Must-have"],
        ["US-C01", "Biên tập viên", "Tạo bài viết mới để đăng thông tin kịp thời", "Must-have"],
        ["US-C04", "Biên tập viên có quyền", "Xuất bản hoặc ẩn bài để kiểm soát hiển thị", "Must-have"],
        ["US-C07", "Biên tập viên", "Sinh gợi ý nội dung bằng AI tiết kiệm thời gian", "Should-have"],
        ["US-AD01", "Admin toàn quyền", "Tạo tài khoản thành viên phân công vận hành", "Must-have"],
        ["US-AD03", "Quản lý liên hệ", "Xem danh sách liên hệ theo trạng thái", "Must-have"],
        ["US-T03", "Người dùng tiện ích", "Xuất hàng loạt giấy mời/chứng chỉ thành tệp nén", "Should-have"],
      ],
      [1400, 2000, 3600, 1200]
    ),
    h3("3.1.2. Phân tích chức năng"),
    h4("3.1.2.1. Biểu đồ Use Case tổng quát hệ thống"),
    body("Biểu đồ Use Case tổng quát (Hình 3.1) mô tả toàn bộ chức năng hệ thống và mối quan hệ giữa các tác nhân với các ca sử dụng, phân chia rõ giữa website công khai và hệ thống quản trị."),
    ...umlBlock("Biểu đồ Use Case tổng quát hệ thống (PlantUML)", useCaseDiagram, "3.1"),

    h4("3.1.2.2. Đặc tả UseCase chi tiết"),
    body("Toàn bộ dữ liệu đều có chức năng Thêm/Đọc/Sửa/Xóa/Ẩn và chịu tác động bởi sự phân quyền từ phía Quản trị hệ thống. Các UseCase quan trọng nhất bao gồm: Quản lý bài viết (US-C01 đến US-C09), Quản lý danh mục (US-M01 đến US-M02), Quản lý thành viên (US-AD01 đến US-AD02), Quản lý liên hệ (US-AD03 đến US-AD05), Tiện ích xuất dữ liệu (US-T01 đến US-T04)."),
    emptyLine(),
    caption("Bảng 3.3: Đặc tả UseCase – Tạo và Xuất bản Bài viết (UC-CreatePost)"),
    makeTable(
      ["Thuộc tính", "Mô tả"],
      [
        ["Mã UseCase", "UC-CreatePost"],
        ["Tên UseCase", "Tạo và Xuất bản Bài viết"],
        ["Tác nhân chính", "Biên tập viên (Editor)"],
        ["Tác nhân thứ cấp", "Quản trị viên (Admin), Gemini AI, Cloudinary"],
        ["Điều kiện đầu vào", "Người dùng đã đăng nhập với vai trò Editor hoặc Admin"],
        ["Luồng sự kiện chính", "1. Mở form tạo bài viết\n2. Nhập tiêu đề, tóm tắt, nội dung\n3. Chọn danh mục và tải ảnh\n4. (Tuỳ chọn) Dùng AI gợi ý nội dung\n5. Lưu nháp\n6. Admin duyệt và xuất bản"],
        ["Luồng sự kiện ngoại lệ", "Dữ liệu thiếu trường bắt buộc → Hiển thị lỗi validation\nLỗi kết nối Cloudinary → Hiển thị thông báo, giữ form"],
        ["Điều kiện đầu ra", "Bài viết được lưu với trạng thái tương ứng; bài xuất bản hiển thị công khai"],
      ],
      [2200, 6000]
    ),

    h4("3.1.2.3. Biểu đồ hoạt động"),
    body("Các biểu đồ hoạt động sau đây mô tả luồng xử lý của các chức năng quan trọng trong hệ thống, bao gồm cả website quản trị và website người dùng công khai."),
    bold("a) Biểu đồ hoạt động: Đăng nhập và Phân quyền"),
    ...umlBlock("Biểu đồ hoạt động – Đăng nhập và Phân quyền (PlantUML)", activityLogin, "3.2"),

    bold("b) Biểu đồ hoạt động: Tạo và Xuất bản Bài viết"),
    ...umlBlock("Biểu đồ hoạt động – Tạo và Xuất bản Bài viết (PlantUML)", activityCreatePost, "3.3"),

    bold("c) Biểu đồ hoạt động: Người dùng xem và lọc nội dung"),
    ...umlBlock("Biểu đồ hoạt động – Người dùng xem và lọc nội dung (PlantUML)", activityUserView, "3.4"),

    bold("d) Biểu đồ hoạt động: Gửi và Xử lý Liên hệ"),
    ...umlBlock("Biểu đồ hoạt động – Gửi và Xử lý Liên hệ (PlantUML)", activityContact, "3.5"),

    bold("e) Biểu đồ hoạt động: Tạo giấy mời/chứng chỉ hàng loạt"),
    ...umlBlock("Biểu đồ hoạt động – Tạo giấy mời/chứng chỉ hàng loạt (PlantUML)", activityCert, "3.6"),

    h3("3.1.3. Phân tích cấu trúc"),
    h4("3.1.3.1. Phân tích dữ liệu (ERD)"),
    body("Sơ đồ thực thể quan hệ (ERD – Hình 3.7) mô tả cấu trúc dữ liệu tổng thể của hệ thống, bao gồm 8 thực thể chính và các mối quan hệ giữa chúng. ERD được vẽ theo ký pháp Crow's Foot."),
    ...umlBlock("Sơ đồ thực thể quan hệ – ERD (Mermaid erDiagram)", classERD, "3.7"),

    h4("3.1.3.2. Mô tả các thực thể và quan hệ"),
    emptyLine(),
    caption("Bảng 3.4: Mô tả các thực thể chính trong CSDL"),
    makeTable(
      ["Thực thể", "Mô tả", "Quan hệ chính"],
      [
        ["USERS", "Tài khoản người dùng hệ thống quản trị, lưu thông tin đăng nhập và vai trò", "1-n với NEWS, ACTIVITIES"],
        ["CATEGORIES", "Danh mục phân cấp cha-con, phân loại nội dung theo page_type", "Tự tham chiếu cha-con; 1-n với NEWS, ACTIVITIES"],
        ["NEWS", "Bài viết tin tức, hoạt động, thành tích với đầy đủ nội dung và trạng thái xuất bản", "n-1 với USERS, CATEGORIES"],
        ["ACTIVITIES", "Hoạt động sự kiện có thông tin thời gian và địa điểm", "n-1 với USERS, CATEGORIES"],
        ["ORGANIZATIONS", "Cơ cấu tổ chức theo mô hình cây phân cấp", "Tự tham chiếu cha-con"],
        ["TIMELINE_EVENTS", "Mốc sự kiện theo tháng/năm dùng cho trang timeline", "Độc lập"],
        ["CONTACT_MESSAGES", "Phản hồi liên hệ từ người dùng công khai", "Độc lập"],
        ["POST_TEMPLATES", "Mẫu nội dung bài viết hỗ trợ biên tập", "n-1 với CATEGORIES"],
      ],
      [2200, 3500, 2500]
    ),

    h4("3.1.3.3. Biểu đồ lớp"),
    body("Biểu đồ lớp (Hình 3.8) mô tả cấu trúc lớp của hệ thống theo mô hình hướng đối tượng, bao gồm các thuộc tính, phương thức và mối quan hệ giữa các lớp. Biểu đồ phản ánh thiết kế backend theo mô hình MVC."),
    ...umlBlock("Biểu đồ lớp hệ thống (PlantUML)", classDiagram, "3.8"),

    h3("3.1.4. Phân tích hành vi"),
    h4("3.1.4.1. Biểu đồ tuần tự"),
    body("Các biểu đồ tuần tự dưới đây mô tả tương tác giữa các thành phần hệ thống theo thứ tự thời gian, tương ứng với các luồng hoạt động đã phân tích ở mục 3.1.2.3."),
    bold("a) Biểu đồ tuần tự: Đăng nhập và Phân quyền"),
    ...umlBlock("Biểu đồ tuần tự – Đăng nhập và Phân quyền (PlantUML)", seqLogin, "3.9"),

    bold("b) Biểu đồ tuần tự: Tạo và Xuất bản Bài viết"),
    ...umlBlock("Biểu đồ tuần tự – Tạo và Xuất bản Bài viết (PlantUML)", seqCreatePost, "3.10"),

    bold("c) Biểu đồ tuần tự: Gửi và Xử lý Liên hệ"),
    ...umlBlock("Biểu đồ tuần tự – Gửi và Xử lý Liên hệ (PlantUML)", seqContact, "3.11"),

    bold("d) Biểu đồ tuần tự: Xem và Quản lý Timeline Sự kiện"),
    ...umlBlock("Biểu đồ tuần tự – Timeline Sự kiện (PlantUML)", seqTimeline, "3.12"),

    h2("3.2. Thiết kế hệ thống"),
    h3("3.2.1. Thiết kế kiến trúc tổng thể"),
    body("Kiến trúc hệ thống được xây dựng theo mô hình ba lớp gồm frontend, backend và cơ sở dữ liệu. Frontend gửi request đến backend thông qua REST API chuẩn hóa. Backend xử lý logic nghiệp vụ và thực hiện truy vấn cơ sở dữ liệu trước khi trả dữ liệu về frontend dưới dạng JSON. Hệ thống tích hợp hai dịch vụ ngoài: Cloudinary (lưu trữ ảnh) và Gemini AI (hỗ trợ biên tập)."),
    body("Đây là kiến trúc tách biệt hoàn toàn frontend và backend (decoupled architecture), cho phép mỗi phần phát triển, triển khai và mở rộng độc lập. Việc tách biệt này còn tạo điều kiện để trong tương lai có thể xây dựng thêm ứng dụng mobile hoặc các client khác sử dụng cùng backend API."),
    h4("3.2.1.1. Biểu đồ gói"),
    ...umlBlock("Biểu đồ gói hệ thống (PlantUML)", packageDiagram, "3.13"),

    h4("3.2.1.2. Biểu đồ triển khai"),
    ...umlBlock("Biểu đồ triển khai hệ thống (PlantUML)", deployDiagram, "3.14"),

    h3("3.2.2. Thiết kế cơ sở dữ liệu"),
    body("Cơ sở dữ liệu MySQL được thiết kế gồm 8 bảng chính. Schema cơ sở dữ liệu phản ánh đúng mô hình nghiệp vụ đã được xác định trong phần phân tích. Các trường được sử dụng thường xuyên trong điều kiện WHERE đều được đánh chỉ mục (index) để tối ưu hiệu năng truy vấn."),
    emptyLine(),
    caption("Bảng 3.5: Cấu trúc bảng NEWS trong CSDL"),
    makeTable(
      ["Cột", "Kiểu dữ liệu", "Ràng buộc", "Mô tả"],
      [
        ["id", "INT", "PK, AUTO_INCREMENT", "Khóa chính"],
        ["title", "VARCHAR(500)", "NOT NULL", "Tiêu đề bài viết"],
        ["slug", "VARCHAR(500)", "UNIQUE, NOT NULL", "Định danh URL thân thiện"],
        ["summary", "TEXT", "NULL", "Tóm tắt bài viết"],
        ["content", "LONGTEXT", "NULL", "Nội dung đầy đủ"],
        ["thumbnail_url", "VARCHAR(500)", "NULL", "URL ảnh đại diện (Cloudinary)"],
        ["status", "ENUM('draft','published','hidden')", "DEFAULT 'draft'", "Trạng thái xuất bản"],
        ["category_id", "INT", "FK → categories.id", "Danh mục bài viết"],
        ["author_id", "INT", "FK → users.id", "Tác giả"],
        ["view_count", "INT", "DEFAULT 0", "Số lượt xem"],
        ["published_at", "TIMESTAMP", "NULL", "Thời gian xuất bản"],
        ["created_at", "TIMESTAMP", "DEFAULT CURRENT_TIMESTAMP", "Thời gian tạo"],
      ],
      [1800, 2200, 2200, 2000]
    ),

    h3("3.2.3. Thiết kế giao diện sử dụng"),
    h4("3.2.3.1. Thiết kế giao diện website Liên Chi đoàn (User)"),
    body("Giao diện website công khai được thiết kế theo nguyên tắc Responsive Design với bố cục đơn giản, trực quan. Màu sắc chủ đạo sử dụng gam màu xanh của Đoàn Thanh niên. Cấu trúc điều hướng gồm menu ngang trên cùng với các mục: Trang chủ, Tin tức, Hoạt động, Thành tích, Cơ cấu tổ chức, Timeline, Liên hệ. Mỗi trang danh sách sử dụng bố cục card grid với 3 cột trên desktop, 2 cột trên tablet và 1 cột trên mobile."),
    h4("3.2.3.2. Thiết kế giao diện website Admin"),
    body("Giao diện quản trị được thiết kế theo mô hình dashboard với sidebar điều hướng bên trái và vùng nội dung chính bên phải. Sidebar hiển thị các menu theo đúng vai trò đã đăng nhập. Màu sắc chủ đạo là xanh đậm và trắng, tạo cảm giác chuyên nghiệp. Các form nhập liệu sử dụng bố cục hai cột trên màn hình lớn và một cột trên mobile."),
    h2("3.3. Liên kết yêu cầu và thiết kế (Traceability Matrix)"),
    emptyLine(),
    caption("Bảng 3.6: Ma trận liên kết yêu cầu và thiết kế (Traceability Matrix)"),
    makeTable(
      ["Yêu cầu chức năng", "UseCase", "Bảng CSDL", "API Endpoint"],
      [
        ["Đăng nhập và phân quyền", "US-A01, US-A02", "users", "POST /api/auth/login"],
        ["Quản lý bài viết", "US-C01 → US-C09", "news, categories", "CRUD /api/news"],
        ["Hỗ trợ AI biên tập", "US-C07", "—", "POST /api/ai/generate"],
        ["Quản lý danh mục", "US-M01, US-M02", "categories", "CRUD /api/categories"],
        ["Quản lý thành viên", "US-AD01, US-AD02", "users", "CRUD /api/users"],
        ["Quản lý liên hệ", "US-AD03, US-AD05", "contact_messages", "CRUD /api/contacts"],
        ["Quản lý timeline", "US-M04, US-M05", "timeline_events", "CRUD /api/timeline"],
        ["Quản lý cơ cấu tổ chức", "US-M03", "organizations", "CRUD /api/organizations"],
        ["Tải ảnh (Cloudinary)", "US-C05", "news.thumbnail_url", "POST /api/uploads"],
        ["Xuất giấy mời/chứng chỉ", "US-T01 → US-T03", "—", "POST /api/utility/export"],
      ],
      [2200, 2000, 1800, 2200]
    ),
    emptyLine(),
    new Paragraph({ children: [new TextRun({ text: "Tóm tắt Chương 3: ", font: TNR, size: SZ, bold: true }), new TextRun({ text: "Chương 3 đã thực hiện đầy đủ quá trình phân tích và thiết kế hệ thống. Phân tích yêu cầu xác định 35 User Story và 5 nhóm tác nhân. Biểu đồ Use Case, 5 biểu đồ hoạt động, ERD, biểu đồ lớp và 4 biểu đồ tuần tự cung cấp tài liệu kỹ thuật toàn diện. Thiết kế CSDL gồm 8 bảng với ràng buộc toàn vẹn tham chiếu. Ma trận Traceability đảm bảo mọi yêu cầu đều có thiết kế tương ứng.", font: TNR, size: SZ, italics: true })] }),
    pageBreak()
  ];
}

// --------- CHUONG 4 ---------
function chuong4() {
  return [
    h1("CHƯƠNG 4. XÂY DỰNG HỆ THỐNG, KẾT QUẢ ĐẠT ĐƯỢC VÀ ĐÁNH GIÁ"),
    emptyLine(),
    body("Chương này trình bày toàn bộ quá trình hiện thực hóa hệ thống website Liên Chi đoàn từ thiết kế sang sản phẩm vận hành thực tế. Nội dung bao gồm: xây dựng backend và cơ sở dữ liệu, triển khai giao diện website công khai và hệ thống quản trị, kết quả kiểm thử, đánh giá hệ thống và định hướng phát triển."),
    h2("4.1. Xây dựng hệ thống"),
    h3("4.1.1. Xây dựng hệ thống backend"),
    h4("4.1.1.1. Xây dựng backend Node.js kết hợp Express"),
    body("Hệ thống backend được xây dựng trên nền tảng Node.js kết hợp Express.js, đóng vai trò lớp xử lý trung tâm: tiếp nhận yêu cầu từ cả website người dùng và website quản trị, thực thi nghiệp vụ, phân quyền truy cập và trả kết quả dưới dạng JSON theo chuẩn REST API."),
    body("Cấu trúc thư mục backend được tổ chức theo mô hình phân lớp rõ ràng như sau:"),
    ...codeBlock([
      "backend/",
      "├── src/",
      "│   ├── routes/          # Định nghĩa endpoint API theo nhóm nghiệp vụ",
      "│   │   ├── auth.routes.js",
      "│   │   ├── news.routes.js",
      "│   │   ├── category.routes.js",
      "│   │   ├── user.routes.js",
      "│   │   ├── timeline.routes.js",
      "│   │   ├── organization.routes.js",
      "│   │   ├── contact.routes.js",
      "│   │   ├── ai.routes.js",
      "│   │   └── upload.routes.js",
      "│   ├── controllers/     # Xử lý logic nghiệp vụ",
      "│   ├── middlewares/     # verifyJWT, checkRole, errorHandler",
      "│   ├── services/        # CloudinaryService, GeminiService",
      "│   └── db/             # mysql2 pool, queryHelpers",
      "├── .env                 # Biến môi trường (DB, Cloudinary, Gemini keys)",
      "└── index.js             # Entrypoint Express app",
    ]),
    emptyLine(),
    body("Cơ chế xác thực và phân quyền được triển khai theo tiêu chuẩn JWT. Khi người dùng đăng nhập thành công, hệ thống phát hành JWT token chứa thông tin định danh và vai trò với thời hạn sử dụng xác định. Token được gửi kèm trong header Authorization của mọi request đến các endpoint quản trị. Middleware xác thực (verifyJWT) giải mã và kiểm tra tính hợp lệ; middleware phân quyền (checkRole) kiểm tra vai trò trước khi cho phép thực thi controller."),
    body("Cấu trúc response API được chuẩn hóa thống nhất trên toàn bộ các controller, bao gồm mã trạng thái HTTP phù hợp, trường success/error và dữ liệu hoặc thông báo lỗi tương ứng. Xử lý lỗi tập trung được triển khai qua middleware lỗi toàn cục cuối chuỗi Express."),
    h4("4.1.1.2. Thiết lập cơ sở dữ liệu"),
    body("Cơ sở dữ liệu MySQL được thiết kế và triển khai theo schema đã xác định ở Chương 3. Quá trình thiết lập bao gồm các bước: (1) Tạo schema và các bảng theo ERD; (2) Thiết lập ràng buộc khóa ngoại đảm bảo toàn vẹn tham chiếu; (3) Tạo chỉ mục (index) trên các trường hay dùng trong WHERE như slug, category_id, is_published, year, month; (4) Cấu hình connection pool qua thư viện mysql2."),
    ...codeBlock([
      "// Ví dụ cấu hình connection pool MySQL",
      "const mysql = require('mysql2/promise');",
      "",
      "const pool = mysql.createPool({",
      "  host: process.env.DB_HOST,",
      "  user: process.env.DB_USER,",
      "  password: process.env.DB_PASSWORD,",
      "  database: process.env.DB_NAME,",
      "  connectionLimit: 10,",
      "  waitForConnections: true,",
      "  queueLimit: 0",
      "});",
      "",
      "module.exports = pool;",
    ]),
    emptyLine(),
    body("Toàn bộ thông tin kết nối cơ sở dữ liệu được tách biệt khỏi mã nguồn nghiệp vụ thông qua biến môi trường (.env), đảm bảo an toàn thông tin và dễ chuyển đổi giữa môi trường phát triển và triển khai thực tế."),

    h3("4.1.2. Xây dựng website cho người dùng (User)"),
    body("Website công khai dành cho người dùng cuối được xây dựng bằng React.js với Vite. Toàn bộ giao diện được thiết kế theo nguyên tắc Responsive Design, đảm bảo hiển thị tốt trên mọi thiết bị."),
    h4("4.1.2.1. Trang chủ (Homepage)"),
    body("Trang chủ là điểm khởi đầu của website, cung cấp cái nhìn tổng quan về Liên Chi đoàn. Khi người dùng tải trang, frontend thực hiện các lời gọi API song song (Promise.all) đến backend để lấy đồng thời: danh sách tin tức nổi bật, danh sách hoạt động tiêu biểu và danh sách thành tích mới nhất. Kết quả được render vào các khối card tương ứng. Trạng thái loading và lỗi được xử lý rõ ràng thông qua React hooks (useState, useEffect)."),
    h4("4.1.2.2. Trang danh sách nội dung (Tin tức / Hoạt động / Thành tích)"),
    body("Các trang danh sách có thiết kế nhất quán: hiển thị bài viết dạng card với ảnh đại diện, tiêu đề, tóm tắt và thời gian. Người dùng lọc nội dung theo danh mục hoặc từ khóa; kết quả cập nhật ngay lập tức nhờ cơ chế quản lý trạng thái React kết hợp gọi API có điều kiện. Tính năng phân trang được tích hợp để xử lý danh sách dài mà không ảnh hưởng hiệu năng tải trang ban đầu."),
    h4("4.1.2.3. Trang chi tiết bài viết"),
    body("Trang chi tiết hiển thị: tiêu đề, ảnh đại diện, tóm tắt, nội dung đầy đủ (render từ định dạng có cấu trúc), thông tin tác giả và thời gian đăng. Khi người dùng truy cập trang chi tiết, backend tự động tăng bộ đếm lượt xem (view_count) thông qua query UPDATE. Trường hợp bài không tồn tại hoặc chưa xuất bản, trang hiển thị thông báo 404 thân thiện."),
    h4("4.1.2.4. Trang cơ cấu tổ chức"),
    body("Trang cơ cấu tổ chức hiển thị thông tin các ban/đơn vị của Liên Chi đoàn theo cấu trúc phân cấp, được lấy từ API và dựng thành giao diện dạng khối tổ chức trực quan. Mỗi đơn vị hiển thị tên, mô tả chức năng và danh sách thành viên công khai."),
    h4("4.1.2.5. Trang hoạt động thường niên"),
    body("Trang hoạt động thường niên phân nhóm và hiển thị các hoạt động diễn ra định kỳ hàng năm của Liên Chi đoàn. Mỗi hoạt động hiển thị thông tin cơ bản (tiêu đề, thời gian, địa điểm, tóm tắt) dạng card; người dùng bấm vào để mở trang chi tiết với mô tả đầy đủ và ảnh minh hoạ."),
    h4("4.1.2.6. Trang Timeline sự kiện"),
    body("Trang Timeline cho phép người dùng xem các mốc hoạt động của Liên Chi đoàn theo từng tháng trong năm, với bộ lọc chọn năm để xem lịch sử hoạt động qua các năm. Khi người dùng thay đổi năm, frontend gọi API GET /api/timeline?year={year} và cập nhật danh sách mốc sự kiện. Giao diện timeline dạng trục thời gian trực quan hiển thị tên sự kiện và mô tả theo thứ tự tháng."),
    h4("4.1.2.7. Trang liên hệ"),
    body("Trang liên hệ cung cấp biểu mẫu để người dùng gửi câu hỏi hoặc góp ý. Biểu mẫu yêu cầu: họ tên (bắt buộc), email hợp lệ (bắt buộc), chủ đề và nội dung tin nhắn (bắt buộc). Dữ liệu được kiểm tra hợp lệ phía frontend trước khi gửi POST /api/contacts. Sau khi gửi thành công, người dùng nhận thông báo xác nhận; nếu lỗi, form giữ nguyên dữ liệu đã nhập và hiển thị thông báo lỗi rõ ràng."),

    h3("4.1.3. Xây dựng web quản trị (Admin)"),
    body("Hệ thống quản trị (Admin) là giao diện dành riêng cho cán bộ Liên Chi đoàn, được xây dựng hoàn toàn tách biệt khỏi website người dùng, chạy trên một dự án React độc lập. Toàn bộ chức năng quản trị đều yêu cầu xác thực và hiển thị theo đúng phân quyền vai trò."),
    h4("4.1.3.1. Đăng nhập và phân quyền theo vai trò"),
    body("Màn hình đăng nhập yêu cầu người dùng nhập username và password. Luồng xử lý đăng nhập diễn ra như sau:"),
    bodyNoIndent("Bước 1 – Nhập thông tin: Người dùng nhập username và password vào form đăng nhập. Frontend thực hiện kiểm tra cơ bản (không để trống) trước khi gửi request."),
    bodyNoIndent("Bước 2 – Gửi request xác thực: Frontend gửi POST /api/auth/login với payload {username, password}. Backend nhận request và truy vấn MySQL để lấy thông tin người dùng theo username."),
    bodyNoIndent("Bước 3 – Xác thực mật khẩu: Backend so sánh mật khẩu nhập vào với hash lưu trong CSDL bằng bcrypt. Nếu khớp, hệ thống tạo JWT token chứa {id, role, exp}. Nếu không khớp, trả về 401 Unauthorized."),
    bodyNoIndent("Bước 4 – Xử lý phản hồi: Frontend nhận JWT token và lưu vào sessionStorage. Dựa trên trường role trong payload token, frontend điều hướng người dùng đến Dashboard tương ứng và hiển thị menu đúng quyền."),
    bodyNoIndent("Bước 5 – Bảo vệ route: Mọi request tiếp theo đến API quản trị đều kèm token trong header Authorization: Bearer {token}. Middleware verifyJWT kiểm tra và giải mã token; middleware checkRole xác nhận vai trò đủ quyền thực hiện thao tác cụ thể."),
    body("Hệ thống triển khai bốn vai trò: Admin (toàn quyền), Editor (tạo/sửa bài, không xuất bản), Contact Manager (quản lý liên hệ), Utility User (sử dụng công cụ tiện ích). Tài khoản bị vô hiệu hóa không thể đăng nhập dù thông tin chính xác."),
    h4("4.1.3.2. Trang Dashboard"),
    body("Dashboard là trang đầu tiên sau đăng nhập, cung cấp cái nhìn tổng quan nhanh về trạng thái hệ thống. Nội dung Dashboard bao gồm: số liệu thống kê tổng quan (tổng bài viết, số bài nháp chờ duyệt, số liên hệ chưa đọc), danh sách bài viết mới nhất và danh sách liên hệ chưa xử lý mới nhất. Dữ liệu được tải từ API khi vào trang và có thể làm mới bằng nút refresh."),
    h4("4.1.3.3. Tạo bài viết, đăng bài viết và duyệt bài viết"),
    body("Chức năng quản lý bài viết là trung tâm của hệ thống quản trị. Luồng tạo và xuất bản bài viết được thực hiện qua các bước sau:"),
    bodyNoIndent("Bước 1 – Mở form tạo bài viết: Biên tập viên chọn mục "Quản lý bài viết" → "Tạo mới". Form hiển thị đầy đủ các trường: tiêu đề, tóm tắt, trình soạn thảo nội dung rich-text, bộ chọn danh mục, upload ảnh đại diện và trạng thái."),
    bodyNoIndent("Bước 2 – Tải ảnh đại diện: Người dùng chọn file ảnh. Frontend gửi file trực tiếp đến Cloudinary qua upload API. Cloudinary trả về URL ảnh cố định, URL được lưu tạm vào state React."),
    bodyNoIndent("Bước 3 (tùy chọn) – Hỗ trợ AI biên tập: Người dùng nhập từ khóa/chủ đề và nhấn "Gợi ý nội dung". Frontend gọi POST /api/ai/generate {keywords}. Backend xây dựng prompt và gọi Gemini API. Kết quả gợi ý được chèn vào trình soạn thảo để người dùng xem xét và chỉnh sửa."),
    bodyNoIndent("Bước 4 – Lưu bài viết: Người dùng chọn trạng thái (Nháp hoặc Chờ duyệt) và nhấn "Lưu". Frontend gửi POST /api/news với toàn bộ dữ liệu form. Middleware verifyJWT và checkRole xác thực quyền. Controller lưu dữ liệu vào MySQL. Backend trả về bài viết đã tạo."),
    bodyNoIndent("Bước 5 – Duyệt và xuất bản: Admin truy cập danh sách bài nháp, mở bài cần duyệt, xem lại nội dung. Nếu đồng ý, Admin nhấn "Xuất bản" → Frontend gửi PATCH /api/news/:id {status: 'published'}. Middleware kiểm tra quyền Admin. Backend cập nhật status và published_at trong MySQL. Bài viết xuất hiện ngay trên website công khai."),
    body("Danh sách bài viết có thể lọc theo trạng thái (nháp/xuất bản/ẩn), theo danh mục hoặc tìm kiếm theo từ khóa tiêu đề. Kết quả lọc cập nhật động nhờ gọi API với query params tương ứng."),
    h4("4.1.3.4. Quản lý thành viên"),
    body("Chức năng quản lý thành viên chỉ dành cho tài khoản Admin. Màn hình danh sách thành viên hiển thị: họ tên, email, vai trò, trạng thái hoạt động và thời gian tạo. Cán bộ lọc theo vai trò hoặc trạng thái, tìm kiếm theo tên hoặc email."),
    body("Để thêm tài khoản mới, Admin điền form tạo thành viên (họ tên, email, username, mật khẩu tạm, vai trò). Backend kiểm tra trùng username/email trước khi tạo. Để cập nhật thông tin hoặc đổi vai trò, Admin mở form chỉnh sửa → cập nhật trường cần thay đổi → lưu. Để vô hiệu hóa tài khoản, Admin bật/tắt trạng thái is_active mà không xóa dữ liệu, hỗ trợ quản lý linh hoạt khi thay đổi nhân sự giữa nhiệm kỳ."),
    h4("4.1.3.5. Phân role người dùng"),
    body("Màn hình phân quyền vai trò cho phép Admin xem và thay đổi vai trò của từng tài khoản. Luồng thực hiện: Admin chọn tài khoản cần đổi vai trò → chọn vai trò mới từ dropdown (Admin/Editor/Contact Manager/Utility User) → xác nhận thay đổi → Frontend gửi PATCH /api/users/:id {role: newRole}. Backend kiểm tra quyền Admin, cập nhật vai trò trong MySQL. Thay đổi có hiệu lực ngay ở lần đăng nhập tiếp theo của tài khoản đó, đảm bảo token hiện tại không bị ảnh hưởng."),
    h4("4.1.3.6. Quản lý timeline các sự kiện"),
    body("Màn hình quản lý timeline hiển thị danh sách mốc sự kiện phân theo năm. Admin hoặc Editor có thể thêm mốc mới (nhập tiêu đề, mô tả, tháng, năm), sửa thông tin hoặc xóa mốc đã qua. Trạng thái hiển thị (is_visible) có thể bật/tắt để kiểm soát thông tin công khai mà không cần xóa dữ liệu. Thay đổi phản ánh ngay trên trang Timeline website người dùng."),
    h4("4.1.3.7. Quản lý điều thắc mắc (Liên hệ)"),
    body("Chức năng quản lý liên hệ giúp cán bộ tiếp nhận và xử lý câu hỏi/góp ý từ người dùng. Luồng xử lý:"),
    bodyNoIndent("Bước 1 – Xem danh sách: Cán bộ với vai trò Contact Manager đăng nhập và truy cập mục Quản lý liên hệ. Hệ thống hiển thị danh sách liên hệ gồm: họ tên, email, chủ đề, thời gian gửi và trạng thái (chưa đọc/đã đọc/đã phản hồi). Có thể lọc theo trạng thái để ưu tiên xử lý phản hồi mới."),
    bodyNoIndent("Bước 2 – Xem chi tiết: Khi mở chi tiết một liên hệ, frontend gọi GET /api/contacts/:id kèm PATCH để tự động đánh dấu is_read = true. Màn hình chi tiết hiển thị đầy đủ nội dung tin nhắn, thông tin người gửi và trạng thái xử lý."),
    bodyNoIndent("Bước 3 – Đánh dấu đã phản hồi: Sau khi xử lý/phản hồi qua email bên ngoài, cán bộ nhấn nút "Đánh dấu đã phản hồi". Frontend gửi PATCH /api/contacts/:id {is_replied: true}. Backend cập nhật MySQL. Danh sách tự cập nhật trạng thái mới."),
    bodyNoIndent("Bước 4 – Xóa liên hệ (tùy chọn): Admin hoặc Contact Manager có thể xóa bản ghi liên hệ đã xử lý hoàn toàn. Hệ thống hiển thị hộp xác nhận trước khi thực hiện DELETE /api/contacts/:id để tránh xóa nhầm."),
    h4("4.1.3.8. Tiện ích khác"),
    h4("4.1.3.8.1. Xuất giấy mời/chứng chỉ hàng loạt"),
    body("Tiện ích tạo giấy mời/chứng chỉ hàng loạt được thiết kế để giải quyết bài toán thực tiễn phổ biến trong tổ chức sự kiện. Luồng thực hiện:"),
    bodyNoIndent("Bước 1 – Tải mẫu nền: Cán bộ tải lên file ảnh làm template (JPG/PNG). Hệ thống hiển thị ảnh mẫu trong vùng xem trước."),
    bodyNoIndent("Bước 2 – Cấu hình vị trí chữ: Cán bộ thiết lập font chữ, kích thước, màu sắc và tọa độ (x, y) nơi tên sẽ được in. Giao diện cập nhật xem trước theo thời gian thực."),
    bodyNoIndent("Bước 3 – Tải danh sách tên: Cán bộ tải lên file Excel chứa danh sách tên. Hệ thống đọc và parse, bỏ qua dòng tiêu đề, hiển thị danh sách tên đã nhận dạng để cán bộ xác nhận."),
    bodyNoIndent("Bước 4 – Xuất hàng loạt: Cán bộ nhấn "Xuất tất cả". Hệ thống xử lý lần lượt: đọc tên từ danh sách → render tên lên ảnh template tại vị trí đã cấu hình → lưu file ảnh cá nhân. Sau khi xử lý toàn bộ, hệ thống đóng gói tất cả ảnh thành file ZIP và cung cấp đường dẫn tải về."),
    bodyNoIndent("Xử lý lỗi: File Excel sai định dạng → thông báo lỗi, không tiến hành; một số tên lỗi render → hệ thống bỏ qua và báo danh sách lỗi để cán bộ kiểm tra lại."),
    h4("4.1.3.8.2. Tài liệu chung"),
    body("Chức năng tài liệu chung cho phép cán bộ lưu trữ và chia sẻ các tài liệu nội bộ (biên bản, quy chế, mẫu biểu) trong phạm vi hệ thống quản trị. Cán bộ có thể tải lên file và quản lý theo danh mục, hỗ trợ tra cứu và tải về tài liệu khi cần."),

    h2("4.2. Kết quả đạt được"),
    body("Sau quá trình phân tích, thiết kế và triển khai, hệ thống website Liên Chi đoàn đã được xây dựng thành công với đầy đủ các chức năng đã đặt ra. Hệ thống hoạt động ổn định trong môi trường thử nghiệm và đáp ứng tốt các tiêu chí về chức năng lẫn phi chức năng."),
    emptyLine(),
    caption("Bảng 4.1: Tổng hợp kết quả đạt được so với mục tiêu đề ra"),
    makeTable(
      ["Mục tiêu", "Kết quả đạt được", "Trạng thái"],
      [
        ["Xây dựng website công khai cho người dùng", "Đầy đủ 7 trang: Trang chủ, Tin tức, Hoạt động (thường/không thường niên), Thành tích, Cơ cấu tổ chức, Timeline, Liên hệ. Responsive trên mọi thiết bị.", "✓ Hoàn thành"],
        ["Xây dựng hệ thống quản trị cho cán bộ", "Dashboard + đầy đủ chức năng quản lý: bài viết, danh mục, thành viên, liên hệ, timeline, tổ chức, tiện ích.", "✓ Hoàn thành"],
        ["Phân quyền linh hoạt theo vai trò (RBAC)", "4 vai trò (Admin, Editor, Contact Manager, Utility User). JWT xác thực. Middleware kiểm tra quyền độc lập phía server.", "✓ Hoàn thành"],
        ["Tích hợp AI hỗ trợ biên tập (Gemini AI)", "Tích hợp Gemini API trong form tạo bài viết. Sinh gợi ý nội dung dựa trên từ khóa tiếng Việt. Nội dung có thể chỉnh sửa trước khi lưu.", "✓ Hoàn thành"],
        ["Kiến trúc REST API, tách biệt frontend-backend", "Backend Express.js chuẩn REST với 9 nhóm route. Frontend React hoàn toàn độc lập. Dễ bảo trì và mở rộng.", "✓ Hoàn thành"],
        ["Quản lý ảnh qua Cloudinary", "Upload, lưu trữ và phân phối ảnh qua CDN. Không lưu file nhị phân trên máy chủ ứng dụng.", "✓ Hoàn thành"],
        ["Tiện ích xuất giấy mời/chứng chỉ hàng loạt", "Đọc file Excel, render tên lên ảnh template, xuất ZIP. Xử lý thành công danh sách nhiều người.", "✓ Hoàn thành"],
      ],
      [2800, 3800, 1600]
    ),
    emptyLine(),
    body("Về website công khai, giao diện hiển thị tốt trên nhiều kích thước màn hình, thao tác điều hướng mượt mà và thời gian tải trang ở mức chấp nhận được. Sinh viên và giảng viên có thể dễ dàng tìm thấy thông tin qua cấu trúc menu rõ ràng và tính năng lọc theo danh mục."),
    body("Về hệ thống quản trị, chức năng tạo và xuất bản bài viết hoạt động ổn định với quy trình duyệt rõ ràng. Tính năng hỗ trợ biên tập bằng Gemini AI tạo ra nội dung gợi ý phù hợp với chủ đề tiếng Việt, giúp rút ngắn thời gian chuẩn bị nội dung. Tiện ích tạo giấy mời/chứng chỉ hàng loạt xử lý thành công danh sách nhiều người trong thời gian ngắn."),
    body("Về kiến trúc kỹ thuật, hệ thống triển khai theo mô hình tách biệt frontend – backend rõ ràng, giao tiếp qua REST API chuẩn hóa. Cơ chế xác thực JWT và phân quyền theo vai trò hoạt động đúng và tin cậy. Schema cơ sở dữ liệu có cấu trúc, dễ truy vấn và có thể mở rộng thêm trong tương lai."),
    emptyLine(),
    caption("Bảng 4.2: Kết quả kiểm thử các chức năng chính"),
    makeTable(
      ["Chức năng kiểm thử", "Kịch bản", "Kết quả mong đợi", "Kết quả thực tế"],
      [
        ["Đăng nhập", "Nhập đúng username/password", "Chuyển hướng đến Dashboard", "Đạt"],
        ["Đăng nhập", "Nhập sai mật khẩu", "Hiển thị thông báo lỗi", "Đạt"],
        ["Tạo bài viết", "Nhập đủ trường bắt buộc, lưu nháp", "Bài xuất hiện trong danh sách nháp", "Đạt"],
        ["Xuất bản bài viết", "Admin đổi trạng thái → Published", "Bài hiển thị trên website công khai", "Đạt"],
        ["Gợi ý AI", "Nhập từ khóa tiếng Việt", "Trả về nội dung gợi ý liên quan", "Đạt"],
        ["Upload ảnh", "Chọn file JPG/PNG", "Nhận URL ảnh từ Cloudinary", "Đạt"],
        ["Gửi liên hệ", "Điền đủ họ tên, email, nội dung", "Lưu bản ghi, hiển thị thông báo thành công", "Đạt"],
        ["Phân quyền", "Editor cố truy cập chức năng Admin", "Bị từ chối, trả 403 Forbidden", "Đạt"],
        ["Xuất chứng chỉ", "Tải template + file Excel 10 tên", "Tạo file ZIP chứa 10 ảnh cá nhân", "Đạt"],
        ["Lọc bài viết", "Lọc theo danh mục và từ khóa", "Kết quả khớp đúng điều kiện lọc", "Đạt"],
      ],
      [2200, 2200, 2200, 1600]
    ),

    h2("4.3. Định hướng phát triển"),
    body("Mặc dù hệ thống đã đáp ứng được các yêu cầu cốt lõi trong phạm vi đề tài, vẫn còn nhiều không gian để tiếp tục hoàn thiện và mở rộng. Nhóm nghiên cứu đề xuất các định hướng phát triển sau:"),
    body("Thứ nhất, nâng cao bảo mật hệ thống: Triển khai mã hóa mật khẩu mạnh hơn (bcrypt với cost factor cao hơn), bổ sung xác thực hai yếu tố (2FA) cho tài khoản quản trị, thiết lập rate limiting để phòng chống brute force, và bắt buộc HTTPS khi triển khai production."),
    body("Thứ hai, triển khai trên môi trường thực tế: Đưa hệ thống lên máy chủ chính thức với tên miền riêng của Liên Chi đoàn Khoa CNTT, thiết lập backup dữ liệu định kỳ và hệ thống monitoring để đảm bảo tính sẵn sàng liên tục."),
    body("Thứ ba, mở rộng tính năng tìm kiếm nâng cao: Tích hợp full-text search hỗ trợ tiếng Việt, cho phép người dùng tìm kiếm trong toàn bộ nội dung hệ thống với kết quả được xếp hạng theo mức độ liên quan."),
    body("Thứ tư, bổ sung thống kê và báo cáo: Xây dựng module thống kê dữ liệu cho cán bộ quản trị, bao gồm biểu đồ lượt truy cập theo thời gian, bài viết được xem nhiều nhất và xu hướng tương tác người dùng."),
    body("Thứ năm, nhân rộng mô hình: Chuẩn hóa và tài liệu hóa quy trình triển khai để áp dụng cho các Liên Chi đoàn khoa khác trong trường Đại học Kinh tế Quốc dân."),
    body("Thứ sáu, nâng cấp tính năng AI: Mở rộng ứng dụng Gemini AI sang các nghiệp vụ khác như tự động tóm tắt nội dung dài, gợi ý danh mục phù hợp, phân tích sentiment phản hồi liên hệ và hỗ trợ trả lời tự động câu hỏi thường gặp."),
    body("Thứ bảy, tích hợp đăng nhập SSO: Nghiên cứu tích hợp đăng nhập một lần (SSO) qua hệ thống tài khoản của Đại học Kinh tế Quốc dân, giúp cán bộ không cần quản lý thêm tài khoản riêng."),
    emptyLine(),
    new Paragraph({ children: [new TextRun({ text: "Tóm tắt Chương 4: ", font: TNR, size: SZ, bold: true }), new TextRun({ text: "Chương 4 đã trình bày chi tiết quá trình xây dựng hệ thống theo đúng thiết kế Chương 3. Toàn bộ 7 mục tiêu ban đầu đều đạt. Kết quả kiểm thử 10 kịch bản chính cho thấy hệ thống hoạt động đúng và đáng tin cậy. Các định hướng phát triển tiếp theo được đề xuất nhằm nâng cao bảo mật, mở rộng chức năng và triển khai thực tế.", font: TNR, size: SZ, italics: true })] }),
    pageBreak()
  ];
}

// --------- KET LUAN ---------
function ketLuan() {
  return [
    h1("KẾT LUẬN"),
    emptyLine(),
    body("Đề tài \"Xây dựng website Liên Chi đoàn Khoa\" đã được thực hiện thành công với mục tiêu số hóa hoạt động truyền thông và quản lý thông tin của Liên Chi đoàn Khoa Công nghệ Thông tin, Đại học Kinh tế Quốc dân."),
    body("Qua quá trình thực hiện, đề tài đã đạt được các kết quả chính sau: Xây dựng website công khai với 7 trang thông tin đầy đủ, giao diện responsive trên mọi thiết bị; Xây dựng hệ thống quản trị với đầy đủ chức năng quản lý nội dung, phân quyền theo 4 vai trò; Tích hợp Gemini AI hỗ trợ biên tập nội dung tiếng Việt; Triển khai tiện ích xuất giấy mời/chứng chỉ hàng loạt; Áp dụng kiến trúc REST API tách biệt frontend-backend, dễ mở rộng và bảo trì."),
    body("Hệ thống đã giải quyết trực tiếp bài toán thực tiễn: thay thế phương thức truyền thông phân tán qua mạng xã hội bằng một nền tảng số hóa tập trung, chuyên nghiệp. Kết quả khảo sát ban đầu với 95% người dùng có nhu cầu và kết quả kiểm thử 100% kịch bản đạt cho thấy tính đúng đắn của hướng tiếp cận."),
    body("Trong quá trình thực hiện, nhóm đã tích lũy được nhiều kinh nghiệm thực tiễn về phân tích và thiết kế hệ thống theo phương pháp luận có cấu trúc, phát triển full-stack với bộ công nghệ ReactJS, Node.js, Express.js, MySQL, và tích hợp các dịch vụ cloud (Cloudinary, Gemini AI)."),
    body("Mặc dù còn một số hạn chế như chưa triển khai trên môi trường production, chưa có tính năng tìm kiếm toàn văn và hệ thống thống kê nâng cao, những định hướng phát triển đã được đề xuất cụ thể cho các giai đoạn tiếp theo. Nhóm tin rằng sản phẩm có tiềm năng được nhân rộng cho các Liên Chi đoàn khoa khác trong toàn trường."),
    pageBreak()
  ];
}

// --------- TAI LIEU THAM KHAO ---------
function taiLieuThamKhao() {
  return [
    h1("TÀI LIỆU THAM KHẢO"),
    emptyLine(),
    bodyNoIndent("[1] Dennis, A., Wixom, B. H., & Roth, R. M. (2015). Systems Analysis and Design (6th ed.). Wiley."),
    bodyNoIndent("[2] Fowler, M. (2018). Refactoring: Improving the Design of Existing Code (2nd ed.). Addison-Wesley Professional."),
    bodyNoIndent("[3] React Documentation. (2024). React – A JavaScript library for building user interfaces. Meta Platforms. https://react.dev"),
    bodyNoIndent("[4] Node.js Foundation. (2024). Node.js Documentation. https://nodejs.org/docs/"),
    bodyNoIndent("[5] Express.js. (2024). Express – Fast, unopinionated, minimalist web framework for Node.js. https://expressjs.com"),
    bodyNoIndent("[6] MySQL. (2024). MySQL 8.0 Reference Manual. Oracle Corporation. https://dev.mysql.com/doc/refman/8.0/en/"),
    bodyNoIndent("[7] Cloudinary. (2024). Cloudinary Documentation – Image and Video Management. https://cloudinary.com/documentation"),
    bodyNoIndent("[8] Google AI. (2024). Gemini API Documentation. Google DeepMind. https://ai.google.dev/docs"),
    bodyNoIndent("[9] Fielding, R. T. (2000). Architectural Styles and the Design of Network-based Software Architectures. Doctoral Dissertation, University of California, Irvine."),
    bodyNoIndent("[10] Auth0. (2024). JSON Web Tokens – Introduction. https://jwt.io/introduction"),
    bodyNoIndent("[11] Vite. (2024). Vite Documentation – Next Generation Frontend Tooling. https://vitejs.dev"),
    bodyNoIndent("[12] Sommerville, I. (2016). Software Engineering (10th ed.). Pearson Education."),
    bodyNoIndent("[13] Martin, R. C. (2017). Clean Architecture: A Craftsman's Guide to Software Structure and Design. Prentice Hall."),
    bodyNoIndent("[14] Pressman, R. S., & Maxim, B. R. (2019). Software Engineering: A Practitioner's Approach (9th ed.). McGraw-Hill Education."),
    pageBreak()
  ];
}

// --------- BUILD DOCUMENT ---------
const allChildren = [
  ...coverPage(),
  ...loiCamDoan(),
  ...loiCamOn(),
  ...danhMucTuVietTat(),
  ...moDau(),
  ...chuong1(),
  ...chuong2(),
  ...chuong3(),
  ...chuong4(),
  ...ketLuan(),
  ...taiLieuThamKhao(),
];

const doc = new Document({
  styles: STYLES,
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "-", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: PAGE_MARGINS
      }
    },
    footers: { default: footer },
    children: allChildren
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/mnt/user-data/outputs/Bao_cao_KLTN_HoanThien.docx', buffer);
  console.log('Done! File saved to /mnt/user-data/outputs/Bao_cao_KLTN_HoanThien.docx');
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});