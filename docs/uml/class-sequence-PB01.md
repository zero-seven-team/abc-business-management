# Thiết kế Kỹ thuật UML: Sơ đồ Lớp (Class Diagram) & Sơ đồ Tuần tự (Sequence Diagram) — `PB-01`

| Thông tin tài liệu | Chi tiết |
| :--- | :--- |
| **Dự án** | Hệ thống Quản trị Kinh doanh — Công ty ABC (`ABC Business Management`) |
| **Sprint** | Sprint 01 |
| **Hạng mục (Product Backlog)** | `PB-01` — Tạo và lưu hợp đồng mới ở trạng thái `Draft` (Issue `#1`) |
| **Mã công việc** | `TASK-07` — Thiết kế UML Class Diagram & Sequence Diagram cho `PB-01` (Issue `#8`) |
| **Người thực hiện** | Thạch Ý (`ThachY-23120411`) |
| **Tài liệu tham chiếu** | [`PB-01-create-contract-spec.md`](../specs/PB-01-create-contract-spec.md), [`use-case-PB01.md`](./use-case-PB01.md) |
| **Phiên bản** | `v1.0` |

---

## 1. Tổng quan Kiến trúc Phân lớp (Layered Architecture)

Hệ thống Backend cho `PB-01` được tổ chức theo kiến trúc phân lớp chuẩn trên nền tảng **.NET 10 Web API** và **Entity Framework Core (PostgreSQL)**:

1. **`AbcBusinessManagement.Domain`**:
   - Chứa các thực thể cốt lõi (`BaseEntity`, `Customer`, `Contract`, `ContractAttachment`), hằng số nghiệp vụ (`AuditConstants`) và ngoại lệ miền (`DomainException`).
   - Không phụ thuộc vào bất kỳ thư viện hạ tầng hay framework giao tiếp nào.
2. **`AbcBusinessManagement.Application`**:
   - Chứa các hợp đồng dịch vụ (`IContractService`, `ICustomerService`, `IContractAttachmentService`), các đối tượng truyền tải dữ liệu (`CreateContractRequest`, `ContractDetailResponse`, `ContractAttachmentResponse`, `UploadContractAttachmentsResponse`, `CustomerResponse`) và ngoại lệ kiểm tra đầu vào (`RequestValidationException`).
3. **`AbcBusinessManagement.Infrastructure`**:
   - Hiện thực hóa truy cập dữ liệu qua `ApplicationDbContext`, các cấu hình Fluent API (`CustomerConfiguration`, `ContractConfiguration`, `ContractAttachmentConfiguration`), dữ liệu khởi tạo (`CustomerSeedData`) và các lớp xử lý nghiệp vụ (`ContractService`, `CustomerService`, `ContractAttachmentService`).
4. **`AbcBusinessManagement.Api`**:
   - Cung cấp các RESTful Controllers (`ContractsController`, `CustomersController`), bộ xử lý ngoại lệ tập trung chuẩn RFC 7807 (`GlobalExceptionHandler`, `ProblemResponse`) và middleware ghi nhận nhật ký truy cập (`RequestLoggingMiddleware`).

---

## 2. Sơ đồ Lớp (UML Class Diagram — `PB-01`)

### 2.1. Biểu diễn bằng Mermaid (`classDiagram`)

```mermaid
classDiagram
    direction TB

    class BaseEntity {
        <<abstract>>
        +Guid Id
        +DateTime CreatedAt
        +DateTime? UpdatedAt
    }

    class Customer {
        +string CustomerCode
        +string CompanyName
        +string TaxCode
        +string ContactPerson
        +string ContactEmail
        +string ContactPhone
        +string Address
        +string Status
        +ICollection~Contract~ Contracts
    }

    class Contract {
        +string ContractCode
        +string ContractName
        +Guid CustomerId
        +DateOnly EffectiveFrom
        +DateOnly EffectiveTo
        +decimal ContractValue
        +string Currency
        +string PaymentTerms
        +string ServiceTerms
        +string Status
        +string CreatedBy
        +Customer Customer
        +ICollection~ContractAttachment~ Attachments
    }

    class ContractAttachment {
        +Guid Id
        +Guid ContractId
        +string FileName
        +string StoredFileName
        +string FilePath
        +string ContentType
        +long FileSize
        +string UploadedBy
        +DateTime UploadedAt
        +Contract Contract
    }

    class AuditConstants {
        <<static>>
        +string DefaultActor = "NV-KD-001 | Nguyễn Văn An"
        +string DefaultCurrency = "VND"
        +string DraftStatus = "Draft"
        +string ActiveCustomerStatus = "Active"
        +int MaxContractCodeRetries = 3
        +long MaxAttachmentSizeBytes = 20971520
    }

    class DomainException {
        +string ErrorCode
        +DomainException(string errorCode, string message)
    }

    class RequestValidationException {
        +IDictionary~string, string[]~ Errors
        +RequestValidationException(IDictionary~string, string[]~ errors)
    }

    class CreateContractRequest {
        +string ContractName
        +Guid CustomerId
        +DateOnly EffectiveFrom
        +DateOnly EffectiveTo
        +decimal ContractValue
        +string? Currency
        +string PaymentTerms
        +string ServiceTerms
    }

    class ContractDetailResponse {
        +Guid Id
        +string ContractCode
        +string ContractName
        +Guid CustomerId
        +string CustomerCode
        +string CustomerName
        +DateOnly EffectiveFrom
        +DateOnly EffectiveTo
        +decimal ContractValue
        +string Currency
        +string PaymentTerms
        +string ServiceTerms
        +string Status
        +string CreatedBy
        +DateTime CreatedAt
        +DateTime? UpdatedAt
        +IReadOnlyList~ContractAttachmentResponse~ Attachments
    }

    class ContractAttachmentResponse {
        +Guid Id
        +Guid ContractId
        +string FileName
        +string ContentType
        +long FileSize
        +string UploadedBy
        +DateTime UploadedAt
    }

    class UploadContractAttachmentsResponse {
        +Guid ContractId
        +int UploadedCount
        +IReadOnlyList~ContractAttachmentResponse~ Attachments
    }

    class CustomerResponse {
        +Guid Id
        +string CustomerCode
        +string CompanyName
        +string TaxCode
        +string ContactPerson
        +string ContactEmail
        +string ContactPhone
        +string Address
        +string Status
    }

    class IContractService {
        <<interface>>
        +CreateDraftAsync(CreateContractRequest request, CancellationToken ct) Task~ContractDetailResponse~
        +GetByIdAsync(Guid id, CancellationToken ct) Task~ContractDetailResponse~
    }

    class ICustomerService {
        <<interface>>
        +GetCustomersAsync(bool activeOnly, CancellationToken ct) Task~IReadOnlyList~CustomerResponse~~
    }

    class IContractAttachmentService {
        <<interface>>
        +UploadAttachmentsAsync(Guid contractId, IReadOnlyList~AttachmentFileUploadItem~ files, CancellationToken ct) Task~UploadContractAttachmentsResponse~
    }

    class ApplicationDbContext {
        +DbSet~Customer~ Customers
        +DbSet~Contract~ Contracts
        +DbSet~ContractAttachment~ ContractAttachments
    }

    class ContractService {
        -ApplicationDbContext _dbContext
        -ILogger~ContractService~ _logger
        +CreateDraftAsync(CreateContractRequest request, CancellationToken ct) Task~ContractDetailResponse~
        +GetByIdAsync(Guid id, CancellationToken ct) Task~ContractDetailResponse~
        -ValidateRequest(CreateContractRequest request) void
        -GenerateNextContractCodeAsync(int year, CancellationToken ct) Task~string~
    }

    class CustomerService {
        -ApplicationDbContext _dbContext
        +GetCustomersAsync(bool activeOnly, CancellationToken ct) Task~IReadOnlyList~CustomerResponse~~
    }

    class ContractAttachmentService {
        -ApplicationDbContext _dbContext
        -ILogger~ContractAttachmentService~ _logger
        +UploadAttachmentsAsync(Guid contractId, IReadOnlyList~AttachmentFileUploadItem~ files, CancellationToken ct) Task~UploadContractAttachmentsResponse~
    }

    class ContractsController {
        -IContractService _contractService
        -IContractAttachmentService _attachmentService
        +CreateDraft(CreateContractRequest request, CancellationToken ct) Task~IActionResult~
        +GetById(Guid id, CancellationToken ct) Task~IActionResult~
        +UploadAttachments(Guid id, List~IFormFile~ files, CancellationToken ct) Task~IActionResult~
    }

    class CustomersController {
        -ICustomerService _customerService
        +GetCustomers(bool activeOnly, CancellationToken ct) Task~IActionResult~
    }

    class GlobalExceptionHandler {
        +TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct) ValueTask~bool~
    }

    BaseEntity <|-- Customer
    BaseEntity <|-- Contract
    Customer "1" --> "0..*" Contract : đứng tên (customer_id)
    Contract "1" *-- "0..*" ContractAttachment : đính kèm (contract_id)

    IContractService <|.. ContractService
    ICustomerService <|.. CustomerService
    IContractAttachmentService <|.. ContractAttachmentService

    ContractService --> ApplicationDbContext
    ContractService --> AuditConstants
    ContractService ..> DomainException
    ContractService ..> RequestValidationException

    CustomerService --> ApplicationDbContext
    ContractAttachmentService --> ApplicationDbContext
    ContractAttachmentService --> AuditConstants
    ContractAttachmentService ..> DomainException

    ContractsController --> IContractService
    ContractsController --> IContractAttachmentService
    CustomersController --> ICustomerService
    GlobalExceptionHandler ..> DomainException
    GlobalExceptionHandler ..> RequestValidationException
```

### 2.2. Mã nguồn PlantUML tương đương

```plantuml
@startuml PB01_Class_Diagram
skinparam classAttributeIconSize 0
skinparam packageStyle rectangle

package "AbcBusinessManagement.Domain" {
  abstract class BaseEntity {
    +Id : Guid
    +CreatedAt : DateTime
    +UpdatedAt : DateTime?
  }

  class Customer extends BaseEntity {
    +CustomerCode : string
    +CompanyName : string
    +TaxCode : string
    +ContactPerson : string
    +ContactEmail : string
    +ContactPhone : string
    +Address : string
    +Status : string
  }

  class Contract extends BaseEntity {
    +ContractCode : string
    +ContractName : string
    +CustomerId : Guid
    +EffectiveFrom : DateOnly
    +EffectiveTo : DateOnly
    +ContractValue : decimal
    +Currency : string
    +PaymentTerms : string
    +ServiceTerms : string
    +Status : string
    +CreatedBy : string
  }

  class ContractAttachment {
    +Id : Guid
    +ContractId : Guid
    +FileName : string
    +StoredFileName : string
    +FilePath : string
    +ContentType : string
    +FileSize : long
    +UploadedBy : string
    +UploadedAt : DateTime
  }

  class DomainException {
    +ErrorCode : string
  }

  Customer "1" -- "0..*" Contract : customer_id >
  Contract "1" *-- "0..*" ContractAttachment : contract_id >
}

package "AbcBusinessManagement.Application" {
  interface IContractService {
    +CreateDraftAsync(request : CreateContractRequest, ct : CancellationToken) : Task<ContractDetailResponse>
    +GetByIdAsync(id : Guid, ct : CancellationToken) : Task<ContractDetailResponse>
  }

  interface ICustomerService {
    +GetCustomersAsync(activeOnly : bool, ct : CancellationToken) : Task<IReadOnlyList<CustomerResponse>>
  }

  interface IContractAttachmentService {
    +UploadAttachmentsAsync(contractId : Guid, files : IReadOnlyList<AttachmentFileUploadItem>, ct : CancellationToken) : Task<UploadContractAttachmentsResponse>
  }
}

package "AbcBusinessManagement.Infrastructure" {
  class ApplicationDbContext
  class ContractService implements IContractService
  class CustomerService implements ICustomerService
  class ContractAttachmentService implements IContractAttachmentService

  ContractService --> ApplicationDbContext
  CustomerService --> ApplicationDbContext
  ContractAttachmentService --> ApplicationDbContext
}

package "AbcBusinessManagement.Api" {
  class ContractsController
  class CustomersController
  class GlobalExceptionHandler

  ContractsController --> IContractService
  ContractsController --> IContractAttachmentService
  CustomersController --> ICustomerService
}
@enduml
```

---

## 3. Đặc tả Trách nhiệm các Lớp Cốt lõi

| Lớp / Interface | Tầng (Layer) | Trách nhiệm kỹ thuật chi tiết |
| :--- | :--- | :--- |
| `Customer`, `Contract`, `ContractAttachment` | `Domain` | Mô hình hóa dữ liệu bảng `customers`, `contracts`, `contract_attachments` trong PostgreSQL. |
| `AuditConstants` | `Domain` | Định nghĩa hằng số danh tính kiểm toán cố định `"NV-KD-001 \| Nguyễn Văn An"`, trạng thái `"Draft"`, tiền tệ `"VND"` và giới hạn dung lượng tệp `20 MB` (`20,971,520 bytes`). |
| `IContractService` / `ContractService` | `Application` / `Infrastructure` | Kiểm tra hợp lệ dữ liệu hợp đồng (`BR-02`, `BR-03`, `BR-06`), sinh mã `HD-YYYY-NNN` kèm cơ chế thử lại tối đa 3 lần khi gặp lỗi `Unique Constraint` (`SqlState 23505` trên `ux_contracts_contract_code`), lưu hợp đồng `Draft` và truy vấn chi tiết hợp đồng kèm tệp đính kèm. |
| `ICustomerService` / `CustomerService` | `Application` / `Infrastructure` | Truy vấn danh sách khách hàng (`activeOnly = true` mặc định chỉ lấy `Status == "Active"`), sắp xếp tăng dần theo `CustomerCode`. |
| `IContractAttachmentService` / `ContractAttachmentService` | `Application` / `Infrastructure` | Kiểm tra sự tồn tại của hợp đồng, xác thực toàn bộ lô tệp đính kèm (`.pdf`, `.docx`, `.xlsx`, dung lượng `<= 20 MB/tệp`), lưu tệp vật lý với tên duy nhất `{uuid}_{fileName}` và ghi nhận metadata vào bảng `contract_attachments`. |
| `ContractsController`, `CustomersController` | `Api` | Tiếp nhận HTTP Request, điều phối xuống tầng Application Service và trả về HTTP Status Code chuẩn (`200 OK`, `201 Created` kèm header `Location`). |
| `GlobalExceptionHandler` | `Api` | Bắt `RequestValidationException`, `DomainException` và các lỗi hệ thống để chuẩn hóa phản hồi theo RFC 7807 (`application/problem+json`) kèm `traceId` và `errorCode`. |

---

## 4. Sơ đồ Tuần tự (UML Sequence Diagrams — `PB-01`)

### 4.1. `SD-01`: Lấy danh sách Khách hàng đang hoạt động (`GET /api/customers?activeOnly=true`)

```mermaid
sequenceDiagram
    autonumber
    actor User as Nhân viên Kinh doanh
    participant FE as Frontend (React Form)
    participant Ctrl as CustomersController
    participant Svc as CustomerService
    participant DB as PostgreSQL (ApplicationDbContext)

    User->>FE: Mở màn hình "Tạo hợp đồng mới"
    FE->>Ctrl: GET /api/customers?activeOnly=true
    Ctrl->>Svc: GetCustomersAsync(activeOnly: true, ct)
    Svc->>DB: SELECT * FROM customers WHERE status = 'Active' ORDER BY customer_code ASC
    DB-->>Svc: Danh sách bản ghi Customer (KH-ABC-001, KH-ABC-002)
    Svc-->>Ctrl: IReadOnlyList<CustomerResponse>
    Ctrl-->>FE: 200 OK (application/json)
    FE-->>User: Hiển thị danh sách khách hàng trong ô chọn Customer Select
```

---

### 4.2. `SD-02`: Tạo mới Hợp đồng `Draft` và Chống đụng độ Mã hợp đồng (`POST /api/contracts`)

Sơ đồ dưới đây mô tả chi tiết luồng kiểm tra nghiệp vụ, tự động gán `CreatedBy = "NV-KD-001 | Nguyễn Văn An"`, sinh mã `HD-YYYY-NNN` và cơ chế **Retry tối đa 3 lần** khi nhiều request đồng thời đụng độ khóa duy nhất `ux_contracts_contract_code` (`PostgresException 23505`).

```mermaid
sequenceDiagram
    autonumber
    actor User as Nhân viên Kinh doanh
    participant FE as Frontend (React Form)
    participant Ctrl as ContractsController
    participant Svc as ContractService
    participant Err as GlobalExceptionHandler
    participant DB as PostgreSQL (ApplicationDbContext)

    User->>FE: Nhập thông tin hợp đồng & nhấn "Lưu nháp (Save Draft)"
    FE->>Ctrl: POST /api/contracts (CreateContractRequest JSON)
    Ctrl->>Svc: CreateDraftAsync(request, ct)

    Svc->>Svc: ValidateRequest(request) (Trim chuỗi, kiểm tra độ dài, EffectiveFrom <= EffectiveTo, ContractValue > 0)
    alt Dữ liệu đầu vào không hợp lệ
        Svc-->>Err: throw RequestValidationException(errors)
        Err-->>FE: 400 Bad Request (ValidationProblemDetails - application/problem+json)
    else Dữ liệu đầu vào hợp lệ
        Svc->>DB: SELECT * FROM customers WHERE id = @customerId
        alt Khách hàng không tồn tại
            Svc-->>Err: throw DomainException("CUSTOMER_NOT_FOUND", ...)
            Err-->>FE: 404 Not Found (errorCode: CUSTOMER_NOT_FOUND)
        else Khách hàng có Status != 'Active' (Inactive)
            Svc-->>Err: throw DomainException("CUSTOMER_INACTIVE", ...)
            Err-->>FE: 422 Unprocessable Entity (errorCode: CUSTOMER_INACTIVE)
        else Khách hàng hợp lệ (Active)
            loop Thử tối đa 3 lần (attempt = 1..3) khi gặp Unique Constraint 23505
                Svc->>DB: Truy vấn mã contract_code lớn nhất trong năm hiện tại (HD-YYYY-%)
                DB-->>Svc: Số thứ tự lớn nhất hiện tại (maxSeq)
                Svc->>Svc: Sinh mã mới HD-{Year}-{maxSeq + 1:D3}<br/>Gán Status = "Draft"<br/>Gán CreatedBy = "NV-KD-001 | Nguyễn Văn An"
                Svc->>DB: INSERT INTO contracts (...)
                alt Lưu thành công (Không đụng độ mã)
                    DB-->>Svc: Bản ghi Contract đã lưu
                    Svc-->>Ctrl: ContractDetailResponse
                    Ctrl-->>FE: 201 Created (Location: /api/contracts/{id})
                else Bị lỗi PostgresException 23505 (ux_contracts_contract_code)
                    DB-->>Svc: throw DbUpdateException (SqlState 23505)
                    Svc->>Svc: Detach entity cũ, tăng attempt để tính lại mã kế tiếp
                end
            end
            opt Sau 3 lần thử lại vẫn xung đột mã hợp đồng
                Svc-->>Err: throw DomainException("CONTRACT_CODE_CONFLICT", ...)
                Err-->>FE: 409 Conflict (errorCode: CONTRACT_CODE_CONFLICT)
            end
        end
    end
```

---

### 4.3. `SD-03`: Quy trình Lưu 2 Bước & Tải tệp đính kèm (`POST /api/contracts/{id}/attachments`)

Sơ đồ mô tả Bước 2 của quy trình lưu 2 bước, bao gồm cả kịch bản thành công toàn phần và kịch bản **Lỗi từng phần (Partial Failure)** khi tệp đính kèm không hợp lệ nhưng hợp đồng `Draft` ở Bước 1 vẫn được bảo toàn trong PostgreSQL.

```mermaid
sequenceDiagram
    autonumber
    actor User as Nhân viên Kinh doanh
    participant FE as Frontend (React Form)
    participant Ctrl as ContractsController
    participant AttSvc as ContractAttachmentService
    participant FS as Local File Storage (uploads/)
    participant Err as GlobalExceptionHandler
    participant DB as PostgreSQL (ApplicationDbContext)

    Note over User,DB: Giả sử Bước 1 (POST /api/contracts) đã thành công và trả về { id, contractCode: "HD-2026-001" }

    FE->>Ctrl: POST /api/contracts/{id}/attachments (multipart/form-data: files)
    Ctrl->>AttSvc: UploadAttachmentsAsync(id, files, ct)

    AttSvc->>DB: Kiểm tra hợp đồng tồn tại (SELECT id FROM contracts WHERE id = @id)
    alt Hợp đồng không tồn tại
        AttSvc-->>Err: throw DomainException("CONTRACT_NOT_FOUND", ...)
        Err-->>FE: 404 Not Found (errorCode: CONTRACT_NOT_FOUND)
    else Hợp đồng tồn tại
        AttSvc->>AttSvc: Kiểm tra toàn bộ lô tệp (Batch Validation):<br/>1. Danh sách không rỗng<br/>2. Định dạng thuộc {.pdf, .docx, .xlsx}<br/>3. Dung lượng 0 < fileSize <= 20 MB
        alt Có ít nhất 1 tệp vi phạm quy định (Partial Failure tại Bước 2)
            AttSvc-->>Err: throw DomainException("INVALID_ATTACHMENT", chi tiết tệp lỗi)
            Err-->>FE: 400 Bad Request (errorCode: INVALID_ATTACHMENT, errors.files)
            FE-->>User: Giữ nguyên mã hợp đồng HD-2026-001 đã lưu ở Bước 1,<br/>hiển thị cảnh báo lỗi tệp và nút "Thử tải lại tệp"
            User->>FE: Chọn lại tệp hợp lệ & nhấn "Thử tải lại tệp"
            FE->>Ctrl: Gửi lại POST /api/contracts/{id}/attachments (không tạo lại hợp đồng)
        else Toàn bộ tệp hợp lệ
            loop Với mỗi tệp trong danh sách files
                AttSvc->>FS: Lưu tệp vật lý vào uploads/contracts/{id}/{uuid}_{sanitizedFileName}
                AttSvc->>AttSvc: Khởi tạo ContractAttachment (UploadedBy = "NV-KD-001 | Nguyễn Văn An")
            end
            AttSvc->>DB: INSERT INTO contract_attachments (...)
            DB-->>AttSvc: Lưu metadata thành công
            AttSvc-->>Ctrl: UploadContractAttachmentsResponse (201 Created)
            Ctrl-->>FE: 201 Created (contractId, uploadedCount, attachments)
            FE-->>User: Hiển thị thông báo hoàn tất lưu hợp đồng Draft & đính kèm tệp
        end
    end
```

---

### 4.4. `SD-04`: Xem chi tiết Hợp đồng kèm danh sách Tệp đính kèm (`GET /api/contracts/{id}`)

```mermaid
sequenceDiagram
    autonumber
    actor User as Nhân viên Kinh doanh
    participant FE as Frontend (React Client)
    participant Ctrl as ContractsController
    participant Svc as ContractService
    participant Err as GlobalExceptionHandler
    participant DB as PostgreSQL (ApplicationDbContext)

    User->>FE: Xem thông tin hợp đồng vừa tạo
    FE->>Ctrl: GET /api/contracts/{id}
    Ctrl->>Svc: GetByIdAsync(id, ct)
    Svc->>DB: SELECT contracts.*, customers.*, contract_attachments.*<br/>FROM contracts JOIN customers LEFT JOIN contract_attachments<br/>WHERE contracts.id = @id
    alt Không tìm thấy hợp đồng
        Svc-->>Err: throw DomainException("CONTRACT_NOT_FOUND", ...)
        Err-->>FE: 404 Not Found (errorCode: CONTRACT_NOT_FOUND)
    else Tìm thấy hợp đồng
        DB-->>Svc: Entity Contract + Customer + Attachments
        Svc-->>Ctrl: ContractDetailResponse
        Ctrl-->>FE: 200 OK (ContractDetailResponse JSON)
        FE-->>User: Hiển thị chi tiết hợp đồng Draft và danh sách tệp đính kèm
    end
```
