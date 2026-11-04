using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AbcBusinessManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialContractSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "customers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    customer_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    company_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    tax_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    contact_person = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    contact_email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    contact_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Active"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customers", x => x.id);
                    table.CheckConstraint("ck_customers_status", "status IN ('Active', 'Inactive')");
                });

            migrationBuilder.CreateTable(
                name: "contracts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    contract_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    contract_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    effective_from = table.Column<DateOnly>(type: "date", nullable: false),
                    effective_to = table.Column<DateOnly>(type: "date", nullable: false),
                    contract_value = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "VND"),
                    payment_terms = table.Column<string>(type: "text", nullable: false),
                    service_terms = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Draft"),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_contracts", x => x.id);
                    table.CheckConstraint("ck_contracts_code", "contract_code ~ '^HD-[0-9]{4}-[0-9]{3,}$'");
                    table.CheckConstraint("ck_contracts_currency", "currency = 'VND'");
                    table.CheckConstraint("ck_contracts_dates", "effective_from <= effective_to");
                    table.CheckConstraint("ck_contracts_name", "char_length(btrim(contract_name)) BETWEEN 5 AND 255");
                    table.CheckConstraint("ck_contracts_payment_terms", "char_length(btrim(payment_terms)) BETWEEN 10 AND 4000");
                    table.CheckConstraint("ck_contracts_service_terms", "char_length(btrim(service_terms)) BETWEEN 10 AND 4000");
                    table.CheckConstraint("ck_contracts_value", "contract_value > 0");
                    table.ForeignKey(
                        name: "FK_contracts_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "contract_attachments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    contract_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    stored_file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    content_type = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    uploaded_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_contract_attachments", x => x.id);
                    table.CheckConstraint("ck_contract_attachments_extension", "file_name ~* '\\.(pdf|docx|xlsx)$'");
                    table.CheckConstraint("ck_contract_attachments_size", "file_size > 0 AND file_size <= 20971520");
                    table.ForeignKey(
                        name: "FK_contract_attachments_contracts_contract_id",
                        column: x => x.contract_id,
                        principalTable: "contracts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "customers",
                columns: new[] { "id", "address", "company_name", "contact_email", "contact_person", "contact_phone", "created_at", "customer_code", "status", "tax_code", "updated_at" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111101"), "Số 12 Đại lộ Độc Lập, KCN Sóng Thần 1, TP. Dĩ An, Bình Dương", "Công ty Cổ phần Chuỗi Cung Ứng Á Châu", "tuan.tran@achau-scm.vn", "Trần Minh Tuấn", "0903123456", new DateTime(2026, 10, 24, 0, 0, 0, 0, DateTimeKind.Utc), "KH-ABC-001", "Active", "0312345678", null },
                    { new Guid("11111111-1111-1111-1111-111111111102"), "Tầng 8, Tòa nhà Hải An, Quận Hải An, TP. Hải Phòng", "Công ty TNHH Thương mại & Xuất nhập khẩu Thái Bình Dương", "ha.le@pacific-imex.vn", "Lê Thu Hà", "0918234567", new DateTime(2026, 10, 24, 0, 0, 0, 0, DateTimeKind.Utc), "KH-ABC-002", "Active", "0109876543", null },
                    { new Guid("11111111-1111-1111-1111-111111111104"), "Quận Bình Thạnh, TP. Hồ Chí Minh", "Công ty TNHH Vận tải Minh Phát", "contact@minhphat.example", "Lê Minh Phát", "0903123457", new DateTime(2026, 10, 24, 0, 0, 0, 0, DateTimeKind.Utc), "KH-ABC-004", "Inactive", "0312345689", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_contract_attachments_contract_id",
                table: "contract_attachments",
                column: "contract_id");

            migrationBuilder.CreateIndex(
                name: "ux_contract_attachments_stored_file_name",
                table: "contract_attachments",
                column: "stored_file_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_contracts_customer_id",
                table: "contracts",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "ux_contracts_contract_code",
                table: "contracts",
                column: "contract_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_customers_customer_code",
                table: "customers",
                column: "customer_code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "contract_attachments");

            migrationBuilder.DropTable(
                name: "contracts");

            migrationBuilder.DropTable(
                name: "customers");
        }
    }
}
