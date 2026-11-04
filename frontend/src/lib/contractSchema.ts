import { z } from 'zod';

/** Giới hạn đồng bộ với Backend (ContractService / ContractAttachmentService) */
export const CONTRACT_NAME_MIN = 5;
export const CONTRACT_NAME_MAX = 255;
export const TERMS_MIN = 10;
export const TERMS_MAX = 4000;
export const CONTRACT_VALUE_MAX = '999999999999999.99';
export const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_EXTENSIONS = ['.pdf', '.docx', '.xlsx'] as const;
export const ATTACHMENT_ACCEPT =
  '.pdf,.docx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Danh tính demo cố định phía Backend — chỉ hiển thị, không gửi lên server */
export const DEMO_CREATED_BY = 'NV-KD-001 | Nguyễn Văn An';

/** Không dùng dấu phân nhóm; chấp nhận dấu chấm hoặc phẩy cho phần thập phân. */
export function parseContractValue(raw: string): string {
  const value = raw.trim();
  if (!/^-?\d+(?:[.,]\d{1,2})?$/.test(value)) {
    throw new Error('Nhập số tiền không có dấu phân nhóm, tối đa 2 chữ số thập phân.');
  }
  const [whole, fraction = ''] = value.replace(',', '.').split('.');
  const cents = BigInt(whole) * 100n +
    BigInt(fraction.padEnd(2, '0')) * (value.startsWith('-') ? -1n : 1n);
  if (cents <= 0n) throw new Error('Giá trị hợp đồng phải lớn hơn 0.');
  if (cents > BigInt(CONTRACT_VALUE_MAX.replace('.', ''))) {
    throw new Error('Giá trị hợp đồng vượt quá giới hạn cho phép.');
  }
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, '0')}`;
}

/** Giữ chính xác decimal khi gửi JSON, kể cả giá trị vượt độ chính xác của Number. */
export function serializeContractDraft(payload: { contractValue: string }): string {
  const { contractValue, ...fields } = payload;
  const amount = parseContractValue(contractValue);
  const json = JSON.stringify(fields);
  return `${json.slice(0, -1)}${json.length > 2 ? ',' : ''}"contractValue":${amount}}`;
}

export const createContractSchema = z
  .object({
    contractName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên hợp đồng.')
      .min(
        CONTRACT_NAME_MIN,
        `Tên hợp đồng phải có ít nhất ${CONTRACT_NAME_MIN} ký tự.`
      )
      .max(
        CONTRACT_NAME_MAX,
        `Tên hợp đồng không được vượt quá ${CONTRACT_NAME_MAX} ký tự.`
      ),
    customerId: z
      .string()
      .min(1, 'Vui lòng chọn khách hàng cho hợp đồng.')
      .uuid('Khách hàng đã chọn không hợp lệ.'),
    effectiveFrom: z.string().min(1, 'Vui lòng chọn ngày bắt đầu hiệu lực.'),
    effectiveTo: z.string().min(1, 'Vui lòng chọn ngày kết thúc hiệu lực.'),
    contractValue: z
      .string()
      .superRefine((raw, ctx) => {
        try {
          parseContractValue(raw);
        } catch (error) {
          ctx.addIssue({ code: z.ZodIssueCode.custom,
            message: raw.trim() === '' ? 'Vui lòng nhập giá trị hợp đồng.' :
              (error as Error).message });
        }
      }),
    paymentTerms: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập điều khoản thanh toán.')
      .min(TERMS_MIN, `Điều khoản thanh toán phải có ít nhất ${TERMS_MIN} ký tự.`)
      .max(TERMS_MAX, `Điều khoản thanh toán tối đa ${TERMS_MAX} ký tự.`),
    serviceTerms: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập điều khoản dịch vụ.')
      .min(TERMS_MIN, `Điều khoản dịch vụ phải có ít nhất ${TERMS_MIN} ký tự.`)
      .max(TERMS_MAX, `Điều khoản dịch vụ tối đa ${TERMS_MAX} ký tự.`),
  })
  .superRefine((values, ctx) => {
    // Chuỗi yyyy-MM-dd so sánh theo thứ tự từ điển tương đương so sánh ngày
    if (
      values.effectiveFrom &&
      values.effectiveTo &&
      values.effectiveTo < values.effectiveFrom
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['effectiveTo'],
        message:
          'Ngày kết thúc hiệu lực phải lớn hơn hoặc bằng ngày bắt đầu hiệu lực.',
      });
    }
  });

export type CreateContractFormValues = z.input<typeof createContractSchema>;

export const CREATE_CONTRACT_DEFAULT_VALUES: CreateContractFormValues = {
  contractName: '',
  customerId: '',
  effectiveFrom: '',
  effectiveTo: '',
  contractValue: '',
  paymentTerms: '',
  serviceTerms: '',
};

export const CONTRACT_FORM_FIELDS = Object.keys(
  CREATE_CONTRACT_DEFAULT_VALUES
) as (keyof CreateContractFormValues)[];

/** Kiểm tra tệp phía Client trước khi đưa vào danh sách chờ tải lên */
export function validateAttachmentFile(file: File): string | null {
  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_ATTACHMENT_EXTENSIONS.some((ext) =>
    lowerName.endsWith(ext)
  );

  if (!hasAllowedExtension) {
    return `Tệp "${file.name}" không đúng định dạng. Chỉ hỗ trợ PDF, DOCX, XLSX.`;
  }
  if (file.size <= 0) {
    return `Tệp "${file.name}" rỗng (0 byte).`;
  }
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return `Tệp "${file.name}" có dung lượng ${formatFileSize(file.size)}, vượt quá giới hạn 20 MB/tệp.`;
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
