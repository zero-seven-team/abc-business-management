# Tài liệu Kịch bản Kiểm thử Chi tiết (Test Cases Specification)
## Hạng mục: PB-01 — Tạo và lưu hợp đồng mới ở trạng thái Draft

| Thuộc tính | Nội dung chi tiết |
| :--- | :--- |
| **Mã Product Backlog** | `PB-01` |
| **Thuộc Sprint** | `Sprint 01` |
| **Mã công việc (Task)** | `TASK-13` — Thiết kế bộ Test Cases kiểm thử chức năng, API và ràng buộc dữ liệu cho PB-01 |
| **Liên kết GitHub Issues** | Issue `#1` (`PB-01`), Issue `#14` (`TASK-13`) |
| **Người thực hiện** | Đặng Hữu Phú (`PhuHuuDang`) — Đảm bảo chất lượng & Kiểm thử (QA/QC) |
| **Tài liệu đối chiếu** | `docs/specs/PB-01-create-contract-spec.md` (`TASK-02`), `docs/uml/use-case-PB01.md` (`TASK-03`) |

---

## 1. Phạm vi & Chiến lược Kiểm thử trong Sprint 01

Bộ kịch bản kiểm thử cho `PB-01` được thiết kế nhằm xác minh toàn diện 8 tiêu chí chấp nhận (`AC-01` đến `AC-08`) và 6 quy tắc nghiệp vụ (`BR-01` đến `BR-06`) trên cả 3 tầng:
1. **Tầng Cơ sở dữ liệu (PostgreSQL)**: Kiểm tra ràng buộc khóa chính, khóa ngoại, chỉ mục duy nhất (`UNIQUE index` trên `contract_code`) và tính bền vững của dữ liệu sau khi khởi động lại dịch vụ.
2. **Tầng Backend Web API (.NET 10)**: Kiểm thử đơn vị (Unit Tests) và kiểm thử tích hợp (Integration Tests) cho 4 API endpoints cùng định dạng phản hồi lỗi chuẩn RFC 7807 (`ProblemDetails` / `ValidationProblemDetails`).
3. **Tầng Giao diện Web (React + TypeScript)**: Kiểm thử luồng nhập liệu, kiểm tra lỗi phía Client, quy trình lưu 2 bước và cơ chế **"Thử tải lại tệp"** khi xảy ra lỗi từng phần (`Partial Failure`).

---

## 2. Ma trận Độ phủ Tiêu chí Chấp nhận (Acceptance Criteria Coverage Matrix)

| Mã AC | Tóm tắt Tiêu chí Chấp nhận | Các Mã Test Case Bao phủ |
| :--- | :--- | :--- |
| **AC-01** | Chỉ hiển thị và cho phép chọn khách hàng có trạng thái `Active` | `TC-PB01-01`, `TC-PB01-02`, `TC-PB01-09`, `TC-PB01-10` |
| **AC-02** | Kiểm tra đầy đủ các trường bắt buộc trên cả Frontend và Backend | `TC-PB01-03`, `TC-PB01-06`, `TC-PB01-17` |
| **AC-03** | Chặn lưu khi `effectiveFrom > effectiveTo`, `contractValue <= 0`, khách hàng `Inactive` hoặc không tồn tại | `TC-PB01-07`, `TC-PB01-08`, `TC-PB01-09`, `TC-PB01-10` |
| **AC-04** | Tự động cấp mã `HD-YYYY-NNN` duy nhất; xử lý đồng thời (concurrency) không trùng mã và không lỗi `500` | `TC-PB01-03`, `TC-PB01-11` |
| **AC-05** | Hợp đồng mới luôn có `status = 'Draft'`, `currency = 'VND'`, `createdBy = 'NV-KD-001 \| Nguyễn Văn An'` (do Server tự gán) | `TC-PB01-03`, `TC-PB01-12` |
| **AC-06** | Cho phép lưu hợp đồng `Draft` thành công khi chưa đính kèm tệp | `TC-PB01-03`, `TC-PB01-18` |
| **AC-07** | Chỉ chấp nhận tệp `.pdf`, `.docx`, `.xlsx` với dung lượng `> 0` và `<= 20 MB`/tệp | `TC-PB01-04`, `TC-PB01-13`, `TC-PB01-14`, `TC-PB01-15` |
| **AC-08** | Quy trình lưu 2 bước; giữ nguyên hợp đồng `Draft` và cho phép **"Thử tải lại tệp"** khi Bước 2 thất bại | `TC-PB01-16`, `TC-PB01-19`, `TC-PB01-20` |

---

## 3. Danh mục Kịch bản Kiểm thử Chi tiết (Detailed Test Cases)

### 3.1. Nhóm Kiểm thử Danh mục Khách hàng & Luồng Tạo Hợp đồng Thành công (Positive Cases)

| Mã TC | Tên kịch bản kiểm thử | Điều kiện tiên quyết & Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi (Expected Result) | Mức ưu tiên |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-PB01-01** | Lấy danh sách khách hàng đang hoạt động (`activeOnly=true`) | CSDL đã seed 3 khách hàng `Active` (`KH-ABC-001..003`) và 1 khách hàng `Inactive` (`KH-ABC-004`). | Gọi `GET /api/customers?activeOnly=true` (hoặc `GET /api/customers`). | - HTTP Status: `200 OK`.<br>- Danh sách trả về đúng 3 khách hàng có `status = "Active"`, sắp xếp theo `customerCode` tăng dần.<br>- Không xuất hiện khách hàng `KH-ABC-004`. | Cao |
| **TC-PB01-02** | Lấy toàn bộ khách hàng khi truyền `activeOnly=false` | CSDL đã seed đủ 4 khách hàng mẫu. | Gọi `GET /api/customers?activeOnly=false`. | - HTTP Status: `200 OK`.<br>- Trả về đầy đủ cả khách hàng `Active` và `Inactive` (4 bản ghi). | Trung bình |
| **TC-PB01-03** | Tạo mới hợp đồng `Draft` hợp lệ không kèm tệp đính kèm | Chọn `customerId` của `KH-ABC-001` (`Active`); `contractName` hợp lệ; `effectiveFrom = 2026-04-01`, `effectiveTo = 2027-03-31`; `contractValue = 1250000000`; đủ điều khoản thanh toán & dịch vụ. | 1. Gửi `POST /api/contracts` với JSON hợp lệ.<br>2. Gọi tiếp `GET /api/contracts/{id}` để đối chiếu. | - HTTP Status: `201 Created` kèm header `Location`.<br>- `contractCode` tự sinh đúng mẫu `HD-2026-NNN`.<br>- `status = "Draft"`, `currency = "VND"`.<br>- `createdBy = "NV-KD-001 \| Nguyễn Văn An"`, `createdAt` khác null, `attachments = []`. | Cao |
| **TC-PB01-04** | Tạo hợp đồng `Draft` và tải lên nhiều tệp đính kèm hợp lệ (`.pdf`, `.docx`, `.xlsx`) | Hợp đồng `Draft` vừa được tạo ở Bước 1 (`contractId` hợp lệ); chuẩn bị 2 tệp: `hop-dong.pdf` (1.2 MB) và `bang-gia.xlsx` (500 KB). | 1. Gửi `POST /api/contracts/{id}/attachments` (`multipart/form-data`) chứa 2 tệp.<br>2. Gọi `GET /api/contracts/{id}`. | - Bước tải tệp trả về `201 Created`, `uploadedCount = 2`.<br>- Khi gọi `GET /api/contracts/{id}`, mảng `attachments` chứa đủ 2 phần tử với đúng `fileName`, `fileSize`, `contentType` và `uploadedBy = "NV-KD-001 \| Nguyễn Văn An"`. | Cao |
| **TC-PB01-05** | Kiểm tra truy vấn chi tiết hợp đồng không tồn tại | Chuẩn bị một UUID ngẫu nhiên chưa có trong bảng `contracts`. | Gọi `GET /api/contracts/99999999-9999-9999-9999-999999999999`. | - HTTP Status: `404 Not Found`.<br>- Body trả về chuẩn `ProblemDetails` với `errorCode = "CONTRACT_NOT_FOUND"`. | Trung bình |

---

### 3.2. Nhóm Kiểm thử Ràng buộc Nghiệp vụ & Dữ liệu Không hợp lệ (Negative & Validation Cases)

| Mã TC | Tên kịch bản kiểm thử | Dữ liệu đầu vào | Các bước thực hiện | Kết quả mong đợi (Expected Result) | Mức ưu tiên |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-PB01-06** | Tạo hợp đồng thiếu các trường bắt buộc hoặc chuỗi chỉ chứa khoảng trắng | `contractName = "   "`, `paymentTerms = ""`, `serviceTerms = "ngắn"`. | Gửi `POST /api/contracts`. | - HTTP Status: `400 Bad Request` (`ValidationProblemDetails`).<br>- Đối tượng `errors` liệt kê rõ lỗi tại các trường `contractName`, `paymentTerms`, `serviceTerms`.<br>- Không có bản ghi nào được chèn vào bảng `contracts`. | Cao |
| **TC-PB01-07** | Tạo hợp đồng có ngày bắt đầu lớn hơn ngày kết thúc (`effectiveFrom > effectiveTo`) | `effectiveFrom = "2026-12-31"`, `effectiveTo = "2026-01-01"`. | Gửi `POST /api/contracts`. | - HTTP Status: `400 Bad Request`.<br>- Trường `errors.effectiveTo` chứa thông báo: *"Ngày kết thúc hiệu lực phải lớn hơn hoặc bằng ngày bắt đầu hiệu lực."* | Cao |
| **TC-PB01-08** | Tạo hợp đồng có giá trị bằng `0` hoặc số âm (`contractValue <= 0`) | Thử lần lượt với `contractValue = 0` và `contractValue = -500000`. | Gửi `POST /api/contracts`. | - HTTP Status: `400 Bad Request`.<br>- Trường `errors.contractValue` chứa thông báo: *"Giá trị hợp đồng phải lớn hơn 0."* | Cao |
| **TC-PB01-09** | Tạo hợp đồng với `customerId` không tồn tại trong hệ thống | `customerId = "99999999-9999-9999-9999-999999999999"`. | Gửi `POST /api/contracts`. | - HTTP Status: `404 Not Found`.<br>- Body chuẩn `ProblemDetails` có `errorCode = "CUSTOMER_NOT_FOUND"`. | Cao |
| **TC-PB01-10** | Tạo hợp đồng cho khách hàng đang ở trạng thái ngưng hoạt động (`Inactive`) | `customerId` của khách hàng mẫu `KH-ABC-004` (`status = 'Inactive'`). | Gửi `POST /api/contracts`. | - HTTP Status: `422 Unprocessable Entity` (hoặc `400 Bad Request`).<br>- Body chuẩn `ProblemDetails` có `errorCode = "CUSTOMER_INACTIVE"`.<br>- Không tạo bản ghi hợp đồng trong CSDL. | Cao |

---

### 3.3. Nhóm Kiểm thử Đồng thời, Bảo mật Audit & Kiểm soát Tệp Đính kèm

| Mã TC | Tên kịch bản kiểm thử | Dữ liệu đầu vào & Kịch bản | Các bước thực hiện | Kết quả mong đợi (Expected Result) | Mức ưu tiên |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-PB01-11** | Kiểm thử gửi đồng thời nhiều yêu cầu tạo hợp đồng (Concurrency & Retry) | Chuẩn bị 5 request `POST /api/contracts` hợp lệ. | Sử dụng `Task.WhenAll` bắn đồng thời 5 request vào Backend kết nối PostgreSQL thật. | - Cả 5 request đều trả về `201 Created` (không có request nào bị lỗi `500 Internal Server Error`).<br>- Cả 5 hợp đồng được cấp 5 mã `contractCode` hoàn toàn khác nhau và tuần tự theo quy tắc `HD-YYYY-NNN`. | Cao |
| **TC-PB01-12** | Kiểm thử bảo mật danh tính người tạo (`Server-side Audit Identity` — `BR-06`) | Cố tình chèn `"createdBy": "Hacker_Fake_User"`, `"status": "Approved"`, `"contractCode": "HD-9999-999"` vào JSON body. | Gửi `POST /api/contracts`. | - HTTP Status: `201 Created`.<br>- Backend bỏ qua các trường giả mạo: bản ghi trả về và lưu trong DB vẫn có `createdBy = "NV-KD-001 \| Nguyễn Văn An"`, `status = "Draft"` và `contractCode` do hệ thống tự cấp. | Cao |
| **TC-PB01-13** | Chặn tải lên tệp đính kèm sai định dạng (`.png`, `.exe`, `.zip`) | Hợp đồng đã tạo hợp lệ; chọn tệp `anh-chup.png` hoặc `script.exe`. | Gửi `POST /api/contracts/{id}/attachments`. | - HTTP Status: `400 Bad Request`.<br>- `errorCode = "INVALID_ATTACHMENT"`, thông báo rõ chỉ hỗ trợ `.pdf`, `.docx`, `.xlsx`.<br>- Không có bản ghi nào được thêm vào bảng `contract_attachments`. | Cao |
| **TC-PB01-14** | Chặn tải lên tệp đính kèm vượt quá `20 MB` (`20,971,520 bytes`) | Tạo tệp giả lập `ho-so-nang-luc.pdf` có kích thước `21 MB` (`22,020,096 bytes`). | Gửi `POST /api/contracts/{id}/attachments`. | - HTTP Status: `400 Bad Request`.<br>- `errorCode = "INVALID_ATTACHMENT"`, thông báo tệp vượt quá giới hạn tối đa `20 MB/tệp`. | Cao |
| **TC-PB01-15** | Chặn tải lên tệp rỗng (`0 bytes`) hoặc không truyền tệp nào | Gửi `POST /api/contracts/{id}/attachments` với tệp `0 bytes` hoặc form-data rỗng. | Gửi request lên API tải tệp. | - HTTP Status: `400 Bad Request` kèm thông báo lỗi rõ ràng trong `ProblemDetails`. | Trung bình |
| **TC-PB01-16** | Kiểm thử phục hồi lỗi từng phần (Bước 1 thành công, Bước 2 lỗi -> Thử tải lại tệp thành công) | Bước 1 tạo hợp đồng thành công (`id` đã có); lần 1 gửi tệp `.png` bị lỗi `400`; lần 2 gửi lại tệp `.pdf` hợp lệ vào cùng `id`. | 1. Gọi `POST /api/contracts` -> Nhận `id` & `contractCode`.<br>2. Gọi `POST /api/contracts/{id}/attachments` với tệp `.png` -> Nhận `400`.<br>3. Kiểm tra `GET /api/contracts/{id}` -> Hợp đồng `Draft` vẫn tồn tại.<br>4. Gọi lại `POST /api/contracts/{id}/attachments` với tệp `.pdf` hợp lệ. | - Sau bước 2, hợp đồng `Draft` vẫn tồn tại nguyên vẹn trong PostgreSQL với mã `contractCode` đã cấp.<br>- Ở bước 4, API trả về `201 Created` và tệp `.pdf` được gắn thành công vào đúng hợp đồng đó mà không sinh thêm bản ghi hợp đồng thứ hai. | Cao |

---

### 3.4. Nhóm Kiểm thử Giao diện Web End-to-End (UI & Persistence Cases)

| Mã TC | Tên kịch bản kiểm thử | Các bước thực hiện trên trình duyệt | Kết quả mong đợi (Expected Result) | Mức ưu tiên |
| :--- | :--- | :--- | :--- | :---: |
| **TC-PB01-17** | Kiểm tra hiển thị lỗi Validation trực tiếp trên Form React | Mở màn hình **Tạo hợp đồng mới**, không nhập dữ liệu hoặc nhập ngày kết thúc nhỏ hơn ngày bắt đầu rồi nhấn **"Lưu nháp"**. | Các ô lỗi chuyển viền đỏ `#DC2626`, hiển thị thông báo tiếng Việt ngay dưới từng trường và không gọi API `POST /api/contracts`. | Cao |
| **TC-PB01-18** | Lưu hợp đồng `Draft` không kèm tệp trên giao diện Web | Chọn khách hàng `Active`, nhập đầy đủ thông tin hợp lệ, để trống vùng tệp đính kèm và nhấn **"Lưu nháp"**. | Hiển thị màn hình/thông báo thành công màu xanh `#16A34A` kèm mã hợp đồng `HD-2026-NNN` và trạng thái `Draft`. | Cao |
| **TC-PB01-19** | Kiểm thử trạng thái UI `Partial Failure` và nút **"Thử tải lại tệp"** | Tạo hợp đồng kèm 1 tệp không hợp lệ (để giả lập lỗi Bước 2), kiểm tra Banner cảnh báo trên UI, sau đó chọn lại tệp `.pdf` hợp lệ và nhấn **"Thử tải lại tệp"**. | UI giữ nguyên mã hợp đồng đã tạo ở Bước 1, khóa các trường thông tin hợp đồng, hiển thị nút **"Thử tải lại tệp"** và hoàn tất lưu tệp thành công khi bấm thử lại. | Cao |
| **TC-PB01-20** | Kiểm tra tính bền vững của dữ liệu sau khi khởi động lại Backend (Data Persistence) | Tạo thành công 1 hợp đồng `Draft` kèm tệp đính kèm, dừng tiến trình Backend API và khởi động lại, sau đó gọi `GET /api/contracts/{id}`. | Dữ liệu hợp đồng và danh sách tệp đính kèm vẫn còn nguyên vẹn 100% trong PostgreSQL. | Cao |
