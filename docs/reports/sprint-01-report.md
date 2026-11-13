# Báo cáo Tổng kết Sprint 01 (Sprint 01 Completion Report)
## Dự án: Hệ thống Quản trị Kinh doanh - Công ty ABC Logistics (`ABC Business Management`)

| Thuộc tính | Nội dung chi tiết |
| :--- | :--- |
| **Tên dự án** | Hệ thống Quản trị Kinh doanh - Công ty ABC Logistics (`ABC Business Management`) |
| **Thuộc giai đoạn** | **Sprint 01** (Khởi tạo nền tảng kiến trúc & Hiện thực hóa `PB-01`) |
| **Hạng mục Product Backlog** | `PB-01` - Tạo và lưu hợp đồng mới ở trạng thái `Draft` |
| **Điểm độ phức tạp (Story Points)** | **8 SP** |
| **Tổng khối lượng công việc** | **19 Tasks** (`TASK-01` đến `TASK-19`) - **99 giờ công (99h)** |
| **Liên kết GitHub Issues** | Issue cha `#1` (`PB-01`), các Issue công việc `#2` đến `#20` (`TASK-01..TASK-19`) |
| **Người lập báo cáo** | Nguyễn Khả Như (`KN12345N`) - Phân tích Nghiệp vụ (BA) & Quản lý Dự án (PM) |
| **Trạng thái Sprint** | **HOÀN THÀNH 100% (19/19 Tasks - 8/8 Story Points)** |

---

## 1. Mục tiêu Sprint 01 (Sprint Goal)

Sprint 01 là chặng mở đầu của lộ trình 8 Sprints trong dự án **ABC Business Management**, tập trung giải quyết đồng thời hai mục tiêu trọng tâm:

1. **Mục tiêu Kỹ thuật & Kiến trúc Nền tảng**:
   - Thiết lập cấu trúc kho mã nguồn chuẩn (`docs/`, `backend/`, `frontend/`, `tests/`), bảng quản lý công việc GitHub Projects và quy trình tích hợp liên tục (`GitHub Actions CI`).
   - Xây dựng khung kiến trúc phân lớp cho Backend (`.NET 10 Web API`, `EF Core 10`, `PostgreSQL`, chuẩn hóa phản hồi lỗi RFC 7807 `ProblemDetails`) và khung giao diện chuẩn cho Frontend (`React 18`, `TypeScript`, `Vite`, `Tailwind CSS`, `shadcn/ui`, `React Hook Form`, `Zod`) theo đúng bộ quy chuẩn **UI/UX Design System** của dự án.

2. **Mục tiêu Nghiệp vụ (`PB-01` - 8 Story Points)**:
   - Cho phép **Nhân viên Kinh doanh** khởi tạo hợp đồng dịch vụ logistics mới cho khách hàng đang hoạt động (`status = 'Active'`), kiểm tra chặt chẽ các điều khoản thương mại, tự động cấp mã hợp đồng duy nhất theo quy tắc `HD-YYYY-NNN` (có chống đụng độ khi gửi đồng thời), lưu ở trạng thái `Draft` và hỗ trợ quy trình **lưu 2 bước kèm tải tệp đính kèm** (`.pdf`, `.docx`, `.xlsx`, tối đa `20 MB/tệp`) với cơ chế phục hồi lỗi từng phần (**"Thử tải lại tệp"**).

---

## 2. Bảng Theo dõi Trạng thái Hoàn thành 19 Công việc (`TASK-01` .. `TASK-19`)

Toàn bộ 19 công việc của Sprint 01 đã được triển khai theo 6 chặng tuần tự - song song, gắn kết trực tiếp với 19 Issues trên GitHub (`#2` đến `#20`, thuộc Issue cha `#1`):

| Mã Task | GitHub Issue | Tên công việc chi tiết | Phụ trách | Chặng | Ngày BĐ thực tế | Ngày KT thực tế | Giờ ước lượng | Giờ thực tế | Trạng thái | Sản phẩm bàn giao chính (Deliverables) |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `TASK-01` | `#2` | Thiết lập cấu trúc GitHub Repository, nhánh làm việc, `.gitignore` và bảng theo dõi công việc Sprint 01 | Trần Ngọc Long (`LONGTRAN2700`) | Chặng 1 | 03/11/2026 | 03/11/2026 | 4h | 4h | **Done** | Cấu trúc repo, `.gitignore`, 20 GitHub Issues (`#1..#20`) |
| `TASK-02` | `#3` | Phân tích chi tiết User Story `PB-01`, quy tắc nghiệp vụ (`BR-01..BR-06`) và chốt API Contract | Nguyễn Khả Như (`KN12345N`) | Chặng 1 | 03/11/2026 | 03/11/2026 | 4h | 4h | **Done** | `docs/specs/PB-01-create-contract-spec.md` |
| `TASK-03` | `#4` | Thiết kế mô hình Use Case UML và đặc tả kịch bản sử dụng cho chức năng tạo hợp đồng `Draft` | Nguyễn Khả Như (`KN12345N`) | Chặng 2 | 04/11/2026 | 04/11/2026 | 5h | 5h | **Done** | `docs/uml/use-case-PB01.md` |
| `TASK-04` | `#5` | Khởi tạo Solution Backend .NET 10 Web API phân lớp (`Domain`, `Application`, `Infrastructure`, `Api`), cấu hình PostgreSQL, CORS & Swagger | Lê Quang Linh (`linh285`) | Chặng 1 | 03/11/2026 | 03/11/2026 | 8h | 8h | **Done** | `backend/AbcBusinessManagement.sln` và 4 projects cốt lõi |
| `TASK-05` | `#6` | Thiết kế thực thể (`Customer`, `Contract`, `ContractAttachment`), cấu hình EF Core, tạo Migration và nạp dữ liệu khách hàng mẫu (Seed Data) | Lê Quang Linh (`linh285`) | Chặng 2 | 04/11/2026 | 04/11/2026 | 8h | 8h | **Done** | `ApplicationDbContext`, Migration `InitContractDraftSchema`, Seed 3 KH, `Infrastructure.Tests` (15 tests) |
| `TASK-06` | `#7` | Xây dựng Middleware xử lý lỗi tập trung chuẩn RFC 7807 (`ProblemDetails` / `ValidationProblemDetails`) và Request Logging có `traceId` | Lê Quang Linh (`linh285`) | Chặng 2 | 04/11/2026 | 04/11/2026 | 3h | 3h | **Done** | `GlobalExceptionHandler.cs`, `RequestLoggingMiddleware.cs`, `Api.Tests` (13 tests) |
| `TASK-07` | `#8` | Thiết kế sơ đồ Lớp (Class Diagram) và sơ đồ Tuần tự (Sequence Diagrams) cho luồng tạo hợp đồng 2 bước | Thạch Ý (`ThachY-23120411`) | Chặng 3 | 04/11/2026 | 04/11/2026 | 6h | 6h | **Done** | `docs/uml/class-sequence-PB01.md` |
| `TASK-08` | `#9` | Hiện thực hóa API Tạo hợp đồng `Draft` (`POST /api/contracts`) và Xem chi tiết (`GET /api/contracts/{id}`), sinh mã `HD-YYYY-NNN` + retry 3 lần | Thạch Ý (`ThachY-23120411`) | Chặng 3 | 04/11/2026 | 04/11/2026 | 8h | 8h | **Done** | `ContractsController.cs`, `ContractService.cs`, `CreateContractValidator.cs`, `AuditConstants.cs` |
| `TASK-09` | `#10` | Hiện thực hóa API Lấy danh sách khách hàng (`GET /api/customers`) và Tải tệp đính kèm (`POST /api/contracts/{id}/attachments`) | Thạch Ý (`ThachY-23120411`) | Chặng 3 | 04/11/2026 | 04/11/2026 | 5h | 5h | **Done** | `CustomersController.cs`, `CustomerService.cs`, `ContractAttachmentService.cs` |
| `TASK-10` | `#11` | Thiết kế giao diện Figma 6 màn hình của Sprint 01 và lập tài liệu đặc tả UI/UX Design Spec | Trần Ngọc Long (`LONGTRAN2700`) | Chặng 2 | 04/11/2026 | 04/11/2026 | 6h | 6h | **Done** | `docs/design/sprint-01/01_..06_.png`, `UI-UX-Design-Spec-PB01.md` |
| `TASK-11` | `#12` | Khởi tạo dự án Frontend (`React + TypeScript + Vite + Tailwind CSS + shadcn/ui`), xây dựng khung App Shell (`Sidebar 240px`, `Header 64px`, `Dashboard`) | Trần Ngọc Long (`LONGTRAN2700`) | Chặng 1 | 03/11/2026 | 03/11/2026 | 4h | 4h | **Done** | `frontend/` App Shell, `Sidebar.tsx`, `Header.tsx`, `DashboardPage.tsx` |
| `TASK-12` | `#13` | Xây dựng màn hình Tạo hợp đồng mới (`CreateContractPage`), tích hợp API, kiểm tra dữ liệu bằng Zod và quy trình lưu 2 bước + nút **"Thử tải lại tệp"** | Trần Ngọc Long (`LONGTRAN2700`) | Chặng 4 | 05/11/2026 | 05/11/2026 | 9h | 9h | **Done** | `CreateContractPage.tsx`, `AttachmentDropzone.tsx`, `contractSchema.ts`, `contractService.ts`, `contractSchema.test.cjs` |
| `TASK-13` | `#14` | Thiết kế bộ kịch bản kiểm thử chi tiết (`Test Cases Specification`) bao phủ `AC-01..AC-08` và `BR-01..BR-06` | Đặng Hữu Phú (`PhuHuuDang`) | Chặng 2 | 04/11/2026 | 04/11/2026 | 5h | 5h | **Done** | `docs/testing/test-cases-PB01.md` |
| `TASK-14` | `#15` | Viết Unit Tests (`24 tests`) và Integration Tests (`26 tests` với PostgreSQL thật) cho toàn bộ nghiệp vụ và API của `PB-01` | Đặng Hữu Phú (`PhuHuuDang`) | Chặng 4 | 05/11/2026 | 05/11/2026 | 6h | 6h | **Done** | `tests/backend/AbcBusinessManagement.UnitTests/`, `tests/backend/AbcBusinessManagement.IntegrationTests/` |
| `TASK-15` | `#16` | Thiết lập GitHub Actions CI Workflow tự động build và chạy kiểm thử Backend (.NET 10 + PostgreSQL) & Frontend (Vite + Node 22) | Đặng Hữu Phú (`PhuHuuDang`) | Chặng 2 & 4 | 04/11/2026 | 04/11/2026 | 4h | 4h | **Done** | `.github/workflows/ci.yml` |
| `TASK-16` | `#17` | Thực hiện kiểm thử End-to-End (E2E), kiểm tra tính bền vững dữ liệu sau khi khởi động lại dịch vụ và lập Báo cáo kiểm thử Sprint 01 | Đặng Hữu Phú (`PhuHuuDang`) | Chặng 5 | 05/11/2026 | 05/11/2026 | 4h | 4h | **Done** | `docs/testing/test-report-sprint-01.md` |
| `TASK-17` | `#18` | Biên soạn tài liệu `README.md` hướng dẫn cài đặt môi trường, khởi tạo PostgreSQL, chạy Migration/Seed, chạy ứng dụng và chạy bộ kiểm thử | Nguyễn Khả Như (`KN12345N`) | Chặng 4 | 05/11/2026 | 05/11/2026 | 3h | 3h | **Done** | `README.md` |
| `TASK-18` | `#19` | Tổng hợp kết quả thực hiện và lập Báo cáo Tổng kết Sprint 01 (`Sprint 01 Completion Report`) | Nguyễn Khả Như (`KN12345N`) | Chặng 6 | 05/11/2026 | 05/11/2026 | 4h | 4h | **Done** | `docs/reports/sprint-01-report.md` |
| `TASK-19` | `#20` | Tổ chức nghiệm thu nội bộ và lập Biên bản họp Sprint Review & Sprint Retrospective cho Sprint 01 | Nguyễn Khả Như (`KN12345N`) | Chặng 6 | 05/11/2026 | 05/11/2026 | 3h | 3h | **Done** | `docs/reports/sprint-01-review-retrospective.md` |
| **Tổng** | **#1..#20** | **Toàn bộ 19 công việc của Sprint 01 (`PB-01`)** | **5 thành viên** | **6 Chặng** | **03/11/2026** | **05/11/2026** | **99h** | **99h** | **100% Done** | **Đầy đủ tài liệu, mã nguồn FE/BE/DB và bộ kiểm thử tự động** |

---

## 3. Thống kê Đóng góp & Khối lượng Công việc theo Thành viên

| STT | Họ và tên thành viên | Tài khoản GitHub | Vai trò đảm nhiệm trong Sprint 01 | Các Task phụ trách | Số lượng Task | Tổng số giờ (Hours) | Tỷ trọng nỗ lực |
| :-: | :--- | :--- | :--- | :--- | :-: | :-: | :-: |
| 1 | **Trần Ngọc Long** | `LONGTRAN2700` | Thiết lập Repo/Board, Thiết kế UI/UX Figma, Phát triển Frontend React | `TASK-01, 10, 11, 12` | 4 | **23h** | 23.23% |
| 2 | **Nguyễn Khả Như** | `KN12345N` | Phân tích Nghiệp vụ (BA), Thiết kế Use Case UML, Tài liệu Dự án & Quản lý Sprint (PM) | `TASK-02, 03, 17, 18, 19` | 5 | **19h** | 19.19% |
| 3 | **Lê Quang Linh** | `linh285` | Kiến trúc Backend Core, Thiết kế CSDL PostgreSQL, Migration/Seed Data & Xử lý lỗi `ProblemDetails` | `TASK-04, 05, 06` | 3 | **19h** | 19.19% |
| 4 | **Thạch Ý** | `ThachY-23120411` | Thiết kế Class/Sequence Diagram, Xây dựng RESTful APIs Hợp đồng, Khách hàng & Tải tệp đính kèm | `TASK-07, 08, 09` | 3 | **19h** | 19.19% |
| 5 | **Đặng Hữu Phú** | `PhuHuuDang` | Thiết kế Test Cases, Phát triển Unit/Integration Tests, Cấu hình GitHub Actions CI & Kiểm thử E2E | `TASK-13, 14, 15, 16` | 4 | **19h** | 19.19% |
| **Tổng** | **5 thành viên** | `zero-seven-team` | **Phối hợp liên chức năng (Cross-functional Scrum Team)** | **`TASK-01` .. `TASK-19`** | **19** | **99h** | **100%** |

---

## 4. Biểu đồ Tiến độ (Sprint Burndown) & Vận tốc Nhóm (Velocity)

### 4.1. Tiến độ Giải quyết Công việc theo 6 Chặng (Wave Execution Summary)

| Chặng thực hiện | Các Task hoàn thành trong chặng | Số Task hoàn thành | Giờ công hoàn thành | Giờ công còn lại (Remaining Effort) | Tỷ lệ hoàn thành tích lũy |
| :--- | :--- | :-: | :-: | :-: | :-: |
| **Khởi đầu Sprint** | - | 0 | 0h | **99h** | 0.0% |
| **Chặng 1 (Khởi tạo & Đặc tả)** | `TASK-01` (4h), `TASK-02` (4h), `TASK-04` (8h), `TASK-11` (4h) | 4 | 20h | **79h** | 20.2% |
| **Chặng 2 (Thiết kế, DB, Middleware & Test Cases)** | `TASK-03` (5h), `TASK-05` (8h), `TASK-06` (3h), `TASK-10` (6h), `TASK-13` (5h), `TASK-15` (4h) | 6 | 31h | **48h** | 51.5% |
| **Chặng 3 (UML Kỹ thuật & Backend APIs)** | `TASK-07` (6h), `TASK-08` (8h), `TASK-09` (5h) | 3 | 19h | **29h** | 70.7% |
| **Chặng 4 (Ghép nối Frontend, Auto Tests & README)** | `TASK-12` (9h), `TASK-14` (6h), `TASK-17` (3h) | 3 | 18h | **11h** | 88.9% |
| **Chặng 5 (Kiểm thử E2E & Báo cáo QA)** | `TASK-16` (4h) | 1 | 4h | **7h** | 92.9% |
| **Chặng 6 (Tổng kết Sprint, Review & Retro)** | `TASK-18` (4h), `TASK-19` (3h - hoàn tất nghiệm thu) | 2 | 7h | **0h** | **100.0%** |

### 4.2. Chỉ số Vận tốc (Sprint Velocity) & Chất lượng Kỹ thuật
- **Cam kết đầu Sprint (Committed Velocity)**: `8 Story Points` (`PB-01`) / `99 giờ`.
- **Hoàn thành thực tế (Completed Velocity)**: `8 Story Points` (`100%`).
- **Tổng số bài kiểm thử tự động đã xây dựng**: **81 bài kiểm thử** (`24` Unit Tests + `13` API Error Tests + `15` Infrastructure Schema Tests + `26` PostgreSQL Integration Tests + `3` Frontend Schema Regression Tests) - **Tỷ lệ vượt qua: 100% (81/81 Pass)**.

---

## 5. Tổng kết Các Hạng mục Kỹ thuật Đã Bàn giao (Technical Deliverables Summary)

1. **Tài liệu Phân tích, Thiết kế & Mô hình hóa (`docs/`)**:
   - Đặc tả chi tiết User Story & RESTful API Contract: `docs/specs/PB-01-create-contract-spec.md` (`TASK-02`).
   - Mô hình Use Case UML & kịch bản nghiệp vụ: `docs/uml/use-case-PB01.md` (`TASK-03`).
   - Sơ đồ Lớp (Class Diagram) & 4 sơ đồ Tuần tự (Sequence Diagrams): `docs/uml/class-sequence-PB01.md` (`TASK-07`).
   - Bộ 6 màn hình thiết kế Figma chuẩn & tài liệu đặc tả giao diện: `docs/design/sprint-01/UI-UX-Design-Spec-PB01.md` (`TASK-10`).

2. **Nền tảng Cơ sở dữ liệu & Backend Web API (`backend/`)**:
   - Cấu trúc CSDL PostgreSQL gồm 3 bảng `customers`, `contracts`, `contract_attachments` với đầy đủ khóa ngoại, chỉ mục duy nhất `ux_contracts_contract_code`, 8 ràng buộc `CHECK constraints` bảo vệ toàn vẹn dữ liệu ở cấp CSDL và dữ liệu mẫu 3 khách hàng (`TASK-05`).
   - Cơ chế xử lý ngoại lệ tập trung (`GlobalExceptionHandler`) trả về đúng chuẩn RFC 7807 (`application/problem+json`) kèm `errorCode`, `traceId` và `RequestLoggingMiddleware` không ghi lộ thông tin nhạy cảm (`TASK-06`).
   - Bộ 4 RESTful API endpoints (`GET /api/customers`, `POST /api/contracts`, `GET /api/contracts/{id}`, `POST /api/contracts/{id}/attachments`) với thuật toán cấp mã `HD-YYYY-NNN` tự động retry tối đa 3 lần khi gặp xung đột `PostgresException 23505` và cơ chế gán cứng danh tính kiểm toán phía Server `"NV-KD-001 | Nguyễn Văn An"` (`TASK-08`, `TASK-09`).

3. **Ứng dụng Giao diện Web Frontend (`frontend/`)**:
   - Khung giao diện chuẩn hệ thống quản trị doanh nghiệp (`Sidebar` cố định `240px` màu `#0F172A`, `Header` `64px`, bảng màu và lưới `8px` đồng nhất với Figma) (`TASK-11`).
   - Màn hình **Tạo hợp đồng mới** (`CreateContractPage.tsx`) kết hợp `AttachmentDropzone.tsx`, kiểm tra dữ liệu bằng `contractSchema.ts` (bảo toàn độ chính xác số thập phân `DECIMAL(18,2)`), thực thi quy trình lưu 2 bước tách biệt và hiển thị chế độ phục hồi lỗi từng phần với nút **"Thử tải lại tệp"** khi Bước 2 gặp sự cố (`TASK-12`).

4. **Hệ thống Kiểm thử Tự động, CI/CD & Tài liệu Hướng dẫn (`tests/`, `.github/`, `README.md`)**:
   - Bộ 25 kịch bản kiểm thử (`docs/testing/test-cases-PB01.md` & `docs/testing/test-report-sprint-01.md`), 81 automated tests chạy ổn định trên pipeline `.github/workflows/ci.yml` và tài liệu `README.md` hướng dẫn chi tiết từng bước cài đặt, chạy ứng dụng và kiểm thử (`TASK-13, 14, 15, 16, 17`).
