using AbcBusinessManagement.Domain.Entities;

namespace AbcBusinessManagement.Infrastructure.Persistence;

internal static class CustomerSeedData
{
    private static readonly DateTime SeedDate = new(2026, 10, 24, 0, 0, 0, DateTimeKind.Utc);

    public static readonly Customer[] Customers =
    [
        new()
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111101"),
            CustomerCode = "KH-ABC-001",
            CompanyName = "Công ty Cổ phần Chuỗi Cung Ứng Á Châu",
            TaxCode = "0312345678",
            ContactPerson = "Trần Minh Tuấn",
            ContactEmail = "tuan.tran@achau-scm.vn",
            ContactPhone = "0903123456",
            Address = "Số 12 Đại lộ Độc Lập, KCN Sóng Thần 1, TP. Dĩ An, Bình Dương",
            Status = "Active",
            CreatedAt = SeedDate
        },
        new()
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111102"),
            CustomerCode = "KH-ABC-002",
            CompanyName = "Công ty TNHH Thương mại & Xuất nhập khẩu Thái Bình Dương",
            TaxCode = "0109876543",
            ContactPerson = "Lê Thu Hà",
            ContactEmail = "ha.le@pacific-imex.vn",
            ContactPhone = "0918234567",
            Address = "Tầng 8, Tòa nhà Hải An, Quận Hải An, TP. Hải Phòng",
            Status = "Active",
            CreatedAt = SeedDate
        },
        new()
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111104"),
            CustomerCode = "KH-ABC-004",
            CompanyName = "Công ty TNHH Vận tải Minh Phát",
            TaxCode = "0312345689",
            ContactPerson = "Lê Minh Phát",
            ContactEmail = "contact@minhphat.example",
            ContactPhone = "0903123457",
            Address = "Quận Bình Thạnh, TP. Hồ Chí Minh",
            Status = "Inactive",
            CreatedAt = SeedDate
        }
    ];
}
