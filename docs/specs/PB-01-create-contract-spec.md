# Tài liệu Đặc tả Nghiệp vụ & Hợp đồng Giao tiếp API (API Contract)
## Hạng mục: PB-01 - Tạo và lưu hợp đồng mới ở trạng thái Draft

| Thuộc tính | Nội dung chi tiết |
| :--- | :--- |
| **Mã Product Backlog** | `PB-01` |
| **Thuộc Sprint** | `Sprint 01` |
| **Mã công việc (Task)** | `TASK-02` - Phân tích chi tiết User Story PB-01 và chốt đặc tả nghiệp vụ + API Contract |
| **Liên kết GitHub Issues** | Issue `#1` (User Story `PB-01`), Issue `#3` (`TASK-02`) |
| **Người phụ trách phân tích** | Nguyễn Khả Như (`KN12345N`) - Phân tích nghiệp vụ (BA) |
| **Phiên bản tài liệu** | `v1.0` |
| **Trạng thái** | Đã chốt (Baseline cho Thiết kế CSDL, Backend API, Frontend UI và Kiểm thử) |

---

## 1. Tổng quan User Story & Phạm vi Nghiệp vụ

### 1.1. Phát biểu User Story (`PB-01`)
> **Là** một **Nhân viên Kinh doanh** thuộc **Phòng Kinh doanh** của Công ty ABC Logistics,  
> **Tôi muốn** nhập thông tin cơ bản của hợp đồng dịch vụ logistics (gồm thông tin khách hàng đang hoạt động, tên hợp đồng, thời hạn hiệu lực, giá trị hợp đồng, điều khoản thanh toán, điều khoản dịch vụ và các tệp tài liệu đính kèm nếu có) và lưu vào hệ thống ở trạng thái **Nháp (`Draft`)**,  
> **Để** hệ thống cấp mã hợp đồng duy nhất, lưu trữ an toàn hồ sơ bước đầu trong cơ sở dữ liệu và cho phép tôi tiếp tục rà soát, bổ sung tài liệu trước khi gửi trình duyệt ở các giai đoạn tiếp theo.

### 1.2. Tác nhân (Actors)
- **Tác nhân chính**: **Nhân viên Kinh doanh** (Phòng Kinh doanh).
- **Cơ chế định danh trong phạm vi Sprint 01**:
  - Chức năng xác thực (`Authentication`) và phân quyền theo vai trò (`RBAC`) thuộc phạm vi các Sprint sau.
  - Trong phạm vi `Sprint 01`, hệ thống vận hành dưới ngữ cảnh phiên làm việc cố định của Nhân viên Kinh doanh.
  - Phía **Backend Server** tự động gán cứng danh tính người thực hiện là `"NV-KD-001 | Nguyễn Văn An"` cho các trường thông tin truy vết (`createdBy`, `uploadedBy`). **Tuyệt đối không nhận giá trị `createdBy` hoặc `uploadedBy` từ request payload của phía Client** nhằm đảm bảo tính toàn vẹn dữ liệu kiểm toán (Audit Trail).

### 1.3. Điều kiện tiên quyết (Preconditions)
1. Cơ sở dữ liệu PostgreSQL đã được khởi tạo cấu trúc bảng (`migrations`) và nạp sẵn dữ liệu danh mục khách hàng mẫu (`seed data`).
2. Trong hệ thống đã tồn tại ít nhất một bản ghi Khách hàng (`Customer`) có trạng thái đang hoạt động (`status = 'Active'`).
3. Dịch vụ Backend API và ứng dụng Web Frontend đang hoạt động và kết nối thông suốt.

### 1.4. Điều kiện sau khi thực hiện (Postconditions)
1. Bản ghi hợp đồng mới được lưu bền vững trong bảng `contracts` của PostgreSQL với trạng thái cố định là `'Draft'` và mã hợp đồng `contractCode` duy nhất theo định dạng `HD-YYYY-NNN`.
2. Nếu người dùng có đính kèm tệp hợp lệ, các tệp vật lý được lưu trữ trên máy chủ và thông tin metadata được ghi nhận vào bảng `contract_attachments` liên kết trực tiếp với `contractId` vừa tạo.
3. Trong trường hợp lưu thông tin hợp đồng thành công nhưng quá trình tải tệp đính kèm gặp sự cố (Partial Failure), bản ghi hợp đồng `Draft` vẫn được giữ nguyên trong cơ sở dữ liệu kèm mã hợp đồng đã cấp để người dùng có thể thực hiện tải lại tệp mà không cần nhập lại biểu mẫu.

---

## 2. Tiêu chí Chấp nhận (Acceptance Criteria)

| Mã AC | Nội dung tiêu chí chấp nhận |
| :--- | :--- |
| **AC-01** | Khi mở màn hình **Tạo hợp đồng mới**, danh sách chọn khách hàng (`Dropdown/Combobox`) chỉ hiển thị các khách hàng có trạng thái `Active` được lấy từ API `GET /api/customers?activeOnly=true`. |
| **AC-02** | Hệ thống kiểm tra đầy đủ tính hợp lệ của dữ liệu trên cả Frontend và Backend cho các trường bắt buộc: Tên hợp đồng (`contractName`), Khách hàng (`customerId`), Ngày bắt đầu hiệu lực (`effectiveFrom`), Ngày kết thúc hiệu lực (`effectiveTo`), Giá trị hợp đồng (`contractValue`), Điều khoản thanh toán (`paymentTerms`) và Điều khoản dịch vụ (`serviceTerms`). |
| **AC-03** | Hệ thống từ chối lưu và trả về thông báo lỗi rõ ràng nếu: (a) `effectiveFrom > effectiveTo`; (b) `contractValue <= 0`; (c) `customerId` không tồn tại hoặc khách hàng có trạng thái `Inactive`; (d) Các trường văn bản bắt buộc bị bỏ trống, chỉ chứa khoảng trắng hoặc không đạt độ dài tối thiểu/tối đa. |
| **AC-04** | Hệ thống tự động sinh mã hợp đồng `contractCode` duy nhất theo mẫu `HD-YYYY-NNN` (ví dụ: `HD-2026-001`). Khi có từ 2 yêu cầu tạo hợp đồng hợp lệ gửi đến đồng thời (concurrent requests), hệ thống đảm bảo không bị trùng mã và không phát sinh lỗi `500 Internal Server Error` nhờ cơ chế `UNIQUE constraint` kết hợp retry tối đa 3 lần ở tầng ứng dụng. |
| **AC-05** | Hợp đồng mới tạo luôn có `status = 'Draft'`, `currency = 'VND'`, `createdBy = 'NV-KD-001 | Nguyễn Văn An'` (do Backend tự gán) và `createdAt` ghi nhận thời gian chuẩn UTC. |
| **AC-06** | Cho phép lưu hợp đồng `Draft` thành công ngay cả khi người dùng **chưa chọn tệp đính kèm nào** (Quy tắc nghiệp vụ `CTR-02` yêu cầu bắt buộc có tệp đính kèm chỉ áp dụng khi chuyển trạng thái sang `Submitted` ở `PB-09` thuộc Sprint 03). |
| **AC-07** | Khi người dùng đính kèm một hoặc nhiều tệp, hệ thống chỉ chấp nhận các định dạng `.pdf`, `.docx`, `.xlsx` với dung lượng mỗi tệp `> 0 bytes` và tối đa `20 MB` (`20,971,520 bytes`). Mọi tệp sai định dạng hoặc vượt quá dung lượng đều bị chặn và thông báo lỗi chi tiết. |
| **AC-08** | Hỗ trợ quy trình lưu 2 bước tách biệt (Bước 1: Tạo hợp đồng `POST /api/contracts`; Bước 2: Tải tệp `POST /api/contracts/{id}/attachments`). Nếu Bước 1 thành công nhưng Bước 2 thất bại, giao diện vẫn hiển thị mã hợp đồng `contractCode` đã được cấp, thông báo rõ nguyên nhân lỗi tải tệp và cung cấp nút **"Thử tải lại tệp"** để gọi lại riêng Bước 2 cho hợp đồng đó. |

---

## 3. Đặc tả Chi tiết Thực thể & Trường Dữ liệu

### 3.1. Thực thể Khách hàng (`Customer` - Bảng `customers`)
Dữ liệu khách hàng trong Sprint 01 được khởi tạo sẵn qua cơ chế Migration & Data Seeding để phục vụ việc tra cứu và chọn khách hàng khi lập hợp đồng.

| Tên trường (JSON / Code) | Cột CSDL | Kiểu dữ liệu | Bắt buộc | Ràng buộc & Quy tắc nghiệp vụ |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `id` | `UUID` | Có | Khóa chính (Primary Key), tự sinh UUID v4. |
| `customerCode` | `customer_code` | `VARCHAR(50)` | Có | `UNIQUE`. Mã khách hàng theo định dạng `KH-ABC-NNN` (ví dụ: `KH-ABC-001`). |
| `companyName` | `company_name` | `VARCHAR(255)` | Có | Tên pháp nhân đầy đủ của doanh nghiệp khách hàng. |
| `taxCode` | `tax_code` | `VARCHAR(50)` | Có | Mã số thuế doanh nghiệp (10-14 ký tự số/dấu gạch ngang). |
| `contactPerson` | `contact_person` | `VARCHAR(150)` | Có | Họ và tên người đại diện liên hệ. |
| `contactEmail` | `contact_email` | `VARCHAR(150)` | Có | Địa chỉ email liên hệ hợp lệ. |
| `contactPhone` | `contact_phone` | `VARCHAR(50)` | Có | Số điện thoại liên hệ. |
| `address` | `address` | `VARCHAR(500)` | Có | Địa chỉ trụ sở chính của khách hàng. |
| `status` | `status` | `VARCHAR(30)` | Có | Trạng thái hoạt động: chỉ nhận giá trị `'Active'` hoặc `'Inactive'`. |

---

### 3.2. Thực thể Hợp đồng (`Contract` - Bảng `contracts`)

| Tên trường (JSON / Code) | Cột CSDL | Kiểu dữ liệu | Bắt buộc | Ràng buộc & Quy tắc kiểm tra (Validation Rules) |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `id` | `UUID` | Tự sinh | Khóa chính (PK). Backend tự sinh khi khởi tạo bản ghi. |
| `contractCode` | `contract_code` | `VARCHAR(50)` | Tự sinh | `UNIQUE` index trong PostgreSQL. Định dạng `HD-YYYY-NNN` (trong đó `YYYY` là năm hiện tại theo UTC, `NNN` là số thứ tự tăng dần tối thiểu 3 chữ số, ví dụ: `HD-2026-001`, `HD-2026-012`). Có cơ chế chống đụng độ khi tạo đồng thời (retry tối đa 3 lần khi gặp lỗi `Unique Constraint`). |
| `contractName` | `contract_name` | `VARCHAR(255)` | **Có** | Chuỗi ký tự sau khi cắt khoảng trắng 2 đầu (`trim`) phải có độ dài từ **5 đến 255 ký tự**, không được rỗng hoặc chỉ chứa khoảng trắng. |
| `customerId` | `customer_id` | `UUID` | **Có** | Khóa ngoại (FK) tham chiếu tới `customers(id)`. Phải tồn tại trong CSDL và bản ghi khách hàng tương ứng bắt buộc có `status = 'Active'`. |
| `effectiveFrom` | `effective_from` | `DATE` | **Có** | Ngày bắt đầu hiệu lực hợp đồng, định dạng chuẩn ISO 8601 `YYYY-MM-DD`. |
| `effectiveTo` | `effective_to` | `DATE` | **Có** | Ngày kết thúc hiệu lực hợp đồng, định dạng chuẩn ISO 8601 `YYYY-MM-DD`. **Quy tắc bắt buộc**: `effectiveFrom <= effectiveTo`. |
| `contractValue` | `contract_value` | `DECIMAL(18,2)` | **Có** | Tổng giá trị hợp đồng trước/sau thuế theo thỏa thuận. Phải là số thực dương **`> 0`** (tối đa `999,999,999,999,999.99`). |
| `currency` | `currency` | `VARCHAR(10)` | Mặc định | Đơn vị tiền tệ. Mặc định cố định là `'VND'` ở Sprint 01 (nếu client không gửi hoặc gửi `'VND'` đều hợp lệ; nếu gửi mã ngoại tệ khác sẽ trả về lỗi `400 Bad Request`). |
| `paymentTerms` | `payment_terms` | `TEXT` | **Có** | Điều khoản thanh toán. Sau khi `trim()` phải có độ dài từ **10 đến 4000 ký tự**. |
| `serviceTerms` | `service_terms` | `TEXT` | **Có** | Điều khoản dịch vụ (phạm vi vận chuyển, kho bãi, SLA...). Sau khi `trim()` phải có độ dài từ **10 đến 4000 ký tự**. |
| `status` | `status` | `VARCHAR(30)` | Tự gán | Trạng thái hợp đồng. Khi tạo mới tại `PB-01`, Backend luôn gán cố định là `'Draft'`. |
| `createdBy` | `created_by` | `VARCHAR(100)` | Tự gán | Người tạo hợp đồng. Backend tự gán cố định chuỗi `"NV-KD-001 | Nguyễn Văn An"`. Không đọc từ request body. |
| `createdAt` | `created_at` | `TIMESTAMPTZ` | Tự sinh | Thời điểm tạo bản ghi theo múi giờ chuẩn UTC (ISO 8601 `YYYY-MM-DDTHH:mm:ssZ`). |
| `updatedAt` | `updated_at` | `TIMESTAMPTZ` | Không | `NULLABLE`. Thời điểm cập nhật gần nhất theo chuẩn UTC (khi mới tạo có thể là `null` hoặc bằng `createdAt`). |

---

### 3.3. Thực thể Tệp Đính kèm Hợp đồng (`ContractAttachment` - Bảng `contract_attachments`)

| Tên trường (JSON / Code) | Cột CSDL | Kiểu dữ liệu | Bắt buộc | Ràng buộc & Quy tắc nghiệp vụ |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `id` | `UUID` | Tự sinh | Khóa chính (PK). |
| `contractId` | `contract_id` | `UUID` | **Có** | Khóa ngoại (FK) tham chiếu tới `contracts(id)` (`ON DELETE CASCADE`). |
| `fileName` | `file_name` | `VARCHAR(255)` | **Có** | Tên tệp gốc từ máy người dùng (đã được làm sạch ký tự đường dẫn nguy hiểm). Chỉ chấp nhận phần mở rộng `.pdf`, `.docx`, `.xlsx` (không phân biệt hoa thường). |
| `storedFileName` | `stored_file_name` | `VARCHAR(255)` | Tự sinh | Tên tệp duy nhất lưu trên ổ đĩa server (ví dụ: `{uuid}_{sanitizedFileName}`) để tránh ghi đè khi trùng tên. |
| `filePath` | `file_path` | `VARCHAR(500)` | Tự sinh | Đường dẫn tương đối lưu trữ tệp trên server (ví dụ: `uploads/contracts/{contractId}/{storedFileName}`). |
| `contentType` | `content_type` | `VARCHAR(150)` | **Có** | MIME type của tệp tải lên, phải khớp với phần mở rộng hợp lệ. |
| `fileSize` | `file_size` | `BIGINT` | **Có** | Kích thước tệp tính bằng `bytes`. Bắt buộc `0 < fileSize <= 20,971,520` (tối đa `20 MB`). |
| `uploadedBy` | `uploaded_by` | `VARCHAR(100)` | Tự gán | Backend tự gán cố định `"NV-KD-001 | Nguyễn Văn An"`. |
| `uploadedAt` | `uploaded_at` | `TIMESTAMPTZ` | Tự sinh | Thời điểm tải tệp hoàn tất theo chuẩn UTC. |

---

## 4. Quy tắc Nghiệp vụ Trọng tâm & Quy trình Lưu 2 Bước

### 4.1. Danh mục Quy tắc Nghiệp vụ (Business Rules)

| Mã quy tắc | Tên quy tắc | Mô tả chi tiết xử lý kỹ thuật |
| :--- | :--- | :--- |
| **BR-01** | Tự động cấp mã hợp đồng duy nhất & chống đụng độ | Mã hợp đồng được sinh theo công thức `HD-{Year}-{Sequence:D3}` (ví dụ năm 2026: `HD-2026-001`, `HD-2026-002`, ...). Cột `contract_code` được đánh `UNIQUE INDEX` trong PostgreSQL. Khi có nhiều giao dịch đồng thời cùng đọc số thứ tự lớn nhất và chèn bản ghi dẫn tới ngoại lệ vi phạm khóa duy nhất (`PostgresException SqlState 23505`), tầng Service thực hiện **retry tối đa 3 lần** (mỗi lần tính toán lại số thứ tự kế tiếp và thử lưu lại). Nếu sau 3 lần thử lại vẫn xung đột, hệ thống trả về mã lỗi `409 Conflict` theo chuẩn `ProblemDetails`. |
| **BR-02** | Ràng buộc trạng thái khách hàng | Chỉ khách hàng có tồn tại trong bảng `customers` và có `status = 'Active'` mới được phép đứng tên trên hợp đồng mới. Nếu `customerId` không tồn tại trong CSDL, trả về `404 Not Found`. Nếu khách hàng tồn tại nhưng có `status = 'Inactive'`, trả về `422 Unprocessable Entity` (hoặc `400 Bad Request` kèm mã lỗi nghiệp vụ rõ ràng). |
| **BR-03** | Ràng buộc thời hạn và giá trị tài chính | Ngày bắt đầu hiệu lực không được lớn hơn ngày kết thúc hiệu lực (`effectiveFrom <= effectiveTo`). Giá trị hợp đồng (`contractValue`) bắt buộc lớn hơn `0`. |
| **BR-04** | Tệp đính kèm không bắt buộc ở trạng thái `Draft` | Người dùng được phép tạo và lưu hợp đồng `Draft` mà không cần chọn tệp đính kèm. Quy tắc bắt buộc có ít nhất 01 tệp đính kèm (`CTR-02`) chỉ được kiểm tra ở bước Gửi phê duyệt (`Submit` — `PB-09` ở Sprint 03). |
| **BR-05** | Kiểm soát định dạng và dung lượng tệp đính kèm | Mỗi tệp tải lên phải thỏa mãn đồng thời: <br>1. Phần mở rộng thuộc tập `{.pdf, .docx, .xlsx}` (in-sensitive). <br>2. `Content-Type` thuộc tập hợp lệ tương ứng: <br>   - `.pdf`: `application/pdf` <br>   - `.docx`: `application/vnd.openxmlformats-officedocument.wordprocessingml.document` <br>   - `.xlsx`: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` <br>   *(Lưu ý: Chấp nhận `application/octet-stream` nếu chữ ký tệp/phần mở rộng hợp lệ từ một số trình duyệt, nhưng ưu tiên kiểm tra chặt phần mở rộng và kích thước).* <br>3. Dung lượng tệp: `0 < fileSize <= 20,971,520 bytes` (`20 MB`). |
| **BR-06** | Bảo mật danh tính người tạo (`Server-side Audit Identity`) | Backend bỏ qua mọi trường `createdBy`/`uploadedBy` nếu client cố tình gửi lên và luôn ghi nhận giá trị cố định phía server: `"NV-KD-001 | Nguyễn Văn An"`. |

### 4.2. Quy trình Lưu 2 Bước & Xử lý Lỗi Từng phần (Two-Step Save & Partial Failure Handling)

Để đảm bảo trải nghiệm người dùng mượt mà và không làm mất dữ liệu biểu mẫu khi tệp đính kèm có dung lượng lớn hoặc gặp sự cố đường truyền, quy trình lưu trên giao diện được thiết kế thành **2 bước tuần tự**:

1. **Bước 1 - Khởi tạo bản ghi Hợp đồng (`POST /api/contracts`)**:
   - Khi người dùng nhấn nút **"Lưu nháp (Save Draft)"**, Frontend kiểm tra hợp lệ toàn bộ trường thông tin trên biểu mẫu (và kiểm tra sơ bộ danh sách tệp đã chọn ở phía Client nếu có).
   - Frontend gửi request `POST /api/contracts` với JSON body chứa thông tin hợp đồng.
   - Backend kiểm tra nghiệp vụ, sinh mã `contractCode`, lưu vào bảng `contracts` và trả về `201 Created` kèm đối tượng hợp đồng vừa tạo (bao gồm `id` và `contractCode`).
   - **Trường hợp người dùng không chọn tệp đính kèm**: Quy trình kết thúc ngay sau Bước 1. Giao diện hiển thị thông báo thành công kèm mã hợp đồng `contractCode` vừa cấp.

2. **Bước 2 - Tải tệp đính kèm lên Hợp đồng vừa tạo (`POST /api/contracts/{id}/attachments`)**:
   - **Trường hợp người dùng có chọn từ 1 tệp trở lên**: Ngay khi nhận được `id` từ Bước 1, Frontend tự động gọi tiếp `POST /api/contracts/{id}/attachments` với định dạng `multipart/form-data` (truyền toàn bộ các tệp qua trường `files`).
   - Nếu Bước 2 trả về `201 Created`: Giao diện hiển thị trạng thái hoàn tất toàn bộ (Hợp đồng `Draft` và danh sách tệp đính kèm đã được lưu thành công).

3. **Xử lý Lỗi Từng phần (Partial Failure tại Bước 2)**:
   - Nếu Bước 1 đã thành công (`201 Created`) nhưng Bước 2 thất bại (ví dụ: mạng gián đoạn, hoặc server trả về `400 Bad Request` do có tệp vượt quá `20 MB` / sai định dạng):
     - **Dữ liệu CSDL**: Bản ghi hợp đồng `Draft` đã tạo ở Bước 1 **vẫn được giữ nguyên trong PostgreSQL** với mã `contractCode` đã cấp (không rollback bản ghi hợp đồng).
     - **Trạng thái Giao diện (UI State)**:
       - Chuyển sang chế độ hiển thị cảnh báo **"Đã lưu hợp đồng nháp nhưng tải tệp đính kèm chưa hoàn tất"**.
       - Hiển thị rõ mã hợp đồng đã cấp (ví dụ: `HD-2026-001`) và khóa các trường thông tin hợp đồng đã lưu (hoặc giữ nguyên trạng thái gắn với `contractId` hiện tại) để **không tạo lặp bản ghi hợp đồng mới** khi người dùng thao tác lại.
       - Hiển thị chi tiết nguyên nhân lỗi của tệp đính kèm, cho phép người dùng loại bỏ tệp lỗi hoặc chọn tệp thay thế và nhấn nút **"Thử tải lại tệp"** (chỉ gọi lại `POST /api/contracts/{id}/attachments` với `id` đã có).

---

## 5. Đặc tả Hợp đồng Giao tiếp API (RESTful API Contract)

### Quy ước chung
- **Base URL**: `/api`
- **Định dạng dữ liệu**: `application/json; charset=utf-8` (riêng API tải tệp sử dụng `multipart/form-data`).
- **Quy ước đặt tên thuộc tính JSON**: `camelCase`.
- **Chuẩn phản hồi lỗi**: Tuân thủ **RFC 7807 (`application/problem+json` - `ProblemDetails` / `ValidationProblemDetails`)**.

---

### 5.1. API 1: Lấy danh sách Khách hàng đang hoạt động
Phục vụ đổ dữ liệu vào ô chọn Khách hàng (`Customer Select`) trên màn hình Tạo hợp đồng mới.

- **Endpoint**: `GET /api/customers`
- **Query Parameters**:
  - `activeOnly` (boolean, tùy chọn, mặc định `true`):
    - Khi `activeOnly=true`: Chỉ trả về các khách hàng có `status = 'Active'`, sắp xếp theo `customerCode` tăng dần.
    - Khi `activeOnly=false`: Trả về toàn bộ khách hàng trong hệ thống.

#### Response Thành công (`200 OK`)
```json
[
  {
    "id": "11111111-1111-1111-1111-111111111101",
    "customerCode": "KH-ABC-001",
    "companyName": "Công ty Cổ phần Chuỗi Cung Ứng Á Châu",
    "taxCode": "0312345678",
    "contactPerson": "Trần Minh Tuấn",
    "contactEmail": "tuan.tran@achau-scm.vn",
    "contactPhone": "0903123456",
    "address": "Số 12 Đại lộ Độc Lập, KCN Sóng Thần 1, TP. Dĩ An, Bình Dương",
    "status": "Active"
  },
  {
    "id": "11111111-1111-1111-1111-111111111102",
    "customerCode": "KH-ABC-002",
    "companyName": "Công ty TNHH Thương mại & Xuất nhập khẩu Thái Bình Dương",
    "taxCode": "0109876543",
    "contactPerson": "Lê Thu Hà",
    "contactEmail": "ha.le@pacific-imex.vn",
    "contactPhone": "0918234567",
    "address": "Tầng 8, Tòa nhà Hải An, Quận Hải An, TP. Hải Phòng",
    "status": "Active"
  }
]
```

---

### 5.2. API 2: Tạo mới Hợp đồng ở trạng thái `Draft`
Khởi tạo bản ghi hợp đồng mới trong bảng `contracts`, tự động cấp mã `contractCode` và gán trạng thái `'Draft'`.

- **Endpoint**: `POST /api/contracts`
- **Content-Type**: `application/json`

#### Cấu trúc Request Body (`CreateContractRequest`)
> **Lưu ý quan trọng**: Request body không nhận các trường `contractCode`, `status`, `createdBy`, `createdAt`. Nếu client truyền các trường này lên, Backend sẽ bỏ qua hoàn toàn.

```json
{
  "contractName": "Hợp đồng vận chuyển hàng tiêu dùng nhanh năm 2026",
  "customerId": "11111111-1111-1111-1111-111111111101",
  "effectiveFrom": "2026-04-01",
  "effectiveTo": "2027-03-31",
  "contractValue": 1250000000.00,
  "currency": "VND",
  "paymentTerms": "Thanh toán chuyển khoản trong vòng 30 ngày kể từ ngày nhận đủ bộ chứng từ vận chuyển và hóa đơn GTGT hợp lệ.",
  "serviceTerms": "Cung cấp dịch vụ vận tải đường bộ nguyên chuyến (FTL) từ kho Bình Dương đi các tỉnh miền Trung và miền Bắc theo SLA cam kết 48 giờ."
}
```

#### Response Thành công (`201 Created`)
- **Headers**: `Location: /api/contracts/9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d`
- **Body (`ContractDetailResponse`)**:
```json
{
  "id": "9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d",
  "contractCode": "HD-2026-001",
  "contractName": "Hợp đồng vận chuyển hàng tiêu dùng nhanh năm 2026",
  "customerId": "11111111-1111-1111-1111-111111111101",
  "customerCode": "KH-ABC-001",
  "customerName": "Công ty Cổ phần Chuỗi Cung Ứng Á Châu",
  "effectiveFrom": "2026-04-01",
  "effectiveTo": "2027-03-31",
  "contractValue": 1250000000.00,
  "currency": "VND",
  "paymentTerms": "Thanh toán chuyển khoản trong vòng 30 ngày kể từ ngày nhận đủ bộ chứng từ vận chuyển và hóa đơn GTGT hợp lệ.",
  "serviceTerms": "Cung cấp dịch vụ vận tải đường bộ nguyên chuyến (FTL) từ kho Bình Dương đi các tỉnh miền Trung và miền Bắc theo SLA cam kết 48 giờ.",
  "status": "Draft",
  "createdBy": "NV-KD-001 | Nguyễn Văn An",
  "createdAt": "2026-03-29T08:30:00Z",
  "updatedAt": null,
  "attachments": []
}
```

#### Các kịch bản Phản hồi Lỗi (`application/problem+json`)

1. **`400 Bad Request` - Dữ liệu đầu vào không hợp lệ (`ValidationProblemDetails`)**:
   Xảy ra khi thiếu trường bắt buộc, độ dài chuỗi không hợp lệ, `contractValue <= 0`, hoặc `effectiveFrom > effectiveTo`.
   ```json
   {
     "type": "https://tools.ietf.org/html/rfc7807",
     "title": "Dữ liệu đầu vào không hợp lệ.",
     "status": 400,
     "detail": "Vui lòng kiểm tra lại các trường thông tin hợp đồng.",
     "instance": "/api/contracts",
     "errors": {
       "contractName": [
         "Tên hợp đồng là bắt buộc và phải có độ dài từ 5 đến 255 ký tự."
       ],
       "effectiveTo": [
         "Ngày kết thúc hiệu lực phải lớn hơn hoặc bằng ngày bắt đầu hiệu lực."
       ],
       "contractValue": [
         "Giá trị hợp đồng phải lớn hơn 0."
       ]
     },
     "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00"
   }
   ```

2. **`404 Not Found` - Không tìm thấy khách hàng**:
   Xảy ra khi `customerId` không tồn tại trong bảng `customers`.
   ```json
   {
     "type": "https://tools.ietf.org/html/rfc7807",
     "title": "Không tìm thấy khách hàng.",
     "status": 404,
     "detail": "Khách hàng với mã định danh '99999999-9999-9999-9999-999999999999' không tồn tại trong hệ thống.",
     "instance": "/api/contracts",
     "errorCode": "CUSTOMER_NOT_FOUND",
     "traceId": "00-7a12f3577b34da6a3ce929d0e0e4736-11f067aa0ba902b7-00"
   }
   ```

3. **`422 Unprocessable Entity` (hoặc `400 Bad Request`) - Khách hàng không ở trạng thái hoạt động (`Inactive`)**:
   Xảy ra khi `customerId` có tồn tại nhưng có `status = 'Inactive'`.
   ```json
   {
     "type": "https://tools.ietf.org/html/rfc7807",
     "title": "Khách hàng không đủ điều kiện lập hợp đồng.",
     "status": 422,
     "detail": "Khách hàng 'KH-ABC-004' hiện đang ở trạng thái ngưng hoạt động (Inactive), không thể tạo hợp đồng mới.",
     "instance": "/api/contracts",
     "errorCode": "CUSTOMER_INACTIVE",
     "errors": {
       "customerId": [
         "Chỉ được phép tạo hợp đồng cho khách hàng đang ở trạng thái hoạt động (Active)."
       ]
     },
     "traceId": "00-8c34f3577b34da6a3ce929d0e0e4736-22f067aa0ba902b7-00"
   }
   ```

4. **`409 Conflict` - Xung đột sinh mã hợp đồng sau khi đã thử lại tối đa 3 lần**:
   ```json
   {
     "type": "https://tools.ietf.org/html/rfc7807",
     "title": "Xung đột cấp mã hợp đồng.",
     "status": 409,
     "detail": "Hệ thống đang xử lý nhiều yêu cầu tạo hợp đồng đồng thời. Vui lòng thử lại sau giây lát.",
     "instance": "/api/contracts",
     "errorCode": "CONTRACT_CODE_CONFLICT",
     "traceId": "00-9d45f3577b34da6a3ce929d0e0e4736-33f067aa0ba902b7-00"
   }
   ```

---

### 5.3. API 3: Xem chi tiết Hợp đồng kèm danh sách Tệp đính kèm
Truy vấn thông tin chi tiết của một hợp đồng và danh sách metadata các tệp đính kèm đã tải lên của hợp đồng đó.

- **Endpoint**: `GET /api/contracts/{id}`
- **Path Parameters**:
  - `id` (`UUID`, bắt buộc): Mã định danh của hợp đồng.

#### Response Thành công (`200 OK`)
```json
{
  "id": "9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d",
  "contractCode": "HD-2026-001",
  "contractName": "Hợp đồng vận chuyển hàng tiêu dùng nhanh năm 2026",
  "customerId": "11111111-1111-1111-1111-111111111101",
  "customerCode": "KH-ABC-001",
  "customerName": "Công ty Cổ phần Chuỗi Cung Ứng Á Châu",
  "effectiveFrom": "2026-04-01",
  "effectiveTo": "2027-03-31",
  "contractValue": 1250000000.00,
  "currency": "VND",
  "paymentTerms": "Thanh toán chuyển khoản trong vòng 30 ngày kể từ ngày nhận đủ bộ chứng từ vận chuyển và hóa đơn GTGT hợp lệ.",
  "serviceTerms": "Cung cấp dịch vụ vận tải đường bộ nguyên chuyến (FTL) từ kho Bình Dương đi các tỉnh miền Trung và miền Bắc theo SLA cam kết 48 giờ.",
  "status": "Draft",
  "createdBy": "NV-KD-001 | Nguyễn Văn An",
  "createdAt": "2026-03-29T08:30:00Z",
  "updatedAt": null,
  "attachments": [
    {
      "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "contractId": "9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d",
      "fileName": "Du_Thao_Hop_Dong_Van_Chuyen_2026.pdf",
      "contentType": "application/pdf",
      "fileSize": 1458290,
      "uploadedBy": "NV-KD-001 | Nguyễn Văn An",
      "uploadedAt": "2026-03-29T08:30:05Z"
    }
  ]
}
```

#### Response Lỗi (`404 Not Found`)
```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Không tìm thấy hợp đồng.",
  "status": 404,
  "detail": "Không tìm thấy hợp đồng với mã định danh '9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d'.",
  "instance": "/api/contracts/9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d",
  "errorCode": "CONTRACT_NOT_FOUND",
  "traceId": "00-5e67f3577b34da6a3ce929d0e0e4736-44f067aa0ba902b7-00"
}
```

---

### 5.4. API 4: Tải lên Tệp đính kèm cho Hợp đồng
Thực hiện tải lên một hoặc nhiều tệp đính kèm và gắn vào hợp đồng đã tồn tại.

- **Endpoint**: `POST /api/contracts/{id}/attachments`
- **Path Parameters**:
  - `id` (`UUID`, bắt buộc): Mã định danh của hợp đồng cần đính kèm tệp.
- **Content-Type**: `multipart/form-data`
- **Form Data Fields**:
  - `files`: Danh sách 1 hoặc nhiều tệp (`IFormFileCollection` / `List<IFormFile>`).

#### Quy tắc xử lý lô tệp (Batch Upload Policy)
- Trước khi lưu vật lý và ghi CSDL, Backend duyệt qua toàn bộ danh sách `files` trong request để kiểm tra tính hợp lệ (không rỗng, định dạng `.pdf`/`.docx`/`.xlsx`, dung lượng từng tệp `<= 20 MB`).
- Nếu **bất kỳ tệp nào** trong danh sách vi phạm quy tắc, Backend từ chối toàn bộ đợt tải lên đó và trả về `400 Bad Request` kèm danh sách lỗi cụ thể của từng tệp để người dùng điều chỉnh và bấm **"Thử tải lại tệp"**.

#### Response Thành công (`201 Created`)
```json
{
  "contractId": "9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d",
  "uploadedCount": 2,
  "attachments": [
    {
      "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "contractId": "9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d",
      "fileName": "Du_Thao_Hop_Dong_Van_Chuyen_2026.pdf",
      "contentType": "application/pdf",
      "fileSize": 1458290,
      "uploadedBy": "NV-KD-001 | Nguyễn Văn An",
      "uploadedAt": "2026-03-29T08:30:05Z"
    },
    {
      "id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      "contractId": "9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d",
      "fileName": "Bang_Gia_Cuoc_Van_Tai_Chi_Tiet.xlsx",
      "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "fileSize": 524100,
      "uploadedBy": "NV-KD-001 | Nguyễn Văn An",
      "uploadedAt": "2026-03-29T08:30:05Z"
    }
  ]
}
```

#### Các kịch bản Phản hồi Lỗi (`application/problem+json`)

1. **`400 Bad Request` - Tệp đính kèm không hợp lệ (Rỗng, vượt quá 20 MB, hoặc sai định dạng)**:
   ```json
   {
     "type": "https://tools.ietf.org/html/rfc7807",
     "title": "Tệp đính kèm không hợp lệ.",
     "status": 400,
     "detail": "Một hoặc nhiều tệp đính kèm không đáp ứng quy định về định dạng hoặc dung lượng.",
     "instance": "/api/contracts/9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d/attachments",
     "errorCode": "INVALID_ATTACHMENT",
     "errors": {
       "files": [
         "Tệp 'Phu_Luc_Hinh_Anh.png' không hợp lệ. Hệ thống chỉ hỗ trợ định dạng .pdf, .docx, .xlsx.",
         "Tệp 'Ho_So_Nang_Luc_Full.pdf' có dung lượng 24.5 MB, vượt quá giới hạn tối đa 20 MB/tệp."
       ]
     },
     "traceId": "00-6f78f3577b34da6a3ce929d0e0e4736-55f067aa0ba902b7-00"
   }
   ```

2. **`404 Not Found` - Hợp đồng không tồn tại**:
   ```json
   {
     "type": "https://tools.ietf.org/html/rfc7807",
     "title": "Không tìm thấy hợp đồng.",
     "status": 404,
     "detail": "Không tìm thấy hợp đồng với mã định danh '9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d' để đính kèm tệp.",
     "instance": "/api/contracts/9b2d4f8a-7c1e-4b6a-9d3e-8f5a2c1b4e7d/attachments",
     "errorCode": "CONTRACT_NOT_FOUND",
     "traceId": "00-7f89f3577b34da6a3ce929d0e0e4736-66f067aa0ba902b7-00"
   }
   ```

---

## 6. Ma trận Truy vết Yêu cầu sang Thiết kế & Kiểm thử (Traceability Matrix)

| Thành phần liên quan | Mã công việc | Người phụ trách | Điểm kết nối trực tiếp với tài liệu đặc tả này |
| :--- | :--- | :--- | :--- |
| **Mô hình Use Case UML** | `TASK-03` | Nguyễn Khả Như (`KN12345N`) | Mô hình hóa tác nhân Nhân viên Kinh doanh và các Use Case tạo hợp đồng `Draft`, chọn khách hàng `Active`, đính kèm tệp. |
| **Thiết kế CSDL & Seed Data** | `TASK-05` | Lê Quang Linh (`linh285`) | Ánh xạ 3 bảng `customers`, `contracts`, `contract_attachments`, `UNIQUE index` cho `contract_code` và nạp dữ liệu khách hàng `Active` / `Inactive`. |
| **Xử lý lỗi chuẩn RFC 7807** | `TASK-06` | Lê Quang Linh (`linh285`) | Chuẩn hóa phản hồi `ProblemDetails` và `ValidationProblemDetails` đúng cấu trúc tại Mục 5. |
| **Backend APIs (`PB-01`)** | `TASK-08`, `TASK-09` | Thạch Ý (`ThachY-23120411`) | Hiện thực hóa 4 endpoints tại Mục 5, cơ chế sinh mã `HD-YYYY-NNN` kèm retry 3 lần và danh tính cố định `"NV-KD-001 \| Nguyễn Văn An"`. |
| **Giao diện Tạo hợp đồng** | `TASK-10`, `TASK-12` | Trần Ngọc Long (`LONGTRAN2700`) | Xây dựng Form nhập liệu, validation bằng Zod và quy trình lưu 2 bước kèm nút **"Thử tải lại tệp"** khi gặp Partial Failure. |
| **Kịch bản & Kiểm thử Tự động** | `TASK-13`, `TASK-14` | Đặng Hữu Phú (`PhuHuuDang`) | Đối chiếu 8 tiêu chí chấp nhận (`AC-01` -> `AC-08`) và các mã trạng thái HTTP (`200`, `201`, `400`, `404`, `409`, `422`). |
