import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FilePlus2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const CreateContractPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
              Tạo hợp đồng mới
            </h1>
            <Badge variant="Draft">Bản nháp • Draft</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Nhập thông tin thương mại và điều khoản dịch vụ để lưu hợp đồng ở
            trạng thái nháp trước khi gửi thẩm định.
          </p>
        </div>

        <Button variant="secondary" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại trang chủ</span>
        </Button>
      </div>

      {/* Form Container Ready for TASK-12 */}
      <Card>
        <CardHeader className="border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#1D4ED8]">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Thông tin khởi tạo hợp đồng (PB-01)</CardTitle>
              <CardDescription>
                Khung biểu mẫu khởi tạo hợp đồng Draft và đính kèm tài liệu
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              Biểu mẫu nhập liệu chi tiết và tích hợp API tạo hợp đồng Draft sẽ
              được lắp đặt tại TASK-12.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
