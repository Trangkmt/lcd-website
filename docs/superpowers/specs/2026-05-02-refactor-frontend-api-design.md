# Frontend API Refactoring Design

## 1. Mục tiêu
- Clean code cho file `src/services/api.js` ở frontend.
- Loại bỏ hoàn toàn các phương thức API không được dùng đến trong frontend để giảm thiểu code rác (dead code).
- Cập nhật lại tài liệu `API-DOCUMENTATION.md` ở backend cho đồng bộ.
- Đưa bảng `teams` về trạng thái read-only (chỉ cho phép truy vấn, không cho phép sửa đổi dữ liệu).

## 2. Chi tiết refactoring `src/services/api.js`
- Giữ nguyên hàm `apiFetch` hiện có.
- **`teamsAPI`**: Chỉ giữ lại `getAll` và `getById`. Xóa bỏ `create`, `update`, `delete`.
- **`usersAPI`**: Giữ `getPublic`, `getAll`, `create`, `update`. Xóa `getById`, `delete`.
- **`categoriesAPI`**: Giữ `getAll`, `getBySlug`, `create`, `update`, `delete`. Xóa `getById`.
- **`contactAPI`**: Giữ `getAll`, `create`, `markAsRead`, `markAsReplied`, `delete`. Xóa `getById`.
- **`postTemplatesAPI`**: Giữ `getAll`, `create`. Xóa `update`, `delete`.

## 3. Chi tiết dọn dẹp Backend
### a. Controller (`controllers/teamsController.js`)
- Giữ lại `getAllTeams` và `getTeamById`.
- Xóa bỏ `createTeam`, `updateTeam`, và `deleteTeam`.
- Dọn dẹp các import helper không còn sử dụng (như `sendBadRequest`, `hasAffectedRows` nếu chỉ dùng trong các hàm bị xóa).

### b. Routes (`routes/teams.js`)
- Gỡ bỏ các route `POST`, `PUT`, `DELETE` đối với `/api/teams`.

## 4. Cập nhật `API-DOCUMENTATION.md`
- Xóa bỏ hoàn toàn các thông tin về POST, PUT, DELETE đối với `/api/teams`.
- Cập nhật thêm ghi chú *(Hiện không sử dụng trên Frontend)* đối với các endpoints khác không còn gọi từ Frontend.

## 5. Rủi ro và Đảm bảo
- Đã thực hiện kiểm tra `grep` trên toàn bộ source code frontend và xác nhận các phương thức bị xóa hoàn toàn không được gọi ở bất cứ đâu.
- Đảm bảo tính nhất quán giữa Frontend, Backend và Tài liệu.
