export type ContractStatus =
  | 'Draft'
  | 'InReview'
  | 'UnderReview'
  | 'Approved'
  | 'Active'
  | 'NeedsRevision'
  | 'Rejected'
  | 'ESign'
  | 'Issued';

/** Khách hàng trả về từ GET /api/customers */
export interface Customer {
  id: string;
  customerCode: string;
  companyName: string;
  taxCode: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: 'Active' | 'Inactive' | string;
}

/** Tệp đính kèm đã lưu ở Backend */
export interface ContractAttachment {
  id: string;
  contractId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

/**
 * Body của POST /api/contracts.
 * Không có createdBy/status: Backend tự gán người tạo demo và trạng thái Draft.
 */
export interface CreateContractDraftRequest {
  contractName: string;
  customerId: string;
  effectiveFrom: string; // yyyy-MM-dd
  effectiveTo: string; // yyyy-MM-dd
  contractValue: string; // Decimal chính xác; service gửi dưới dạng JSON number.
  currency: 'VND';
  paymentTerms: string;
  serviceTerms: string;
}

/** Response của POST /api/contracts và GET /api/contracts/{id} */
export interface ContractDraftResponse {
  id: string;
  contractCode: string;
  contractName: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  effectiveFrom: string;
  effectiveTo: string;
  contractValue: number;
  currency: string;
  paymentTerms: string;
  serviceTerms: string;
  status: ContractStatus;
  createdBy: string;
  createdAt: string;
  updatedAt?: string | null;
  attachments: ContractAttachment[];
}

/** Response của POST /api/contracts/{id}/attachments */
export interface UploadContractAttachmentsResponse {
  contractId: string;
  uploadedCount: number;
  attachments: ContractAttachment[];
}

export interface ProblemDetailsError {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  errorCode?: string;
  errors?: Record<string, string[]>;
}
