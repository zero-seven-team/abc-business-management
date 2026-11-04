import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
  ArrowLeft,
  Building2,
  Info,
  Loader2,
  Lock,
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
import { cn } from '@/lib/utils';
import {
  CONTRACT_FORM_FIELDS,
  CREATE_CONTRACT_DEFAULT_VALUES,
  DEMO_CREATED_BY,
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
    defaultValues: CREATE_CONTRACT_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const selectedCustomerId = watch('customerId');
  const effectiveFrom = watch('effectiveFrom');
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

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
    reset(CREATE_CONTRACT_DEFAULT_VALUES);
    commitItems([]);
    setRejectedMessages([]);
    setCreatedContract(null);
    setFormError(null);
    setPhase('editing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadedCount = items.filter((x) => x.status === 'uploaded').length;
  const failedCount = items.filter((x) => x.status === 'failed').length;
  const pendingCount = items.filter((x) => x.status === 'pending').length;

  return (
    <form
      id={FORM_ID}
      noValidate
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
              Tạo hợp đồng mới
            </h1>
            <Badge variant="Draft">Bản nháp • Draft</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Khởi tạo hồ sơ hợp đồng ở trạng thái Bản nháp (Draft) trước khi
            trình duyệt.
          </p>
        </div>

        <Button variant="secondary" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Button>
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
            ? `Hợp đồng ở trạng thái Draft và đã liên kết ${uploadedCount} tệp đính kèm.`
            : 'Hợp đồng ở trạng thái Draft, chưa có tệp đính kèm. Cần bổ sung ít nhất 1 tệp trước khi gửi duyệt.'}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_376px]">
        {/* Cột trái: thông tin & điều khoản */}
        <fieldset disabled={isFormLocked} className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin hợp đồng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contractCode">Mã hợp đồng</Label>
                <ReadonlyField
                  id="contractCode"
                  value={
                    createdContract?.contractCode ??
                    'Tự động sinh sau khi lưu (VD: HD-2026-xxx)'
                  }
                  highlight={createdContract !== null}
                />
              </div>

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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                          placeholder="VD: 125000000,50"
                          className="pr-8"
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
                  <p className="mt-1 text-xs text-slate-500">
                    Không dùng dấu phân nhóm. Dùng dấu phẩy hoặc chấm cho tối đa 2 chữ số thập phân.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="createdBy">Người tạo hồ sơ</Label>
                <ReadonlyField
                  id="createdBy"
                  value={`${createdContract?.createdBy ?? DEMO_CREATED_BY} (Phòng Kinh doanh) • Danh tính Demo Backend`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Điều khoản hợp đồng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentTerms" requiredMarker>
                  Điều khoản thanh toán
                </Label>
                <Textarea
                  id="paymentTerms"
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

        {/* Cột phải: tệp đính kèm & trạng thái hồ sơ */}
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tệp đính kèm</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trạng thái hồ sơ</CardTitle>
              <div className="pt-2">
                <Badge variant="Draft">Bản nháp (Draft)</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <ProgressStep
                  index={1}
                  done={createdContract !== null}
                  active={phase === 'saving'}
                  title={
                    createdContract
                      ? 'Đã lưu thông tin hợp đồng'
                      : 'Lưu thông tin hợp đồng'
                  }
                  description={
                    createdContract
                      ? `Đã cấp mã ${createdContract.contractCode}.`
                      : 'Hệ thống cấp Mã hợp đồng trước.'
                  }
                />
                <ProgressStep
                  index={2}
                  done={phase === 'completed'}
                  active={phase === 'uploading'}
                  warning={phase === 'partial'}
                  title="Tự động tải tệp đính kèm"
                  description={
                    phase === 'partial'
                      ? failedCount > 0
                        ? `Có ${failedCount} tệp lỗi. Chỉ cần tải lại tệp, không tạo lại hợp đồng.`
                        : `Còn ${pendingCount} tệp chưa tải lên.`
                      : phase === 'completed'
                        ? uploadedCount > 0
                          ? `Đã liên kết ${uploadedCount} tệp vào hợp đồng.`
                          : 'Không có tệp đính kèm.'
                        : 'Liên kết các tệp vào hợp đồng vừa tạo.'
                  }
                />
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Thanh hành động cố định cuối trang */}
      <div className="sticky bottom-0 z-10 -mx-6 -mb-6 flex flex-col gap-3 border-t border-[#E2E8F0] bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
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
                onClick={() => navigate('/')}
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

const ReadonlyField: React.FC<{
  id: string;
  value: string;
  highlight?: boolean;
}> = ({ id, value, highlight = false }) => (
  <div className="relative">
    <input
      id={id}
      readOnly
      tabIndex={-1}
      value={value}
      className={cn(
        'flex h-10 w-full cursor-default rounded-lg border border-[#E2E8F0] bg-slate-100/70 px-3.5 pr-10 text-sm',
        highlight ? 'font-semibold text-slate-900' : 'text-slate-500'
      )}
    />
    <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  </div>
);

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

const ProgressStep: React.FC<{
  index: number;
  title: string;
  description: string;
  done?: boolean;
  active?: boolean;
  warning?: boolean;
}> = ({ index, title, description, done, active, warning }) => (
  <li className="flex gap-3">
    <span
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        done
          ? 'bg-emerald-50 text-[#16A34A]'
          : warning
            ? 'bg-amber-50 text-[#D97706]'
            : 'bg-blue-50 text-[#1D4ED8]'
      )}
    >
      {active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : index}
    </span>
    <div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
    </div>
  </li>
);
