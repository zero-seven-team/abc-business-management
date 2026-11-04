using AbcBusinessManagement.Application.DTOs.Contracts;

namespace AbcBusinessManagement.Application.Interfaces;

public interface IContractService
{
    Task<ContractDetailResponse> CreateDraftAsync(CreateContractRequest request, CancellationToken cancellationToken = default);
    Task<ContractDetailResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
