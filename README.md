# ABC Business Management

> **Hệ thống Quản lý Hoạt động Kinh doanh & Hợp đồng Thương mại - Công ty ABC Logistics**  
> Dự án phát triển ứng dụng hệ thống thông tin hiện đại phục vụ số hóa quy trình kinh doanh, khởi tạo và phê duyệt hợp đồng, bảng giá, sản lượng và ký số điện tử.

---

## 1. Tổng quan Dự án & Sprint 01

- **Product Backlog Sprint 01**: `PB-01` - Khởi tạo và lưu hồ sơ hợp đồng ở trạng thái Bản nháp (`Draft`).
- **Mục tiêu**: Nhân viên Kinh doanh tạo hợp đồng mới với thông tin thương mại, điều khoản dịch vụ và tệp đính kèm (`PDF`, `DOCX`, `XLSX`). Hợp đồng được lưu an toàn vào cơ sở dữ liệu với mã định danh tự động (`HD-YYYY-NNN`).
- **Thành viên Nhóm Phát triển**:
  1. **Trần Ngọc Long** (`LONGTRAN2700`) - UI/UX Design, Thiết lập Repository/Projects, Phát triển Frontend React.
  2. **Nguyễn Khả Như** (`KN12345N`) - Phân tích Nghiệp vụ (BA), Đặc tả Use Case, Quản trị Tiến độ, Tài liệu dự án.
  3. **Lê Quang Linh** (`linh285`) - Thiết kế Kiến trúc Backend, Cơ sở dữ liệu PostgreSQL, Migrations & Seed data, Xử lý lỗi ProblemDetails.
  4. **Thạch Ý** (`ThachY-23120411`) - Thiết kế Sơ đồ Lớp & Tuần tự (Class/Sequence), Xây dựng Web API Khách hàng, Hợp đồng & Tải tệp.
  5. **Đặng Hữu Phú** (`PhuHuuDang`) - Thiết kế Kịch bản Kiểm thử, Tự động hóa Unit/Integration Test, Cấu hình CI GitHub Actions & E2E Test.

---

## 2. Công nghệ Sử dụng (Tech Stack)

### Backend
- **Nền tảng**: .NET 10 (C# 13), ASP.NET Core Web API theo kiến trúc phân lớp Clean Architecture (`Api`, `Application`, `Domain`, `Infrastructure`).
- **ORM & Cơ sở dữ liệu**: Entity Framework Core 10, PostgreSQL 16+ (Npgsql).
- **Tiêu chuẩn API**: Chuẩn báo lỗi RFC 7807 (`ProblemDetails`), Request Logging JSON có `traceId`, CORS hỗ trợ Frontend Vite.
- **Tài liệu API**: Swagger UI / OpenAPI 3.0.

### Frontend
- **Nền tảng**: React 18, TypeScript, Vite.
- **Giao diện & UI Components**: Tailwind CSS, shadcn/ui components (`Button`, `Card`, `Badge`, `Alert`, `Input`, `Select`, `Textarea`), bộ icon `lucide-react`.
- **Xử lý Biểu mẫu & Kiểm tra Dữ liệu**: React Hook Form kết hợp Zod schema validation.
- **Giao tiếp API**: Axios với interceptor bóc tách `ProblemDetails` từ máy chủ.

### Kiểm thử & Tự động hóa (Testing & CI)
- **Kiểm thử Đơn vị (Unit Test)**: xUnit cho toàn bộ quy tắc nghiệp vụ `BR-01` đến `BR-05`.
- **Kiểm thử Tích hợp (Integration Test)**: `Microsoft.AspNetCore.Mvc.Testing` kết hợp PostgreSQL thật kiểm tra tính toàn vẹn dữ liệu, chống trùng mã đồng thời và upload tệp 2 bước.
- **CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`) tự động build, kiểm tra kiểu dữ liệu và chạy toàn bộ test suite khi có Pull Request.

---

## 3. Cấu trúc Thư mục

```text
.
├── backend/                                # Mã nguồn Backend .NET 10 Web API
│   ├── AbcBusinessManagement.sln          # Solution chính của hệ thống
│   └── src/
│       ├── AbcBusinessManagement.Api/            # REST API Controllers, Middleware, ProblemDetails
│       ├── AbcBusinessManagement.Application/    # DTOs, Service Interfaces, Validation Exceptions
│       ├── AbcBusinessManagement.Domain/         # Thực thể Domain (Contract, Customer, Attachment), Enums, Hằng số
│       └── AbcBusinessManagement.Infrastructure/ # ApplicationDbContext, EF Configurations, Migrations, Services
├── frontend/                               # Mã nguồn Giao diện Người dùng React + Vite
│   ├── src/
│   │   ├── components/layout/              # Khung ứng dụng: Header, Sidebar cố định 240px
│   │   ├── components/ui/                  # Thư viện UI chuẩn: Button, Card, Badge, Alert, Input...
│   │   ├── components/contracts/           # Thành phần hợp đồng: Vùng kéo thả tệp Dropzone
│   │   ├── pages/                          # Trang ứng dụng: DashboardPage, CreateContractPage
│   │   ├── services/                       # Tích hợp API: apiClient, contractService
│   │   ├── types/                          # Định nghĩa kiểu TypeScript
│   │   └── lib/                            # Schema Zod, tiện ích định dạng tiền VND/dung lượng
├── tests/                                  # Dự án Kiểm thử Tự động
│   └── backend/
│       ├── AbcBusinessManagement.UnitTests/         # Unit Tests kiểm tra nghiệp vụ
│       ├── AbcBusinessManagement.IntegrationTests/  # Integration Tests chạy trên PostgreSQL thật
│       ├── AbcBusinessManagement.Api.Tests/         # Test xử lý ngoại lệ và ProblemDetails
│       └── AbcBusinessManagement.Infrastructure.Tests/ # Test Schema và Ràng buộc CSDL
├── docs/                                   # Tài liệu dự án
│   ├── requirements/                       # Đề bài gốc và quy trình nghiệp vụ QTKD
│   ├── planning/                           # Kế hoạch Sprint Plan và phân rã công việc
│   ├── specs/                              # Đặc tả yêu cầu chi tiết PB-01 và API Contract
│   ├── design/sprint-01/                   # Tài liệu UI/UX Design Spec và 6 màn hình Figma
│   ├── uml/                                # Sơ đồ Use Case, Class Diagram và Sequence Diagram
│   └── testing/                            # Kịch bản kiểm thử chi tiết test-cases-PB01
└── .github/workflows/ci.yml                # Cấu hình GitHub Actions CI
```

---

## 4. Yêu cầu Môi trường Cài đặt

Trước khi chạy hệ thống, đảm bảo máy tính đã cài đặt các công cụ sau:

- **.NET SDK**: Phiên bản 10.0 trở lên (`dotnet --version`).
- **Node.js**: Phiên bản 20.x hoặc 22.x LTS và npm 10+ (`node -v`, `npm -v`).
- **PostgreSQL**: Phiên bản 16 hoặc 17+ đang hoạt động (`psql --version`).
- **Git**: Đã cài đặt để quản lý mã nguồn (`git --version`).

---

## 5. Hướng dẫn Khởi chạy Hệ thống

### Bước 1: Khởi tạo Cơ sở Dữ liệu PostgreSQL

1. Tạo một database mới cho dự án:
   ```bash
   createdb -U postgres abc_business_management
   ```
2. Cấu hình chuỗi kết nối trong file `backend/src/AbcBusinessManagement.Api/appsettings.Development.json` (mặc định đã cấu hình sẵn):
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=abc_business_management;Username=postgres;Password=postgres"
   }
   ```
3. Cài công cụ EF Core CLI (một lần trên máy mới), cùng phiên bản EF Core của dự án:
   ```bash
   dotnet tool install --global dotnet-ef --version 10.0.14
   dotnet ef --version
   ```
   Nếu đã cài phiên bản khác, dùng `dotnet tool update --global dotnet-ef --version 10.0.14`.
4. Chạy lệnh Migration từ thư mục gốc dự án để tự động tạo bảng và nạp dữ liệu khách hàng mẫu (Seed data):
   ```bash
   cd backend/src/AbcBusinessManagement.Infrastructure
   dotnet ef database update --startup-project ../AbcBusinessManagement.Api -- --environment Development
   ```
   > **Dữ liệu mẫu đã nạp sẵn**:
   > - `KH-ABC-001`: Công ty TNHH Vận tải Nam Việt (MST: `0312345678`) — Trạng thái: `Active`
   > - `KH-ABC-002`: Công ty CP Logistics Toàn Cầu (MST: `0109876543`) — Trạng thái: `Active`
   > - `KH-ABC-004`: Công ty TNHH Dịch vụ Kho vận Biển Đông (MST: `0405678901`) — Trạng thái: `Inactive` (chặn tạo HĐ)

---

### Bước 2: Khởi chạy Backend API

Từ thư mục gốc dự án:
```bash
cd backend/src/AbcBusinessManagement.Api
dotnet run
```
- Máy chủ API sẽ khởi động tại: **`http://localhost:5000`**
- Giao diện tài liệu Swagger UI trực quan: **`http://localhost:5000/swagger`**
- Kiểm tra trạng thái máy chủ: **`http://localhost:5000/api/health`**

---

### Bước 3: Khởi chạy Giao diện Frontend Web

Mở một cửa sổ dòng lệnh (Terminal) mới từ thư mục gốc dự án:
```bash
cd frontend
npm install
npm run dev
```
- Ứng dụng web sẽ chạy tại: **`http://localhost:5173`**
- Mở trình duyệt và truy cập `http://localhost:5173` để trải nghiệm luồng làm việc.

---

## 6. Hướng dẫn Chạy Kiểm thử Tự động (Automated Testing)

Toàn bộ test suite được thiết kế để chạy độc lập hoặc tự động trong luồng CI:

### 1. Chạy Unit Tests (Kiểm thử logic kiểm tra dữ liệu)
```bash
dotnet test tests/backend/AbcBusinessManagement.UnitTests/AbcBusinessManagement.UnitTests.csproj
```

### 2. Chạy Integration Tests (Kiểm thử tích hợp với PostgreSQL)
Cung cấp chuỗi kết nối tới cơ sở dữ liệu PostgreSQL đang chạy qua biến môi trường `TEST_POSTGRES_CONNECTION`:
```bash
# Trên Windows PowerShell:
$env:TEST_POSTGRES_CONNECTION="Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres"
dotnet test tests/backend/AbcBusinessManagement.IntegrationTests/AbcBusinessManagement.IntegrationTests.csproj

# Trên Linux / macOS:
export TEST_POSTGRES_CONNECTION="Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres"
dotnet test tests/backend/AbcBusinessManagement.IntegrationTests/AbcBusinessManagement.IntegrationTests.csproj
```

### 3. Chạy Kiểm tra Build & Type-check Frontend
```bash
cd frontend
npm run build
```

---

## 7. Các Kịch bản Trải nghiệm Chính trên Giao diện (`PB-01`)

1. **Trang chủ (`/`)**:
   - Hiển thị các chỉ số tổng quan hồ sơ.
   - Nhấn nút **`+ Tạo hợp đồng mới`** để chuyển đến biểu mẫu khởi tạo.
2. **Khởi tạo Hợp đồng Draft (`/contracts/new`)**:
   - Chọn một khách hàng đang hoạt động (thẻ thông tin khách hàng sẽ hiển thị chi tiết mã số thuế, địa chỉ, người liên hệ).
   - Nhập tên hợp đồng, thời hạn hiệu lực, giá trị hợp đồng (`VND`), điều khoản thanh toán và điều khoản dịch vụ.
   - Chọn hoặc kéo thả tệp đính kèm (`PDF`, `DOCX`, `XLSX` dung lượng tối đa 20 MB/tệp).
   - Nhấn **`Lưu bản nháp`**:
     + **Bước 1**: Hệ thống tạo bản ghi Draft trong CSDL và tự động cấp mã `HD-YYYY-NNN`.
     + **Bước 2**: Tự động tải các tệp đính kèm lên máy chủ và liên kết vào hợp đồng vừa tạo.
3. **Xử lý Lỗi Tải Tệp (Partial Failure)**:
   - Trong trường hợp lưu thông tin thành công nhưng có tệp tải lên bị gián đoạn, hệ thống giữ nguyên mã hợp đồng đã cấp, khóa các trường thông tin chung và cung cấp nút **`Thử tải lại tệp`** mà không cần nhập lại form.
