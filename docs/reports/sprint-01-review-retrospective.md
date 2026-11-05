# Biên bản Họp Sprint Review & Sprint Retrospective - Sprint 01
## Dự án: Hệ thống Quản trị Kinh doanh - Công ty ABC Logistics (`ABC Business Management`)

| Thuộc tính | Nội dung chi tiết |
| :--- | :--- |
| **Giai đoạn nghiệm thu** | **Sprint 01** (`PB-01`: Tạo và lưu hợp đồng mới ở trạng thái `Draft` - 8 Story Points) |
| **Mã công việc (Task)** | `TASK-19` - Tổ chức nghiệm thu và lập biên bản Sprint Review & Sprint Retrospective cho Sprint 01 |
| **Liên kết GitHub Issues** | Issue `#1` (`PB-01`), Issue `#20` (`TASK-19`) |
| **Người chủ trì & thư ký** | Nguyễn Khả Như (`KN12345N`) - Phân tích Nghiệp vụ (BA) & Quản lý Dự án (PM) |
| **Thành viên tham dự** | Trần Ngọc Long (`LONGTRAN2700`), Nguyễn Khả Như (`KN12345N`), Lê Quang Linh (`linh285`), Thạch Ý (`ThachY-23120411`), Đặng Hữu Phú (`PhuHuuDang`) |
| **Kết quả nghiệm thu** | **ĐỒNG Ý NGHIỆM THU 100% (`PB-01` Đạt toàn bộ Acceptance Criteria & Definition of Done)** |

---

# PHẦN I - BIÊN BẢN HỌP SPRINT 01 REVIEW (NGHIỆM THU SẢN PHẨM)

## 1. Mục tiêu Buổi Sprint Review

Buổi họp Sprint 01 Review được tổ chức nhằm:
1. Trình diễn trực tiếp (Live Demo) sản phẩm phần mềm hoạt động hoàn chỉnh từ giao diện Web (`React + Vite`) qua tầng `ASP.NET Core Web API (.NET 10)` xuống cơ sở dữ liệu `PostgreSQL` thật và hệ thống lưu trữ tệp vật lý.
2. Đối chiếu kết quả thực tế với 8 Tiêu chí Chấp nhận (`AC-01` đến `AC-08`), 6 Quy tắc Nghiệp vụ (`BR-01` đến `BR-06`) và tiêu chuẩn Hoàn thành (*Definition of Done - DoD*) của User Story `PB-01`.

---

## 2. Kịch bản Trình diễn Trực tiếp trên Hệ thống (Live Demo Walkthrough)

Nhóm phát triển đã thực hiện trình diễn trực tiếp theo đúng 6 trạng thái màn hình chuẩn đã thiết kế tại `docs/design/sprint-01/` và các API trên Swagger UI:

| Bước Demo | Màn hình / Thành phần Trình diễn | Người trình bày | Thao tác thực hiện & Kết quả quan sát thực tế trên hệ thống |
| :---: | :--- | :--- | :--- |
| **Bước 1** | **Trang chủ (`DashboardPage` - Màn hình `01_`) & Danh mục Khách hàng** | Trần Ngọc Long & Thạch Ý | - Mở ứng dụng tại `http://localhost:5173`, kiểm tra bố cục App Shell (`Sidebar` cố định `240px` màu `#0F172A`, `Header` `64px` hiển thị thông tin Nhân viên Kinh doanh `"Nguyễn Văn An - NV-KD-001"`). <br>- Nhấn nút **`+ Tạo hợp đồng mới`** để điều hướng sang `/contracts/new`. <br>- Mở ô chọn **Khách hàng**: hệ thống tự động gọi `GET /api/customers?activeOnly=true`, chỉ hiển thị các khách hàng đang `Active` (`KH-ABC-001`, `KH-ABC-002`) kèm thẻ thông tin mã số thuế, người liên hệ, địa chỉ; khách hàng `KH-ABC-004` (`Inactive`) không xuất hiện trong danh sách chọn. |
| **Bước 2** | **Trạng thái Nhập liệu Chuẩn & Kiểm tra Lỗi Validation (`Màn hình 02_, 03_, 04_`)** | Trần Ngọc Long | - Thử nhấn **"Lưu bản nháp"** khi để trống các trường bắt buộc hoặc nhập `effectiveFrom > effectiveTo`, `contractValue <= 0`: biểu mẫu hiển thị ngay viền đỏ `#DC2626` và thông báo lỗi tiếng Việt dưới từng ô mà chưa gửi request lên Server. <br>- Thử kéo thả một tệp sai định dạng (`.png`) hoặc vượt quá `20 MB`: vùng `AttachmentDropzone` cảnh báo và chặn tệp không hợp lệ ngay trên giao diện. |
| **Bước 3** | **Trạng thái Lưu Hợp đồng `Draft` & Tải Tệp Đính kèm Thành công (`Màn hình 05_`)** | Trần Ngọc Long & Thạch Ý | - Nhập hợp lệ thông tin hợp đồng vận chuyển cho khách hàng `KH-ABC-001`, nhập giá trị hợp đồng số thập phân lớn, đính kèm 2 tệp (`.pdf` và `.xlsx`) rồi nhấn **"Lưu bản nháp"**. <br>- **Bước 1**: Frontend gọi `POST /api/contracts` -> Nhận về `201 Created` với mã tự động cấp `HD-2026-001` và `status = "Draft"`. <br>- **Bước 2**: Frontend tự động gọi tiếp `POST /api/contracts/{id}/attachments` -> Tải thành công 2 tệp lên Server. <br>- Màn hình hiển thị thông báo thành công màu xanh `#16A34A` kèm mã `HD-2026-001`, danh sách tệp đã lưu và thông tin người tạo `"NV-KD-001 \| Nguyễn Văn An"`. |
| **Bước 4** | **Trạng thái Lỗi Tải Tệp Từng phần (`Partial Failure`) & Nút `"Thử tải lại tệp"` (`Màn hình 06_`)** | Trần Ngọc Long & Đặng Hữu Phú | - Thực hiện kịch bản Bước 1 (`POST /api/contracts`) tạo hợp đồng thành công (đã cấp mã `HD-2026-002`), nhưng Bước 2 (`POST /api/contracts/{id}/attachments`) gặp lỗi tải tệp (`400 Bad Request`). <br>- Giao diện chuyển sang trạng thái cảnh báo màu vàng cam `#D97706`: hiển thị rõ mã hợp đồng `HD-2026-002` đã được lưu an toàn trong PostgreSQL, khóa các trường thông tin hợp đồng để tránh tạo trùng bản ghi mới, báo rõ nguyên nhân lỗi tệp và hiển thị nút **"Thử tải lại tệp"**. <br>- Chọn lại tệp `.pdf` hợp lệ và nhấn **"Thử tải lại tệp"**: hệ thống chỉ gọi lại Bước 2 cho đúng `contractId` đã có và hoàn tất lưu hồ sơ. |
| **Bước 5** | **Kiểm chứng Cấp độ API, Đồng thời (Concurrency) & Tính bền vững Dữ liệu (Persistence)** | Lê Quang Linh & Đặng Hữu Phú | - Trình diễn kết quả chạy bộ 81 bài kiểm thử tự động (`UnitTests`, `Api.Tests`, `Infrastructure.Tests`, `IntegrationTests`, `contractSchema.test.cjs`) và kiểm tra trực tiếp bảng `contracts`, `contract_attachments` trong PostgreSQL. <br>- Khởi động lại dịch vụ Backend API và gọi lại `GET /api/contracts/{id}`: dữ liệu hợp đồng `Draft` và danh sách tệp đính kèm vẫn tồn tại bền vững 100%. |

---

## 3. Bảng Đối chiếu Nghiệm thu Tiêu chí Chấp nhận (`AC-01` .. `AC-08`) & Definition of Done (DoD)

### 3.1. Đối chiếu 8 Tiêu chí Chấp nhận của `PB-01`

| Mã AC | Nội dung Tiêu chí Chấp nhận (Acceptance Criteria) | Bằng chứng Nghiệm thu (Code / API / Test) | Kết quả |
| :---: | :--- | :--- | :---: |
| **AC-01** | Danh sách chọn khách hàng trên màn hình Tạo hợp đồng chỉ hiển thị các khách hàng có trạng thái `Active` từ `GET /api/customers?activeOnly=true`. | `CustomersController.cs`, `CreateContractPage.tsx`, `TC-PB01-01`, `TC-PB01-02` | **ĐẠT** |
| **AC-02** | Kiểm tra đầy đủ tính hợp lệ của dữ liệu trên cả Frontend và Backend cho toàn bộ các trường bắt buộc (`contractName`, `customerId`, `effectiveFrom`, `effectiveTo`, `contractValue`, `paymentTerms`, `serviceTerms`). | `CreateContractValidator.cs`, `contractSchema.ts`, `24 Unit Tests`, `TC-PB01-06`, `TC-PB01-17` | **ĐẠT** |
| **AC-03** | Từ chối lưu và báo lỗi chuẩn xác nếu `effectiveFrom > effectiveTo`, `contractValue <= 0`, hoặc khách hàng `Inactive` (`422`) / không tồn tại (`404`). | `ContractService.cs`, `GlobalExceptionHandler.cs`, `ContractSchemaTests.cs`, `TC-PB01-07..10` | **ĐẠT** |
| **AC-04** | Tự động sinh mã `contractCode` duy nhất theo mẫu `HD-YYYY-NNN`; xử lý đồng thời bằng `UNIQUE index` kết hợp retry tối đa 3 lần khi gặp lỗi `23505`, không trả lỗi `500`. | `ContractService.cs`, `ux_contracts_contract_code`, `CreateDraft_TwoConcurrentRequests_BothSucceedWithDistinctCodes` (`TC-PB01-11`) | **ĐẠT** |
| **AC-05** | Hợp đồng mới luôn có `status = 'Draft'`, `currency = 'VND'`, `createdBy = 'NV-KD-001 \| Nguyễn Văn An'` (do Backend tự gán) và `createdAt` chuẩn UTC. | `AuditConstants.cs`, `ContractService.cs`, `TC-PB01-03`, `TC-PB01-12` | **ĐẠT** |
| **AC-06** | Cho phép lưu hợp đồng `Draft` thành công khi người dùng chưa chọn tệp đính kèm nào. | `ContractsController.cs`, `CreateContractPage.tsx`, `TC-PB01-03`, `TC-PB01-18` | **ĐẠT** |
| **AC-07** | Chỉ chấp nhận tệp đính kèm có định dạng `.pdf`, `.docx`, `.xlsx` với dung lượng mỗi tệp `> 0 bytes` và `<= 20 MB` (`20,971,520 bytes`). | `ContractAttachmentService.cs`, `AttachmentDropzone.tsx`, `TC-PB01-04`, `TC-PB01-13..15`, `TC-PB01-21` | **ĐẠT** |
| **AC-08** | Hỗ trợ quy trình lưu 2 bước; giữ nguyên hợp đồng `Draft` đã tạo ở Bước 1 và cung cấp nút **"Thử tải lại tệp"** khi Bước 2 gặp lỗi (`Partial Failure`). | `CreateContractPage.tsx`, `AttachmentsApiTests.UploadFailure_ThenRetry_PreservesDraftAndCreatesOnlyOneAttachment` (`TC-PB01-16`, `TC-PB01-19`) | **ĐẠT** |

### 3.2. Kiểm tra Tiêu chuẩn Hoàn thành Chung (Definition of Done - DoD)
- [x] Tài liệu đặc tả nghiệp vụ (`TASK-02`), sơ đồ UML Use Case (`TASK-03`), Class & Sequence (`TASK-07`) và đặc tả UI/UX Figma (`TASK-10`) đầy đủ, nhất quán 100% với mã nguồn.
- [x] Toàn bộ mã nguồn Backend (`.NET 10`) và Frontend (`React + TypeScript`) biên dịch thành công (`0 errors, 0 warnings`).
- [x] Hệ thống CSDL PostgreSQL có đầy đủ Migration tự động, Seed Data và ràng buộc toàn vẹn (`UNIQUE`, `CHECK`, `FOREIGN KEY`).
- [x] Bộ kiểm thử tự động gồm **81 tests** và bộ **25 kịch bản kiểm thử E2E** vượt qua 100% (`0 failed`).
- [x] Pipeline CI (`.github/workflows/ci.yml`) và tài liệu hướng dẫn `README.md` đầy đủ, cho phép bất kỳ thành viên nào hoặc giảng viên tái lập môi trường nhanh chóng.

---

# PHẦN II - BIÊN BẢN HỌP SPRINT 01 RETROSPECTIVE (CẢI TIẾN QUY TRÌNH)

## 1. Những Điểm Nhóm Đã Thực hiện Tốt (What Went Well)

1. **Chốt Đặc tả API Contract & Quy tắc Nghiệp vụ ngay từ Chặng 1 (`TASK-02`)**:
   - Việc thống nhất sớm cấu trúc JSON request/response, bảng mã lỗi `errorCode` (`CUSTOMER_NOT_FOUND`, `CUSTOMER_INACTIVE`, `CONTRACT_CODE_CONFLICT`, `INVALID_ATTACHMENT`) và quy trình lưu 2 bước giúp Backend (Linh, Ý), Frontend (Long) và QA (Phú) triển khai song song mà không bị lệch giao diện giao tiếp.
2. **Thiết kế Bảo vệ Dữ liệu Đa tầng (Defense-in-Depth)**:
   - Quy tắc nghiệp vụ được kiểm tra đồng bộ ở cả 3 lớp: Zod Schema trên React (`TASK-12`), `CreateContractValidator` ở tầng Application (`TASK-08`), và hệ thống `CHECK`/`UNIQUE`/`FOREIGN KEY` constraints trực tiếp trong PostgreSQL (`TASK-05`).
3. **Xử lý Triệt để Bài toán Đồng thời & Độ chính xác Tài chính**:
   - Cơ chế bắt lỗi `PostgresException (23505)` kết hợp retry tối đa 3 lần giúp API tạo hợp đồng vượt qua bài kiểm thử bắn request đồng thời mà không trùng mã hay văng lỗi `500`.
   - Frontend xử lý chuỗi số thập phân cẩn thận bằng `contractSchema.ts` và có bài test hồi quy `contractSchema.test.cjs`, đảm bảo không mất độ chính xác của trường `contractValue` (`DECIMAL(18,2)`).
4. **Hạ tầng Kiểm thử Tự động linh hoạt trên cả Local và CI (`TASK-05, 06, 14, 15`)**:
   - Các fixture kiểm thử PostgreSQL (`PostgresFixture`, `ApiDatabaseFixture`) hỗ trợ linh hoạt cả biến môi trường `TEST_POSTGRES_CONNECTION` (dùng trên CI hoặc PostgreSQL cài sẵn trên máy) lẫn `Testcontainers` (khi bật Docker), giúp việc chạy kiểm thử tích hợp rất thuận tiện.

---

## 2. Những Điểm Cần Cải thiện (What Could Be Improved)

1. **Đồng bộ Cấu hình Kết nối PostgreSQL giữa các Máy Cá nhân**:
   - Ở giai đoạn đầu khi chạy kiểm thử tích hợp trên máy cá nhân, một số thành viên sử dụng mật khẩu `postgres` local khác với mật khẩu mặc định trong `appsettings.Development.json` hoặc chưa bật Docker Desktop, dẫn đến lỗi xác thực `28P01` trước khi thiết lập biến môi trường `TEST_POSTGRES_CONNECTION`.
2. **Định danh Kịch bản Kiểm thử Mở rộng**:
   - Khi viết thêm các bài kiểm thử tự động chuyên sâu ở `TASK-14` (như kiểm thử biên dung lượng tệp `20,971,520 bytes` vs `20,971,521 bytes` và từ chối lô tệp hỗn hợp), nhóm cần cập nhật mã định danh kịch bản (`TC-PB01-21..25`) sớm hơn vào bảng tổng hợp để việc đối chiếu báo cáo E2E ở `TASK-16` diễn ra tức thì.
3. **Thứ tự Merge Pull Request ở các Chặng Phụ thuộc**:
   - Các nhánh công việc có sửa chung tệp cấu hình (như `backend/AbcBusinessManagement.sln` hoặc `.github/workflows/ci.yml`) cần được rebase/merge theo đúng thứ tự chặng để tránh xung đột nhỏ khi hợp nhất vào `main`.

---

## 3. Kế hoạch Hành động Cụ thể cho Sprint 02 (Action Items for Sprint 02)

| Mã hành động | Nội dung cải tiến áp dụng ngay từ Sprint 02 | Người phụ trách chính | Thời hạn áp dụng |
| :---: | :--- | :--- | :---: |
| **AI-S01-01** | Chuẩn hóa mẫu cấu hình biến môi trường `TEST_POSTGRES_CONNECTION` trong `README.md` và script chạy test nhanh để mọi thành viên kiểm tra kết nối PostgreSQL trước khi chạy Integration Tests. | Lê Quang Linh (`linh285`) & Đặng Hữu Phú (`PhuHuuDang`) | Đầu Sprint 02 |
| **AI-S01-02** | Duy trì quy trình thiết kế *API Contract First* và cập nhật ngay các kịch bản kiểm thử biên (Boundary & Batch Cases) vào tài liệu `test-cases` ngay ở Chặng 2 của mỗi Sprint. | Nguyễn Khả Như (`KN12345N`) & Đặng Hữu Phú (`PhuHuuDang`) | Xuyên suốt Sprint 02 |
| **AI-S01-03** | Tận dụng lại khung kiến trúc `ProblemDetails`, `AuditConstants`, `AttachmentDropzone` và bộ `ApiDatabaseFixture` đã hoàn thiện ở Sprint 01 để tăng tốc độ phát triển các User Story tiếp theo của Sprint 02. | Toàn bộ 5 thành viên nhóm | Bắt đầu Sprint 02 |
