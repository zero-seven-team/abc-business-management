namespace AbcBusinessManagement.Domain.Constants;

public static class AuditConstants
{
    public const string DefaultActor = "NV-KD-001 | Nguyễn Văn An";
    public const string DefaultCurrency = "VND";
    public const string DraftStatus = "Draft";
    public const string ActiveCustomerStatus = "Active";
    public const int MaxContractCodeRetries = 3;
    public const long MaxAttachmentSizeBytes = 20L * 1024L * 1024L;
}
