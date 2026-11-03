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

export interface Customer {
  id: string;
  customerCode: string;
  companyName: string;
  taxCode: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: 'Active' | 'Inactive';
}

export interface ContractAttachment {
  id: string;
  contractId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CreateContractDraftRequest {
  title: string;
  customerId: string;
  effectiveFrom: string;
  effectiveTo: string;
  contractValue: number;
  paymentTerms: string;
  serviceTerms: string;
}

export interface ContractDraftResponse {
  id: string;
  contractCode: string;
  title: string;
  customerId: string;
  customerName?: string;
  effectiveFrom: string;
  effectiveTo: string;
  contractValue: number;
  paymentTerms: string;
  serviceTerms: string;
  status: ContractStatus;
  createdBy: string;
  createdAt: string;
  attachments?: ContractAttachment[];
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
