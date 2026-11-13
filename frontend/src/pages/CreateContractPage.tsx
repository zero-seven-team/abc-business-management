import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
  AlertTriangle,
  Building2,
  Info,
  Loader2,
  Plus,
  RotateCw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AttachmentDropzone,
  type AttachmentItem,
} from '@/components/contracts/AttachmentDropzone';
import {
  CONTRACT_FORM_FIELDS,
  CREATE_CONTRACT_DEFAULT_VALUES,
  createContractSchema,
  parseContractValue,
  validateAttachmentFile,
  type CreateContractFormValues,
} from '@/lib/contractSchema';
import {
  createContractDraft,
  getActiveCustomers,
  uploadContractAttachment,
} from '@/services/contractService';
import { extractProblemDetails } from '@/services/apiClient';
import type {
  ContractDraftResponse,
  Customer,
  ProblemDetailsError,
} from '@/types/contract';

/**
 * editing   : đang nhập liệu (màn 03/04)
 * saving    : đang gọi Bước 1 POST /api/contracts
 * uploading : đang gọi Bước 2 tải tệp cho hợp đồng vừa tạo
 * partial   : hợp đồng đã lưu nhưng còn tệp lỗi/chưa tải (màn 06)
 * completed : lưu Draft và tải tệp thành công (màn 05)
 */
type PagePhase = 'editing' | 'saving' | 'uploading' | 'partial' | 'completed';

interface FormErrorBanner {
  title: string;
  messages: string[];
}

const FORM_ID = 'create-contract-form';
const DRAFT_STORAGE_KEY = 'abc_draft_contract_form';

function loadSavedFormDraft(): CreateContractFormValues {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return CREATE_CONTRACT_DEFAULT_VALUES;
    const parsed = JSON.parse(raw) as Partial<CreateContractFormValues>;
    return {
      contractName:
        typeof parsed.contractName === 'string' ? parsed.contractName : '',
      customerId:
        typeof parsed.customerId === 'string' ? parsed.customerId : '',
      effectiveFrom:
        typeof parsed.effectiveFrom === 'string' ? parsed.effectiveFrom : '',
      effectiveTo:
        typeof parsed.effectiveTo === 'string' ? parsed.effectiveTo : '',
      contractValue:
        typeof parsed.contractValue === 'string' ? parsed.contractValue : '',
      paymentTerms:
        typeof parsed.paymentTerms === 'string' ? parsed.paymentTerms : '',
      serviceTerms:
        typeof parsed.serviceTerms === 'string' ? parsed.serviceTerms : '',
    };
  } catch {
    return CREATE_CONTRACT_DEFAULT_VALUES;
  }
}

function hasNonEmptyFormValues(
  values: Partial<CreateContractFormValues>
): boolean {
  return Object.values(values).some(
    (value) => typeof value === 'string' && value.trim().length > 0
  );
}

let localIdSeed = 0;
const nextLocalId = () => `att-${Date.now()}-${++localIdSeed}`;

function normalizeErrorKey(key: string): string {
  const cleaned = key.replace(/^\$\./, '').split('.').pop() ?? key;
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

function describeUploadError(problem: ProblemDetailsError): string {
  if (problem.status === 503) {
    return 'Lỗi kết nối khi tải tệp lên máy chủ.';
  }
  return problem.errors?.files?.[0] ?? problem.detail ?? problem.title;
}

export const CreateContractPage: React.FC = () => {
  const navigate = useNavigate();

  // ---- Danh sách khách hàng Active ----
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [customersReloadKey, setCustomersReloadKey] = useState(0);

  // ---- Trạng thái lưu 2 bước ----
  const [phase, setPhase] = useState<PagePhase>('editing');
  const [createdContract, setCreatedContract] =
    useState<ContractDraftResponse | null>(null);
  const [formError, setFormError] = useState<FormErrorBanner | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ---- Tệp đính kèm: ref là nguồn dữ liệu đồng bộ, state để render ----
  const itemsRef = useRef<AttachmentItem[]>([]);
  const [items, setItems] = useState<AttachmentItem[]>([]);
  const [rejectedMessages, setRejectedMessages] = useState<string[]>([]);

  const commitItems = useCallback((next: AttachmentItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const updateItem = useCallback(
    (localId: string, patch: Partial<AttachmentItem>) => {
      commitItems(
        itemsRef.current.map((item) =>
          item.localId === localId ? { ...item, ...patch } : item
        )
      );
    },
    [commitItems]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateContractFormValues>({
    resolver: zodResolver(createContractSchema),
    defaultValues: loadSavedFormDraft(),
    mode: 'onTouched',
  });

  const watchedValues = watch();
  const selectedCustomerId = watchedValues.customerId;
  const effectiveFrom = watchedValues.effectiveFrom;
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const hasUnsavedData =
    !createdContract &&
    (hasNonEmptyFormValues(watchedValues) || items.length > 0);

  // ---- Tự động lưu nháp tạm vào sessionStorage khi nhập liệu ----
  useEffect(() => {
    const subscription = watch((values) => {
      if (createdContract) return;
      try {
        if (hasNonEmptyFormValues(values)) {
          sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
        } else {
          sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } catch {
        // Bỏ qua khi trình duyệt chặn sessionStorage
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, createdContract]);

  // ---- Cảnh báo khi đóng/tải lại tab trình duyệt nếu đang nhập dở ----
  useEffect(() => {
    if (!hasUnsavedData) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedData]);

  useEffect(() => {
    const controller = new AbortController();
    setCustomersLoading(true);
    setCustomersError(null);

    getActiveCustomers(controller.signal)
      .then((data) => setCustomers(data))
      .catch((error: unknown) => {
        if (axios.isCancel(error)) return;
        const problem = extractProblemDetails(error);
        setCustomersError(problem.detail ?? problem.title);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCustomersLoading(false);
      });

    return () => controller.abort();
  }, [customersReloadKey]);

  const isFormLocked = createdContract !== null || phase === 'saving';
  const isBusy = phase === 'saving' || phase === 'uploading';

  const finalizeUploadPhase = useCallback(() => {
    const hasUnfinished = itemsRef.current.some(
      (item) => item.status === 'failed' || item.status === 'pending'
    );
    setPhase(hasUnfinished ? 'partial' : 'completed');
  }, []);

  /** Bước 2: tải lần lượt từng tệp để biết chính xác tệp nào lỗi */
  const uploadQueue = useCallback(
    async (contractId: string, localIds: string[]) => {
      if (localIds.length === 0) {
        finalizeUploadPhase();
        return;
      }

      setPhase('uploading');
      for (const localId of localIds) {
        const item = itemsRef.current.find((x) => x.localId === localId);
        if (!item) continue;

        updateItem(localId, { status: 'uploading', progress: 0, error: undefined });
        try {
          const result = await uploadContractAttachment(
            contractId,
            item.file,
            (percent) => updateItem(localId, { progress: percent })
          );
          updateItem(localId, {
            status: 'uploaded',
            progress: 100,
            uploaded: result.attachments[0],
          });
        } catch (error) {
          updateItem(localId, {
            status: 'failed',
            progress: 0,
            error: describeUploadError(extractProblemDetails(error)),
          });
        }
      }
      finalizeUploadPhase();
    },
    [finalizeUploadPhase, updateItem]
  );

  const applyServerErrors = (problem: ProblemDetailsError) => {
    const unmapped: string[] = [];
    let mappedCount = 0;

    if (problem.errors) {
      for (const [key, messages] of Object.entries(problem.errors)) {
        const field = normalizeErrorKey(key) as keyof CreateContractFormValues;
        if (CONTRACT_FORM_FIELDS.includes(field) && messages.length > 0) {
          setError(field, { type: 'server', message: messages[0] });
          mappedCount++;
        } else {
          unmapped.push(...messages);
        }
      }
    }

    if (problem.errorCode === 'CUSTOMER_NOT_FOUND') {
      setError('customerId', {
        type: 'server',
        message: problem.detail ?? problem.title,
      });
      mappedCount++;
      setCustomersReloadKey((key) => key + 1);
    }

    if (unmapped.length === 0 && mappedCount === 0) {
      unmapped.push(problem.detail ?? problem.title);
    }

    setFormError({
      title: problem.title,
      messages:
        unmapped.length > 0
          ? unmapped
          : [`Vui lòng kiểm tra lại ${mappedCount} trường được đánh dấu đỏ.`],
    });
  };

  /** Bước 1: tạo hợp đồng Draft, sau đó chuyển sang Bước 2 nếu có tệp */
  const onSubmit = async (values: CreateContractFormValues) => {
    setFormError(null);
    setPhase('saving');

    let contract: ContractDraftResponse;
    try {
      contract = await createContractDraft({
        contractName: values.contractName.trim(),
        customerId: values.customerId,
        effectiveFrom: values.effectiveFrom,
        effectiveTo: values.effectiveTo,
        contractValue: parseContractValue(values.contractValue),
        currency: 'VND',
        paymentTerms: values.paymentTerms.trim(),
        serviceTerms: values.serviceTerms.trim(),
      });
    } catch (error) {
      applyServerErrors(extractProblemDetails(error));
      setPhase('editing');
      return;
    }

    setCreatedContract(contract);
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Bỏ qua lỗi sessionStorage
    }
    const queued = itemsRef.current
      .filter((item) => item.status === 'pending' || item.status === 'failed')
      .map((item) => item.localId);
    await uploadQueue(contract.id, queued);
  };

  const onInvalid = (fieldErrors: FieldErrors<CreateContractFormValues>) => {
    const count = Object.keys(fieldErrors).length;
    setFormError({
      title: 'Thông tin hợp đồng chưa hợp lệ',
      messages: [
        `Vui lòng kiểm tra lại ${count} trường được đánh dấu đỏ trước khi lưu bản nháp.`,
      ],
    });
  };

  const handleAddFiles = (files: File[]) => {
    const rejected: string[] = [];
    const accepted: AttachmentItem[] = [];

    for (const file of files) {
      const error = validateAttachmentFile(file);
      if (error) {
        rejected.push(error);
        continue;
      }
      const duplicated = [...itemsRef.current, ...accepted].some(
        (item) =>
          item.file.name === file.name &&
          item.file.size === file.size &&
          item.file.lastModified === file.lastModified
      );
      if (duplicated) {
        rejected.push(`Tệp "${file.name}" đã có trong danh sách.`);
        continue;
      }
      accepted.push({
        localId: nextLocalId(),
        file,
        status: 'pending',
        progress: 0,
      });
    }

    setRejectedMessages(rejected);
    if (accepted.length > 0) {
      commitItems([...itemsRef.current, ...accepted]);
    }
  };

  const handleRemoveFile = (localId: string) => {
    commitItems(itemsRef.current.filter((item) => item.localId !== localId));
    if (createdContract && phase === 'partial') {
      finalizeUploadPhase();
    }
  };

  const handleRetryFile = (localId: string) => {
    if (!createdContract) return;
    void uploadQueue(createdContract.id, [localId]);
  };

  const handleRetryAll = () => {
    if (!createdContract) return;
    const queued = itemsRef.current
      .filter((item) => item.status === 'failed' || item.status === 'pending')
      .map((item) => item.localId);
    void uploadQueue(createdContract.id, queued);
  };

  const handleCreateAnother = () => {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Bỏ qua lỗi sessionStorage
    }
    reset(CREATE_CONTRACT_DEFAULT_VALUES);
    commitItems([]);
    setRejectedMessages([]);
    setCreatedContract(null);
    setFormError(null);
    setPhase('editing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelClick = () => {
    if (hasUnsavedData) {
      setShowCancelModal(true);
      return;
    }
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Bỏ qua lỗi sessionStorage
    }
    navigate('/');
  };

  const handleConfirmDiscard = () => {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Bỏ qua lỗi sessionStorage
    }
    setShowCancelModal(false);
    navigate('/');
  };

  const uploadedCount = items.filter((x) => x.status === 'uploaded').length;
  const failedCount = items.filter((x) => x.status === 'failed').length;
  const pendingCount = items.filter((x) => x.status === 'pending').length;

  return (
    <form
      id={FORM_ID}
      noValidate
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-4"
    >
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tạo hợp đồng mới
          </h1>
          <Badge variant="Draft">Bản nháp</Badge>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          Khởi tạo hồ sơ hợp đồng ở trạng thái Bản nháp trước khi trình duyệt.
        </p>
      </div>

      {/* Banner trạng thái */}
      {formError && phase === 'editing' && (
        <Alert variant="danger" title={formError.title} data-testid="form-error">
          <ul className="list-disc space-y-0.5 pl-4">
            {formError.messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </Alert>
      )}

      {createdContract && phase === 'partial' && (
        <Alert variant="warning" data-testid="partial-failure-banner">
          Hợp đồng nháp <strong>{createdContract.contractCode}</strong> đã được
          lưu an toàn vào cơ sở dữ liệu
          {failedCount > 0
            ? `, nhưng có ${failedCount} tệp đính kèm tải lên thất bại`
            : `, còn ${pendingCount} tệp chưa tải lên`}
          . Bạn có thể tải lại tệp mà không cần nhập lại thông tin hợp đồng.
        </Alert>
      )}

      {createdContract && phase === 'completed' && (
        <Alert
          variant="success"
          title={`Đã lưu hợp đồng nháp ${createdContract.contractCode} thành công`}
          data-testid="save-success-banner"
        >
          {uploadedCount > 0
            ? `Hợp đồng ở trạng thái Bản nháp và đã liên kết ${uploadedCount} tệp đính kèm.`
            : 'Hợp đồng ở trạng thái Bản nháp, chưa có tệp đính kèm. Cần bổ sung ít nhất 1 tệp trước khi gửi duyệt.'}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_376px] items-start">
        {/* Cột trái: thông tin & điều khoản */}
        <fieldset disabled={isFormLocked} className="min-w-0 space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-1.5 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Thông tin hợp đồng</CardTitle>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 whitespace-nowrap">
                {createdContract
                  ? `Mã HĐ: ${createdContract.contractCode} • Người tạo: Nguyễn Văn An (NV-KD-001)`
                  : 'Mã HĐ: Tự động cấp khi lưu • Người tạo: Nguyễn Văn An (NV-KD-001)'}
              </span>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div>
                <Label htmlFor="contractName" requiredMarker>
                  Tên hợp đồng
                </Label>
                <Input
                  id="contractName"
                  placeholder="VD: Dịch vụ xếp dỡ và lưu kho container năm 2026"
                  hasError={!!errors.contractName}
                  aria-invalid={!!errors.contractName}
                  {...register('contractName')}
                />
                <FieldError message={errors.contractName?.message} />
              </div>

              <div>
                <Label htmlFor="customerId" requiredMarker>
                  Khách hàng
                </Label>
                <Select
                  id="customerId"
                  hasError={!!errors.customerId}
                  aria-invalid={!!errors.customerId}
                  disabled={customersLoading || isFormLocked}
                  {...register('customerId')}
                >
                  <option value="">
                    {customersLoading
                      ? 'Đang tải danh sách khách hàng…'
                      : '-- Chọn khách hàng đang hoạt động --'}
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customerCode} • {customer.companyName} (MST:{' '}
                      {customer.taxCode})
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.customerId?.message} />
                {customersError && (
                  <p className="mt-1.5 flex items-center gap-2 text-xs text-[#DC2626]">
                    Không tải được danh sách khách hàng: {customersError}
                    <button
                      type="button"
                      className="font-semibold underline"
                      onClick={() => setCustomersReloadKey((key) => key + 1)}
                    >
                      Thử lại
                    </button>
                  </p>
                )}
                {selectedCustomer && (
                  <CustomerSummary customer={selectedCustomer} />
                )}
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
                <div>
                  <Label htmlFor="effectiveFrom" requiredMarker>
                    Hiệu lực từ
                  </Label>
                  <Input
                    id="effectiveFrom"
                    type="date"
                    hasError={!!errors.effectiveFrom}
                    aria-invalid={!!errors.effectiveFrom}
                    {...register('effectiveFrom', { deps: ['effectiveTo'] })}
                  />
                  <FieldError message={errors.effectiveFrom?.message} />
                </div>
                <div>
                  <Label htmlFor="effectiveTo" requiredMarker>
                    Hiệu lực đến
                  </Label>
                  <Input
                    id="effectiveTo"
                    type="date"
                    min={effectiveFrom || undefined}
                    hasError={!!errors.effectiveTo}
                    aria-invalid={!!errors.effectiveTo}
                    {...register('effectiveTo')}
                  />
                  <FieldError message={errors.effectiveTo?.message} />
                </div>
                <div>
                  <Label htmlFor="contractValue" requiredMarker>
                    Giá trị hợp đồng (VND)
                  </Label>
                  <Controller
                    control={control}
                    name="contractValue"
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          id="contractValue"
                          inputMode="decimal"
                          placeholder="VD: 125000000"
                          className="pr-10"
                          hasError={!!errors.contractValue}
                          aria-invalid={!!errors.contractValue}
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                          ₫
                        </span>
                      </div>
                    )}
                  />
                  <FieldError message={errors.contractValue?.message} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Điều khoản hợp đồng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div>
                <Label htmlFor="paymentTerms" requiredMarker>
                  Điều khoản thanh toán
                </Label>
                <Textarea
                  id="paymentTerms"
                  rows={3}
                  className="min-h-[72px]"
                  placeholder="VD: Thanh toán bằng chuyển khoản trong vòng 30 ngày kể từ ngày nhận đầy đủ hóa đơn và chứng từ hợp lệ."
                  hasError={!!errors.paymentTerms}
                  aria-invalid={!!errors.paymentTerms}
                  {...register('paymentTerms')}
                />
                <FieldError message={errors.paymentTerms?.message} />
              </div>
              <div>
                <Label htmlFor="serviceTerms" requiredMarker>
                  Điều khoản dịch vụ
                </Label>
                <Textarea
                  id="serviceTerms"
                  rows={3}
                  className="min-h-[72px]"
                  placeholder="VD: Cung cấp dịch vụ xếp dỡ, nâng hạ container và lưu kho theo bảng giá đã thỏa thuận."
                  hasError={!!errors.serviceTerms}
                  aria-invalid={!!errors.serviceTerms}
                  {...register('serviceTerms')}
                />
                <FieldError message={errors.serviceTerms?.message} />
              </div>
            </CardContent>
          </Card>
        </fieldset>

        {/* Cột phải: tệp đính kèm */}
        <div className="min-w-0 lg:sticky lg:top-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tệp đính kèm</CardTitle>
              <CardDescription>Tùy chọn khi lưu nháp</CardDescription>
            </CardHeader>
            <CardContent>
              <AttachmentDropzone
                items={items}
                rejectedMessages={rejectedMessages}
                disabled={isBusy || phase === 'completed'}
                busy={isBusy}
                onAddFiles={handleAddFiles}
                onRemove={handleRemoveFile}
                onRetry={handleRetryFile}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Thanh hành động cố định cuối trang */}
      <div className="sticky bottom-0 z-10 -mx-6 -mb-4 flex flex-col gap-3 border-t border-[#E2E8F0] bg-white px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          {createdContract ? (
            <>
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
              {createdContract.contractCode} • Bản nháp được lưu an toàn • Chưa
              gửi duyệt
            </>
          ) : (
            <>
              <Info className="h-4 w-4" />
              Các trường có dấu * là bắt buộc. Lưu nháp chưa gửi hồ sơ đến người
              duyệt.
            </>
          )}
        </p>

        <div className="flex gap-3">
          {!createdContract && (
            <>
              <Button
                variant="secondary"
                onClick={handleCancelClick}
                disabled={isBusy}
              >
                Hủy
              </Button>
              <Button type="submit" form={FORM_ID} disabled={isBusy}>
                {phase === 'saving' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {phase === 'saving' ? 'Đang lưu…' : 'Lưu bản nháp'}
              </Button>
            </>
          )}

          {createdContract && (
            <>
              <Button
                variant="secondary"
                onClick={() => navigate('/contracts')}
                disabled={isBusy}
              >
                Danh sách hợp đồng
              </Button>
              {phase === 'uploading' && (
                <Button disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải tệp…
                </Button>
              )}
              {phase === 'partial' && (
                <Button onClick={handleRetryAll}>
                  <RotateCw className="h-4 w-4" />
                  {failedCount > 0 ? 'Thử tải lại tệp' : 'Tải tệp lên'}
                </Button>
              )}
              {phase === 'completed' && (
                <Button onClick={handleCreateAnother}>
                  <Plus className="h-4 w-4" />
                  Tạo hợp đồng mới
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal xác nhận hủy khi có dữ liệu nhập dở */}
      {showCancelModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-draft-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
        >
          <div className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[#D97706]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="cancel-draft-dialog-title"
                  className="text-base font-bold text-slate-900"
                >
                  Xác nhận hủy nội dung đang nhập
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  Bạn có thông tin hợp đồng chưa lưu. Bạn có chắc chắn muốn hủy
                  bỏ nội dung đang nhập không?
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Tiếp tục soạn thảo
              </Button>
              <Button
                type="button"
                className="bg-[#DC2626] text-white hover:bg-red-700"
                onClick={handleConfirmDiscard}
              >
                Hủy bỏ nội dung
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

// ---------------------------------------------------------------------------
// Thành phần phụ
// ---------------------------------------------------------------------------

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <p role="alert" className="mt-1.5 text-xs font-medium text-[#DC2626]">
      {message}
    </p>
  ) : null;

const CustomerSummary: React.FC<{ customer: Customer }> = ({ customer }) => (
  <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
    <div className="mb-2 flex items-center gap-2">
      <Building2 className="h-4 w-4 text-[#1D4ED8]" />
      <span className="text-sm font-semibold text-slate-800">
        {customer.companyName}
      </span>
      <Badge variant="Active">Đang hoạt động</Badge>
    </div>
    <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
      <SummaryItem label="Mã khách hàng" value={customer.customerCode} />
      <SummaryItem label="Mã số thuế" value={customer.taxCode} />
      <SummaryItem label="Người liên hệ" value={customer.contactPerson} />
      <SummaryItem label="Số điện thoại" value={customer.contactPhone} />
      <div className="sm:col-span-2">
        <SummaryItem label="Địa chỉ" value={customer.address} />
      </div>
    </dl>
  </div>
);

const SummaryItem: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => (
  <div className="flex gap-1.5">
    <dt className="shrink-0 text-slate-500">{label}:</dt>
    <dd className="font-medium text-slate-800">{value || '—'}</dd>
  </div>
);
