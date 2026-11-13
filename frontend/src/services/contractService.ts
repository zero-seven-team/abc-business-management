import { apiClient } from '@/services/apiClient';
import { serializeContractDraft } from '@/lib/contractSchema';
import type {
  ContractDraftResponse,
  CreateContractDraftRequest,
  Customer,
  UploadContractAttachmentsResponse,
} from '@/types/contract';

/** GET /api/customers?activeOnly=true — danh sách khách hàng đang hoạt động */
export async function getActiveCustomers(
  signal?: AbortSignal
): Promise<Customer[]> {
  const response = await apiClient.get<Customer[]>('/customers', {
    params: { activeOnly: true },
    signal,
  });
  return response.data;
}

/** Bước 1: POST /api/contracts — tạo hợp đồng Draft, nhận id + contractCode */
export async function createContractDraft(
  payload: CreateContractDraftRequest
): Promise<ContractDraftResponse> {
  const response = await apiClient.post<ContractDraftResponse>(
    '/contracts',
    serializeContractDraft(payload)
  );
  saveRecentCreatedContract(response.data);
  return response.data;
}

const RECENT_CREATED_CONTRACTS_KEY = 'abc_recent_created_contracts_v1';

export function saveRecentCreatedContract(contract: ContractDraftResponse): void {
  try {
    const existing = loadRecentCreatedContracts().filter(
      (item) => item.id !== contract.id && item.contractCode !== contract.contractCode
    );
    sessionStorage.setItem(
      RECENT_CREATED_CONTRACTS_KEY,
      JSON.stringify([contract, ...existing])
    );
  } catch {
    // Bỏ qua lỗi sessionStorage
  }
}

export function loadRecentCreatedContracts(): ContractDraftResponse[] {
  try {
    const raw = sessionStorage.getItem(RECENT_CREATED_CONTRACTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ContractDraftResponse[]) : [];
  } catch {
    return [];
  }
}

/**
 * Bước 2: POST /api/contracts/{id}/attachments — tải một tệp cho hợp đồng đã tạo.
 * Mỗi tệp gửi một request riêng để xác định chính xác tệp nào lỗi và chỉ tải lại tệp đó.
 */
export async function uploadContractAttachment(
  contractId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadContractAttachmentsResponse> {
  const formData = new FormData();
  formData.append('files', file, file.name);

  const response = await apiClient.post<UploadContractAttachmentsResponse>(
    `/contracts/${contractId}/attachments`,
    formData,
    {
      // Ghi đè Content-Type JSON mặc định để trình duyệt tự gắn boundary multipart
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    }
  );
  return response.data;
}
