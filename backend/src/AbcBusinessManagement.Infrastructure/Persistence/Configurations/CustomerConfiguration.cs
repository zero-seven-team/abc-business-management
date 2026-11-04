using AbcBusinessManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AbcBusinessManagement.Infrastructure.Persistence.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers", table =>
            table.HasCheckConstraint("ck_customers_status", "status IN ('Active', 'Inactive')"));
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CustomerCode).HasColumnName("customer_code").HasMaxLength(50).IsRequired();
        builder.Property(x => x.CompanyName).HasColumnName("company_name").HasMaxLength(255).IsRequired();
        builder.Property(x => x.TaxCode).HasColumnName("tax_code").HasMaxLength(50).IsRequired();
        builder.Property(x => x.ContactPerson).HasColumnName("contact_person").HasMaxLength(150).IsRequired();
        builder.Property(x => x.ContactEmail).HasColumnName("contact_email").HasMaxLength(150).IsRequired();
        builder.Property(x => x.ContactPhone).HasColumnName("contact_phone").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Address).HasColumnName("address").HasMaxLength(500).IsRequired();
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(30).HasDefaultValue("Active").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");
        builder.HasIndex(x => x.CustomerCode).IsUnique().HasDatabaseName("ux_customers_customer_code");
        builder.HasData(CustomerSeedData.Customers);
    }
}
