import axios, { AxiosError } from 'axios';
import type { ProblemDetailsError } from '@/types/contract';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Bóc tách lỗi chuẩn RFC 7807 ProblemDetails trả về từ ASP.NET Core Web API
 */
export function extractProblemDetails(error: unknown): ProblemDetailsError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<Partial<ProblemDetailsError>>;
    const responseData = axiosError.response?.data;

    if (responseData && typeof responseData === 'object') {
      return {
        type: responseData.type,
        title:
          responseData.title ||
          'Đã xảy ra lỗi trong quá trình xử lý yêu cầu.',
        status: responseData.status || axiosError.response?.status || 500,
        detail:
          responseData.detail ||
          'Vui lòng kiểm tra lại dữ liệu nhập hoặc thử lại sau.',
        instance: responseData.instance,
        traceId: responseData.traceId,
        errorCode: responseData.errorCode,
        errors: responseData.errors,
      };
    }

    if (axiosError.code === 'ERR_NETWORK') {
      return {
        title: 'Không thể kết nối máy chủ',
        status: 503,
        detail:
          'Không thể kết nối đến hệ thống Backend API. Vui lòng kiểm tra lại dịch vụ máy chủ.',
      };
    }

    return {
      title: axiosError.message || 'Lỗi giao tiếp hệ thống',
      status: axiosError.response?.status || 500,
      detail: 'Yêu cầu không thể hoàn tất. Vui lòng thử lại.',
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Lỗi ứng dụng',
      status: 500,
      detail: error.message,
    };
  }

  return {
    title: 'Lỗi không xác định',
    status: 500,
    detail: 'Đã xảy ra sự cố ngoài dự kiến.',
  };
}

/**
 * Gộp danh sách lỗi validation từ ProblemDetails thành thông báo chi tiết theo trường
 */
export function flattenProblemErrors(problem: ProblemDetailsError): string[] {
  if (!problem.errors) {
    return problem.detail ? [problem.detail] : [problem.title];
  }

  const messages: string[] = [];
  for (const [, fieldErrors] of Object.entries(problem.errors)) {
    if (Array.isArray(fieldErrors)) {
      messages.push(...fieldErrors);
    }
  }

  return messages.length > 0 ? messages : [problem.detail || problem.title];
}
