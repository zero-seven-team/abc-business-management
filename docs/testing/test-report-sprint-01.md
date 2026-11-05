# Báo cáo Kết quả Kiểm thử Hệ thống & Nghiệm thu End-to-End (Test Execution Report)
## Hạng mục: Sprint 01 — PB-01: Tạo và lưu hợp đồng mới ở trạng thái Draft

| Thuộc tính | Nội dung chi tiết |
| :--- | :--- |
| **Mã Product Backlog** | `PB-01` — Tạo và lưu hợp đồng mới ở trạng thái `Draft` (8 Story Points) |
| **Thuộc Sprint** | `Sprint 01` |
| **Mã công việc (Task)** | `TASK-16` — Kiểm thử End-to-End (E2E), kiểm tra tính bền vững dữ liệu & lập Báo cáo kết quả kiểm thử Sprint 01 |
| **Liên kết GitHub Issues** | Issue `#1` (`PB-01`), Issue `#14` (`TASK-13`), Issue `#15` (`TASK-14`), Issue `#16` (`TASK-15`), Issue `#17` (`TASK-16`) |
| **Người thực hiện** | Đặng Hữu Phú (`PhuHuuDang`) — Đảm bảo Chất lượng & Kiểm thử (QA/QC) |
| **Tài liệu đối chiếu** | `docs/specs/PB-01-create-contract-spec.md`, `docs/testing/test-cases-PB01.md`, `README.md` |
| **Kết luận nghiệm thu QA** | **ĐẠT (PASSED — Sẵn sàng nghiệm thu Sprint Review)** |

---

## 1. Mục tiêu & Phạm vi Kiểm thử Sprint 01

Báo cáo này tổng hợp toàn bộ kết quả kiểm thử của **Sprint 01** cho hạng mục `PB-01` (*Là Nhân viên Kinh doanh, tôi muốn nhập thông tin cơ bản của hợp đồng và lưu ở trạng thái `Draft` kèm tệp đính kèm*), bao gồm 4 cấp độ kiểm thử:

1. **Kiểm thử Đơn vị (Backend Unit Tests & Frontend Regression Tests)**:
   - Kiểm tra độc lập toàn bộ quy tắc nghiệp vụ và điều kiện biên tại tầng `Application` (`AbcBusinessManagement.UnitTests`) và bộ kiểm tra schema/định dạng số thập phân tại `frontend/tests/contractSchema.test.cjs`.
2. **Kiểm thử Xử lý Lỗi & Ràng buộc CSDL (API Error Handling & Infrastructure Schema Tests)**:
   - Xác minh middleware xử lý ngoại lệ tập trung chuẩn RFC 7807 (`AbcBusinessManagement.Api.Tests`) và các ràng buộc `UNIQUE`, `CHECK`, `FOREIGN KEY`, `Migration` trên PostgreSQL (`AbcBusinessManagement.Infrastructure.Tests`).
3. **Kiểm thử Tích hợp API & Cơ sở dữ liệu (Backend Integration Tests — `TASK-14`)**:
   - Kiểm thử toàn bộ 4 RESTful API endpoints (`GET /api/customers`, `POST /api/contracts`, `GET /api/contracts/{id}`, `POST /api/contracts/{id}/attachments`) với PostgreSQL thật, bao gồm kiểm thử đồng thời (concurrency retry) và quy trình lưu 2 bước (`AbcBusinessManagement.IntegrationTests`).
4. **Kiểm thử End-to-End (E2E), Tính bền vững dữ liệu (Data Persistence) & Tái lập môi trường theo `README.md` (`TASK-16`)**:
   - Đối chiếu kết quả thực thi bộ kịch bản kiểm thử trong `docs/testing/test-cases-PB01.md` (`TC-PB01-01` đến `TC-PB01-20`) cùng 5 kịch bản kiểm thử bổ sung mở rộng cho điều kiện biên, lô tệp hỗn hợp, kiểm tra sau khi khởi động lại dịch vụ và quy trình cài đặt từ đầu theo `README.md` (`TC-PB01-21` đến `TC-PB01-25`).

---

## 2. Môi trường Kiểm thử & Cấu hình Thực thi

### 2.1. Thông số Môi trường Kiểm thử

| Thành phần | Phiên bản / Cấu hình sử dụng | Ghi chú |
| :--- | :--- | :--- |
| **Hệ điều hành** | Windows 11 Pro 64-bit & Ubuntu Latest (GitHub Actions CI Runner) | Chạy song song trên máy phát triển và pipeline CI `.github/workflows/ci.yml` |
| **Backend Runtime** | .NET SDK `10.0.x` (ASP.NET Core Web API, C# 13, EF Core `10.0.14`) | Kiến trúc phân lớp: `Domain`, `Application`, `Infrastructure`, `Api` |
| **Cơ sở dữ liệu** | PostgreSQL `16` / `17` (`abc_business_management`) | Khởi tạo schema qua EF Core Migration `20260402135834_InitContractDraftSchema` |
| **Frontend Runtime** | Node.js `22.x LTS`, React `18`, TypeScript `5`, Vite, Tailwind CSS | Chạy tại `http://localhost:5173`, kết nối Backend `http://localhost:5000` |
| **Công cụ Kiểm thử** | `xUnit`, `Microsoft.AspNetCore.Mvc.Testing`, `Testcontainers.PostgreSql`, `node --test` | Tự động hóa trong `tests/backend/*` và `frontend/tests/*` |

### 2.2. Ghi chú Cấu hình Kết nối PostgreSQL Local & CI
- Trên pipeline **GitHub Actions CI** (`.github/workflows/ci.yml`), dịch vụ `postgres:16-alpine` được khởi chạy tự động với biến môi trường `TEST_POSTGRES_CONNECTION` để thực thi toàn bộ các bộ test tích hợp với PostgreSQL thật.
- Trên môi trường máy cá nhân (Local Development), nếu dịch vụ PostgreSQL sử dụng mật khẩu riêng khác với giá trị mặc định trong `appsettings.Development.json` hoặc Docker Desktop chưa bật, người kiểm thử cần truyền biến môi trường `TEST_POSTGRES_CONNECTION="Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=<mat_khau_local>"` trước khi chạy `AbcBusinessManagement.IntegrationTests` và `AbcBusinessManagement.Infrastructure.Tests` theo đúng hướng dẫn tại Mục 6 của `README.md`.

---

## 3. Tổng hợp Kết quả Kiểm thử Tự động (Automated Test Suites Summary)

| STT | Bộ kiểm thử (Test Project / Suite) | Phụ trách | Số lượng Test | Kết quả (Pass / Fail) | Nội dung kiểm chứng trọng tâm |
| :-: | :--- | :--- | :-: | :-: | :--- |
| 1 | `AbcBusinessManagement.UnitTests` | Đặng Hữu Phú (`TASK-14`) | **24** | **24 / 0 (100% Pass)** | Kiểm tra `CreateContractValidator`: chuỗi rỗng/khoảng trắng, độ dài `contractName` (5–255), `paymentTerms` & `serviceTerms` (10–4000), `effectiveFrom <= effectiveTo`, `contractValue > 0`, `currency = VND`, điều kiện biên và gom nhóm nhiều lỗi. |
| 2 | `AbcBusinessManagement.Api.Tests` | Lê Quang Linh (`TASK-06`) | **13** | **13 / 0 (100% Pass)** | Kiểm tra `GlobalExceptionHandler` & `RequestLoggingMiddleware`: ánh xạ mã lỗi `400`, `404`, `405`, `409`, `413`, `415`, `422`, `500` sang chuẩn RFC 7807 `ProblemDetails`, bảo mật không lộ stack trace và gắn `traceId`. |
| 3 | `AbcBusinessManagement.Infrastructure.Tests` | Lê Quang Linh (`TASK-05`) | **15** | **15 / 0 (100% Pass)** | Kiểm tra Migration lên/xuống, Seed 3 khách hàng mẫu (`KH-ABC-001`, `KH-ABC-002` Active; `KH-ABC-004` Inactive), `UNIQUE index` `ux_contracts_contract_code`, 6 `CHECK constraints` trên bảng `contracts` và 2 `CHECK constraints` trên `contract_attachments`. |
| 4 | `AbcBusinessManagement.IntegrationTests` | Đặng Hữu Phú (`TASK-14`) | **26** | **26 / 0 (100% Pass)** | Kiểm thử tích hợp 4 API của `PB-01` trên PostgreSQL: tạo Draft hợp lệ, chặn khách hàng `Inactive` (`422`), chặn khách hàng không tồn tại (`404`), chống giả mạo `createdBy`/`status`, bắn đồng thời 2 request qua 5 vòng (`Task.WhenAll`) không trùng mã, kiểm thử biên tệp `20 MB` (`20,971,520 bytes` vs `20,971,521 bytes`), từ chối lô tệp hỗn hợp và thử tải lại tệp sau lỗi. |
| 5 | `frontend/tests/contractSchema.test.cjs` & `npm run build` | Trần Ngọc Long (`TASK-12`) | **3** + Build | **3 / 0 (100% Pass)** | Kiểm tra xử lý chính xác số thập phân lớn (`DECIMAL(18,2)`), chặn số âm/bằng 0/sai định dạng, bảo toàn token số khi serialize JSON và kiểm tra biên dịch TypeScript (`tsc -b && vite build` đạt `0 errors`). |
| **Tổng** | **Toàn bộ Test Suites của Sprint 01** | **Nhóm 5 TV** | **81** | **81 / 0 (100% Pass)** | **Đạt toàn bộ cổng chất lượng mã nguồn (Quality Gate) trên nhánh `main`** |

---

## 4. Kết quả Thực thi Chi tiết Bộ Kịch bản Kiểm thử `PB-01`

> **Ghi chú đối chiếu danh mục Test Cases**:
> - Tài liệu kịch bản kiểm thử gốc `docs/testing/test-cases-PB01.md` (`TASK-13`) định nghĩa **20 kịch bản cốt lõi** từ `TC-PB01-01` đến `TC-PB01-20`.
> - Trong quá trình thực hiện kiểm thử tự động (`TASK-14`) và nghiệm thu E2E (`TASK-16`), nhóm QA bổ sung thêm **05 kịch bản mở rộng (`TC-PB01-21` đến `TC-PB01-25`)** để bao phủ chặt các điều kiện biên dung lượng tệp (`20,971,520 bytes` vs `20,971,521 bytes`), lô tệp hỗn hợp (Batch Upload Policy), bảo toàn độ chính xác số thập phân `DECIMAL(18,2)` trên giao diện, kiểm tra cấp độ CSDL (`CHECK`/`FOREIGN KEY`) và kiểm tra quy trình dựng môi trường từ đầu theo `README.md` (`TASK-17`).

### 4.1. Kết quả Thực thi 20 Kịch bản Cốt lõi (`TC-PB01-01` đến `TC-PB01-20` trong `docs/testing/test-cases-PB01.md`)

| Mã TC | Tên kịch bản kiểm thử | Phương thức kiểm chứng | Kết quả thực tế ghi nhận | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-PB01-01** | Lấy danh sách khách hàng đang hoạt động (`activeOnly=true`) | Integration Test (`GetCustomers_ActiveOnly_ReturnsSeededActiveCustomers`) & E2E UI | API `GET /api/customers?activeOnly=true` trả về `200 OK` gồm đúng các khách hàng có `status = "Active"` (`KH-ABC-001`, `KH-ABC-002`), sắp xếp theo `customerCode` tăng dần và ẩn khách hàng `KH-ABC-004` (`Inactive`). | **PASS** |
| **TC-PB01-02** | Lấy toàn bộ khách hàng khi truyền `activeOnly=false` | Integration Test (`GetCustomers_All_IncludesInactiveCustomer`) | API `GET /api/customers?activeOnly=false` trả về `200 OK` chứa đầy đủ cả khách hàng `Active` và khách hàng `Inactive` (`KH-ABC-004`). | **PASS** |
| **TC-PB01-03** | Tạo mới hợp đồng `Draft` hợp lệ không kèm tệp đính kèm | Integration Test (`CreateDraft_ValidRequest_Returns201AndPersistsToDatabase`) | `POST /api/contracts` trả về `201 Created` kèm header `Location: /api/contracts/{id}`, mã `contractCode` định dạng `HD-2026-NNN`, `status = "Draft"`, `currency = "VND"`, `createdBy = "NV-KD-001 \| Nguyễn Văn An"`, `attachments = []`. | **PASS** |
| **TC-PB01-04** | Tạo hợp đồng `Draft` và tải lên nhiều tệp đính kèm hợp lệ (`.pdf`, `.docx`, `.xlsx`) | Integration Test (`UploadMultipleAttachments_PdfDocxXlsx_Returns201AndPreservesAll`) | `POST /api/contracts/{id}/attachments` trả về `201 Created` với `uploadedCount = 3`. Khi gọi `GET /api/contracts/{id}`, mảng `attachments` trả về đầy đủ metadata và tệp vật lý được lưu đúng trong `uploads/contracts/{contractId}/`. | **PASS** |
| **TC-PB01-05** | Kiểm tra truy vấn chi tiết hợp đồng không tồn tại | Integration Test (`GetById_UnknownContract_Returns404Problem`) | `GET /api/contracts/99999999-9999-9999-9999-999999999999` trả về `404 Not Found` chuẩn `application/problem+json` với `errorCode = "CONTRACT_NOT_FOUND"` và `traceId` hợp lệ. | **PASS** |
| **TC-PB01-06** | Tạo hợp đồng thiếu các trường bắt buộc hoặc chuỗi chỉ chứa khoảng trắng | Unit Test (`MultipleInvalidFields_AreReportedTogether`) & Integration Test (`CreateDraft_InvalidFields_Returns400ValidationProblemAndSavesNothing`) | Trả về `400 Bad Request` (`ValidationProblemDetails`), liệt kê chính xác lỗi cho từng trường (`contractName`, `customerId`, `effectiveTo`, `contractValue`, `paymentTerms`, `serviceTerms`) và không ghi bản ghi nào vào bảng `contracts`. | **PASS** |
| **TC-PB01-07** | Tạo hợp đồng có ngày bắt đầu lớn hơn ngày kết thúc (`effectiveFrom > effectiveTo`) | Unit Test (`EffectiveTo_BeforeEffectiveFrom_IsRejected`) & Schema Test | Trả về `400 Bad Request` với thông báo lỗi tại trường `errors.effectiveTo`: *"Ngày kết thúc hiệu lực phải lớn hơn hoặc bằng ngày bắt đầu hiệu lực."* | **PASS** |
| **TC-PB01-08** | Tạo hợp đồng có giá trị bằng `0` hoặc số âm (`contractValue <= 0`) | Unit Test (`ContractValue_NotPositiveOrTooLarge_IsRejected` - 4 cases) | Trả về `400 Bad Request` tại trường `errors.contractValue` cho cả `0`, `-1`, `-125000000` và giá trị vượt ngưỡng `DECIMAL(18,2)`. | **PASS** |
| **TC-PB01-09** | Tạo hợp đồng với `customerId` không tồn tại trong hệ thống | Integration Test (`CreateDraft_UnknownCustomer_Returns404`) | Trả về `404 Not Found` chuẩn `ProblemDetails` với `errorCode = "CUSTOMER_NOT_FOUND"`. | **PASS** |
| **TC-PB01-10** | Tạo hợp đồng cho khách hàng đang ở trạng thái ngưng hoạt động (`Inactive`) | Integration Test (`CreateDraft_InactiveCustomer_Returns422`) | Khi gửi `customerId` của `KH-ABC-004` (`Inactive`), API trả về `422 Unprocessable Entity` với `errorCode = "CUSTOMER_INACTIVE"` và thông báo lỗi tại `errors.customerId`. | **PASS** |
| **TC-PB01-11** | Kiểm thử gửi đồng thời nhiều yêu cầu tạo hợp đồng (Concurrency & Retry) | Integration Test (`CreateDraft_TwoConcurrentRequests_BothSucceedWithDistinctCodes` - 5 vòng) | Các request đồng thời (`Task.WhenAll` với `SemaphoreSlim`) đều trả về `201 Created`, không phát sinh lỗi `500`, các mã `contractCode` được cấp hoàn toàn duy nhất nhờ `ux_contracts_contract_code` và cơ chế retry tối đa 3 lần khi gặp `SqlState 23505`. | **PASS** |
| **TC-PB01-12** | Kiểm thử bảo mật danh tính người tạo (`Server-side Audit Identity` — `BR-06`) | Integration Test (`CreateDraft_IgnoresClientSuppliedAuditAndStatusFields`) | Khi JSON request cố tình chèn `contractCode = "HD-1999-999"`, `status = "Approved"`, `createdBy = "Hacker \| Giả mạo"`, Backend bỏ qua hoàn toàn và luôn lưu `status = "Draft"`, `createdBy = "NV-KD-001 \| Nguyễn Văn An"`. | **PASS** |
| **TC-PB01-13** | Chặn tải lên tệp đính kèm sai định dạng (`.png`, `.exe`, `.zip`) | Integration Test (`UploadAttachment_InvalidExtension_Returns400BadRequest`) | Trả về `400 Bad Request` với `errorCode = "INVALID_ATTACHMENT"`, không lưu tệp lên đĩa và không tạo bản ghi trong `contract_attachments`. | **PASS** |
| **TC-PB01-14** | Chặn tải lên tệp đính kèm vượt quá `20 MB` (`20,971,520 bytes`) | Integration Test (`UploadAttachment_SizeBoundary_IsEnforced`) | Tệp kích thước `20,971,521 bytes` bị chặn với mã `400 Bad Request` (`errorCode = "INVALID_ATTACHMENT"`), trong khi tệp đúng `20,971,520 bytes` (`20 MB`) được chấp nhận (`201 Created`). | **PASS** |
| **TC-PB01-15** | Chặn tải lên tệp rỗng (`0 bytes`) hoặc không truyền tệp nào | Integration Test (`UploadAttachment_EmptyFile_Returns400BadRequest`) | Tệp `0 bytes` bị từ chối với `400 Bad Request` (`errorCode = "INVALID_ATTACHMENT"`), giữ nguyên trạng thái hợp đồng `Draft`. | **PASS** |
| **TC-PB01-16** | Kiểm thử phục hồi lỗi từng phần (Bước 1 thành công, Bước 2 lỗi -> Thử tải lại tệp thành công) | Integration Test (`UploadFailure_ThenRetry_PreservesDraftAndCreatesOnlyOneAttachment`) | Sau khi Bước 2 trả về `400` cho tệp `.png`, hợp đồng `Draft` ở Bước 1 vẫn còn nguyên trong DB với mã đã cấp. Khi gọi lại Bước 2 với tệp `retry.pdf`, API trả về `201 Created`, gắn đúng 1 tệp vào hợp đồng cũ mà không tạo bản ghi hợp đồng thứ hai. | **PASS** |
| **TC-PB01-17** | Kiểm tra hiển thị lỗi Validation trực tiếp trên Form React | E2E UI (`CreateContractPage.tsx` + `contractSchema.ts`) | Các trường vi phạm hiển thị viền đỏ `#DC2626`, thông báo lỗi tiếng Việt rõ ràng ngay dưới từng ô nhập liệu và chặn gọi API `POST /api/contracts` khi dữ liệu chưa hợp lệ. | **PASS** |
| **TC-PB01-18** | Lưu hợp đồng `Draft` không kèm tệp trên giao diện Web | E2E UI (`CreateContractPage.tsx`) | Khi không chọn tệp và nhấn **"Lưu bản nháp"**, Frontend chỉ gọi Bước 1 (`POST /api/contracts`), hiển thị thông báo thành công màu xanh `#16A34A` kèm mã `HD-2026-NNN` và badge trạng thái `Draft`. | **PASS** |
| **TC-PB01-19** | Kiểm thử trạng thái UI `Partial Failure` và nút **"Thử tải lại tệp"** | E2E UI (`CreateContractPage.tsx` + `AttachmentDropzone.tsx`) | Khi Bước 1 thành công nhưng Bước 2 lỗi, giao diện hiển thị rõ mã hợp đồng đã cấp, khóa các trường thông tin chung của hợp đồng (`isContractLocked`), báo chi tiết lỗi tải tệp và hiển thị nút **"Thử tải lại tệp"** chỉ gọi lại `uploadContractAttachments(createdContract.id, files)`. | **PASS** |
| **TC-PB01-20** | Kiểm tra tính bền vững của dữ liệu sau khi khởi động lại Backend (Data Persistence) | Schema/Integration Test (`DraftWithoutAttachmentsPersistsDatesValueAndUtcTimestamp` với DbContext độc lập) & E2E Verification | Bản ghi hợp đồng `Draft` và danh sách `attachments` được lưu vào bảng vật lý PostgreSQL (`contracts`, `contract_attachments`) và tệp vật lý trong `uploads/contracts/`. Sau khi khởi tạo phiên kết nối/khởi động lại dịch vụ Backend, truy vấn `GET /api/contracts/{id}` trả về nguyên vẹn 100% dữ liệu. | **PASS** |

---

### 4.2. Kết quả Thực thi 05 Kịch bản Kiểm thử Mở rộng (`TC-PB01-21` đến `TC-PB01-25`)

| Mã TC | Tên kịch bản kiểm thử bổ sung | Nguồn đối chiếu & Test tự động tương ứng | Kết quả thực tế ghi nhận | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **TC-PB01-21** | Kiểm thử chính sách từ chối toàn bộ lô tệp khi có 1 tệp lỗi (`Batch Upload Policy`) | Mục 5.4 `PB-01-create-contract-spec.md` — `AttachmentsApiTests.UploadMixedBatch_RejectsEntireBatchWithoutSavingFiles` | Khi gửi đồng thời `valid.pdf` và `invalid.png` trong cùng 1 request, Backend trả về `400 Bad Request` (`INVALID_ATTACHMENT`), không lưu bất kỳ tệp nào lên ổ đĩa và không chèn bản ghi dở dang vào `contract_attachments`. | **PASS** |
| **TC-PB01-22** | Kiểm thử bảo toàn độ chính xác số thập phân `DECIMAL(18,2)` trên Frontend & JSON Payload | Mục 3.2 `PB-01-create-contract-spec.md` — `frontend/tests/contractSchema.test.cjs` | Biểu mẫu Frontend hỗ trợ nhập số thập phân lớn (tới `999,999,999,999,999.99`) với dấu chấm hoặc dấu phẩy thập phân, không làm tròn sai số kiểu `Number` IEEE-754 khi đóng gói JSON gửi lên `POST /api/contracts`. | **PASS** |
| **TC-PB01-23** | Kiểm thử lớp phòng thủ thứ hai bằng ràng buộc `CHECK` & `FOREIGN KEY` trực tiếp trong PostgreSQL | `TASK-05` — `ContractSchemaTests` (`InvalidContractViolatesDatabaseConstraint`, `InvalidAttachmentViolatesDatabaseConstraint`, `CustomerWithContractCannotBeDeleted`) | PostgreSQL chặn trực tiếp mọi dữ liệu vi phạm ở tầng CSDL thông qua các constraint `ck_contracts_dates`, `ck_contracts_value`, `ck_contracts_name`, `ck_contracts_currency`, `ck_contracts_payment_terms`, `ck_contracts_service_terms`, `ck_contract_attachments_size`, `ck_contract_attachments_extension` và `RESTRICT` khi xóa khách hàng đã có hợp đồng. | **PASS** |
| **TC-PB01-24** | Kiểm thử chuẩn hóa phản hồi lỗi HTTP & ẩn chi tiết nhạy cảm khi lỗi hệ thống (`500`) | `TASK-06` — `ErrorHandlingTests.UnexpectedErrorsHideDetailsAndLogMatchingTrace` & `RequestLogExcludesQueryHeadersAndBody` | Mọi phản hồi lỗi đều có `Content-Type: application/problem+json` kèm `traceId`. Khi xảy ra lỗi `500`, hệ thống ẩn hoàn toàn thông tin nội bộ/stack trace khỏi response client nhưng vẫn ghi log đầy đủ kèm `TraceId`, đồng thời không ghi lộ header `Authorization`, query string hay request body trong log. | **PASS** |
| **TC-PB01-25** | Kiểm thử khả năng tái lập môi trường phát triển & chạy kiểm thử theo tài liệu `README.md` (`TASK-17`) | Đối chiếu từng bước trong `README.md` và `.github/workflows/ci.yml` (`TASK-15`) | Các lệnh khởi tạo CSDL, cập nhật migration (`dotnet ef database update`), chạy Backend (`dotnet run`), chạy Frontend (`npm install && npm run dev` / `npm run build`) và chạy bộ kiểm thử (`dotnet test`, `npm test`) trong `README.md` hoạt động chính xác, đồng bộ 100% với cấu hình CI. | **PASS** |

---

## 5. Đánh giá Độ phủ Tiêu chí Chấp nhận (`AC-01` .. `AC-08`) & Kết luận Nghiệm thu

| Mã AC | Mô tả Tiêu chí Chấp nhận | Số Test Case Kiểm chứng | Tỷ lệ Đạt | Đánh giá |
| :---: | :--- | :---: | :---: | :---: |
| **AC-01** | Chỉ hiển thị và cho phép chọn khách hàng đang ở trạng thái `Active` | 4 (`TC-01, 02, 09, 10`) | 100% | **Đạt** |
| **AC-02** | Kiểm tra đầy đủ các trường bắt buộc trên cả Frontend và Backend | 4 (`TC-03, 06, 17, 22`) | 100% | **Đạt** |
| **AC-03** | Chặn lưu khi sai ngày hiệu lực, giá trị `<= 0`, khách hàng `Inactive` hoặc không tồn tại | 5 (`TC-07, 08, 09, 10, 23`) | 100% | **Đạt** |
| **AC-04** | Tự động cấp mã `HD-YYYY-NNN` duy nhất; xử lý đồng thời không trùng mã, không lỗi `500` | 2 (`TC-03, 11`) | 100% | **Đạt** |
| **AC-05** | Hợp đồng mới luôn có `status = 'Draft'`, `currency = 'VND'`, `createdBy` cố định phía Server | 2 (`TC-03, 12`) | 100% | **Đạt** |
| **AC-06** | Cho phép lưu hợp đồng `Draft` thành công khi chưa đính kèm tệp | 2 (`TC-03, 18`) | 100% | **Đạt** |
| **AC-07** | Chỉ chấp nhận tệp `.pdf`, `.docx`, `.xlsx` với dung lượng `> 0` và `<= 20 MB`/tệp | 5 (`TC-04, 13, 14, 15, 21`) | 100% | **Đạt** |
| **AC-08** | Quy trình lưu 2 bước; giữ nguyên hợp đồng `Draft` và cho phép **"Thử tải lại tệp"** khi Bước 2 lỗi | 4 (`TC-16, 19, 20, 24`) | 100% | **Đạt** |

### Kết luận chung của phụ trách QA/QC (Đặng Hữu Phú):
- Toàn bộ **25/25 kịch bản kiểm thử** (`TC-PB01-01` đến `TC-PB01-25`) và **81/81 bài kiểm thử tự động** (Unit, API Error Handling, Infrastructure Schema, Integration, Frontend Regression) đều **ĐẠT (PASSED)**, không còn lỗi nghiêm trọng (Blocker/Critical/Major) tồn đọng.
- Chức năng `PB-01` (**Tạo và lưu hợp đồng mới ở trạng thái `Draft`**) đáp ứng 100% các tiêu chí trong *Definition of Done (DoD)* và sẵn sàng để trình diễn trong buổi **Sprint 01 Review**.
