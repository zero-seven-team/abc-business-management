namespace AbcBusinessManagement.Application.Common.Exceptions;

public sealed class RequestValidationException(IDictionary<string, string[]> errors)
    : Exception("Dữ liệu đầu vào không hợp lệ.")
{
    public IDictionary<string, string[]> Errors { get; } = new Dictionary<string, string[]>(errors);
}
