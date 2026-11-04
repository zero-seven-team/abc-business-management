using AbcBusinessManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AbcBusinessManagement.Infrastructure.Persistence.Configurations;

public class ContractAttachmentConfiguration : IEntityTypeConfiguration<ContractAttachment>
{
    public void Configure(EntityTypeBuilder<ContractAttachment> builder)
    {
        builder.ToTable("contract_attachments", table =>
        {
            table.HasCheckConstraint("ck_contract_attachments_size", "file_size > 0 AND file_size <= 20971520");
            table.HasCheckConstraint("ck_contract_attachments_extension", @"file_name ~* '\.(pdf|docx|xlsx)$'");
        });
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.ContractId).HasColumnName("contract_id");
        builder.Property(x => x.FileName).HasColumnName("file_name").HasMaxLength(255).IsRequired();
        builder.Property(x => x.StoredFileName).HasColumnName("stored_file_name").HasMaxLength(255).IsRequired();
        builder.Property(x => x.FilePath).HasColumnName("file_path").HasMaxLength(500).IsRequired();
        builder.Property(x => x.ContentType).HasColumnName("content_type").HasMaxLength(150).IsRequired();
        builder.Property(x => x.FileSize).HasColumnName("file_size");
        builder.Property(x => x.UploadedBy).HasColumnName("uploaded_by").HasMaxLength(100).IsRequired();
        builder.Property(x => x.UploadedAt).HasColumnName("uploaded_at").HasColumnType("timestamp with time zone");
        builder.HasIndex(x => x.StoredFileName).IsUnique().HasDatabaseName("ux_contract_attachments_stored_file_name");
        builder.HasOne(x => x.Contract).WithMany(x => x.Attachments).HasForeignKey(x => x.ContractId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
