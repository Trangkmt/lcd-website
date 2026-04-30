# Biểu đồ Kiến trúc Hệ thống (Architecture Diagrams)

Tài liệu này chứa các biểu đồ kiến trúc cấp cao của hệ thống Web LCD, được xây dựng dựa trên tiêu chuẩn Phân tích Thiết kế Hệ thống (PTTKHT).

---

### 1. Biểu đồ Gói (Package Diagram)

Biểu đồ này thể hiện cấu trúc phân tầng và sự phụ thuộc giữa các thành phần logic trong codebase (Frontend React và Backend Node.js).

```mermaid
classDiagram
    namespace Frontend_App {
        class Pages ["Pages (UI Screens)"]
        class Components ["Reusable Components"]
        class Services ["API Services (Axios)"]
        class Contexts ["State Management"]
    }

    namespace Backend_API {
        class Routes ["API Routes"]
        class Controllers ["Business Logic"]
        class Middleware ["Auth & Validation"]
        class Database_Layer ["Connection & Queries"]
    }

    namespace Persistence {
        class SQL_Server ["SQL Server Database"]
        class Cloudinary_Storage ["Cloudinary (Images)"]
    }

    Pages ..> Components : use
    Pages ..> Services : fetch data
    Services ..> Routes : HTTP Request
    Routes ..> Controllers : dispatch
    Controllers ..> Middleware : verify
    Controllers ..> Database_Layer : query
    Database_Layer ..> SQL_Server : persistence
    Controllers ..> Cloudinary_Storage : upload assets
```

---

### 2. Biểu đồ Triển khai (Deployment Diagram)

Biểu đồ này mô tả môi trường vận hành vật lý của hệ thống, bao gồm các thiết bị đầu cuối, máy chủ ứng dụng và máy chủ cơ sở dữ liệu.

```mermaid
flowchart TD
    subgraph Client_Node ["Thiết bị Người dùng (Client Node)"]
        Browser["Web Browser (Chrome/Edge/Firefox)"]
        Runtime_JS["JavaScript Runtime (V8)"]
    end

    subgraph App_Server ["Máy chủ Ứng dụng (Web Server Node)"]
        NodeJS["Node.js Runtime"]
        ExpressApp["Express.js Server"]
        ViteStatic["Vite (Static Assets Server)"]
    end

    subgraph DB_Server ["Máy chủ Dữ liệu (Database Server Node)"]
        MSSQL["Microsoft SQL Server Engine"]
        Storage["Disk Storage (Database Files)"]
    end

    subgraph External_Cloud ["Dịch vụ Đám mây (External Services)"]
        Cloudinary["Cloudinary API (Storage)"]
        AIService["AI API Service (Gemini/OpenAI)"]
    end

    Browser -- "HTTP/HTTPS (REST API)" --> ExpressApp
    Browser -- "HTTP (Static Content)" --> ViteStatic
    ExpressApp -- "TDS Protocol (Port 1433)" --> MSSQL
    ExpressApp -- "HTTPS/JSON" --> AIService
    ExpressApp -- "HTTPS/API Key" --> Cloudinary
    MSSQL -- "I/O" --> Storage
```

---

**Ghi chú:**
- **Package Diagram:** Thể hiện sự tách biệt giữa tầng Giao diện (Frontend) và tầng Xử lý (Backend).
- **Deployment Diagram:** Thể hiện mô hình 3 lớp (3-Tier Architecture) truyền thống với sự hỗ trợ của các dịch vụ Cloud bên thứ ba.
