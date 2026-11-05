import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  RotateCw,
  UploadCloud,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ATTACHMENT_ACCEPT, formatFileSize } from '@/lib/contractSchema';
import type { ContractAttachment } from '@/types/contract';

export type AttachmentUploadStatus =
  | 'pending'
  | 'uploading'
  | 'uploaded'
  | 'failed';

export interface AttachmentItem {
  localId: string;
  file: File;
  status: AttachmentUploadStatus;
  progress: number;
  error?: string;
  uploaded?: ContractAttachment;
}

interface AttachmentDropzoneProps {
  items: AttachmentItem[];
  rejectedMessages: string[];
  /** Không cho thêm tệp mới (đang lưu hoặc đã hoàn tất) */
  disabled?: boolean;
  /** Đang có request tải tệp — khóa nút thử lại / xóa */
  busy?: boolean;
  onAddFiles: (files: File[]) => void;
  onRemove: (localId: string) => void;
  onRetry: (localId: string) => void;
}

export const AttachmentDropzone: React.FC<AttachmentDropzoneProps> = ({
  items,
  rejectedMessages,
  disabled = false,
  busy = false,
  onAddFiles,
  onRemove,
  onRetry,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || disabled) return;
    onAddFiles(Array.from(fileList));
  };

  const uploadedCount = items.filter((x) => x.status === 'uploaded').length;
  const failedCount = items.filter((x) => x.status === 'failed').length;
  const hasUploadAttempt = uploadedCount > 0 || failedCount > 0;

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Kéo thả hoặc chọn tệp đính kèm"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition-colors',
          disabled
            ? 'cursor-not-allowed border-[#E2E8F0] bg-slate-50 text-slate-400'
            : isDragOver
              ? 'cursor-pointer border-[#1D4ED8] bg-blue-100/60 text-[#1D4ED8]'
              : 'cursor-pointer border-[#1D4ED8]/60 bg-blue-50/50 text-[#1D4ED8] hover:bg-blue-50'
        )}
      >
        <UploadCloud className="h-6 w-6" />
        <p className="text-sm font-semibold">
          Kéo thả tệp vào đây hoặc bấm để chọn tệp
        </p>
        <p className="text-xs text-slate-500">
          PDF, DOCX, XLSX • Tối đa 20 MB/tệp
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ATTACHMENT_ACCEPT}
          className="hidden"
          data-testid="attachment-input"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        Cho phép lưu Bản nháp khi chưa có tệp. Bắt buộc đính kèm ít nhất 1 tệp
        trước khi trình duyệt.
      </p>

      {rejectedMessages.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-[#DC2626]/30 bg-red-50 p-3 text-xs text-[#DC2626]">
          {rejectedMessages.map((message) => (
            <li key={message} className="flex items-start gap-1.5">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{message}</span>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <AttachmentRow
              key={item.localId}
              item={item}
              busy={busy}
              allowRemove={!disabled || item.status === 'failed'}
              onRemove={() => onRemove(item.localId)}
              onRetry={() => onRetry(item.localId)}
            />
          ))}
        </ul>
      )}

      {hasUploadAttempt && failedCount > 0 && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
          <AlertCircle className="h-4 w-4" />
          {uploadedCount}/{items.length} tệp đã tải lên • {failedCount} tệp
          thất bại
        </p>
      )}
    </div>
  );
};

interface AttachmentRowProps {
  item: AttachmentItem;
  busy: boolean;
  allowRemove: boolean;
  onRemove: () => void;
  onRetry: () => void;
}

const AttachmentRow: React.FC<AttachmentRowProps> = ({
  item,
  busy,
  allowRemove,
  onRemove,
  onRetry,
}) => {
  const { file, status } = item;

  if (status === 'failed') {
    return (
      <li className="rounded-xl border border-[#DC2626] bg-red-50/70 p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#DC2626]">
              {file.name}
            </p>
            <p className="mt-0.5 text-xs text-[#DC2626]">
              {item.error ?? 'Tải tệp lên máy chủ thất bại.'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={onRetry} disabled={busy}>
            <RotateCw className="h-3.5 w-3.5" />
            Thử tải lại tệp
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onRemove}
            disabled={busy}
          >
            Xóa tệp
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li
      className={cn(
        'flex items-start gap-2.5 rounded-xl border p-3',
        status === 'uploaded'
          ? 'border-[#E2E8F0] bg-slate-50'
          : 'border-[#E2E8F0] bg-white'
      )}
    >
      {status === 'uploaded' ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
      ) : status === 'uploading' ? (
        <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-[#1D4ED8]" />
      ) : (
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#1D4ED8]" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {file.name}{' '}
          <span className="font-normal text-slate-500">
            ({formatFileSize(file.size)})
          </span>
        </p>
        {status === 'uploaded' && (
          <p className="mt-0.5 text-xs text-[#16A34A]">Đã tải lên thành công</p>
        )}
        {status === 'pending' && (
          <p className="mt-0.5 text-xs text-slate-500">Sẵn sàng tải lên</p>
        )}
        {status === 'uploading' && (
          <div className="mt-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#1D4ED8] transition-all"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Đang tải lên… {item.progress}%
            </p>
          </div>
        )}
      </div>
      {status === 'pending' && allowRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          aria-label={`Xóa tệp ${file.name}`}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </li>
  );
};
