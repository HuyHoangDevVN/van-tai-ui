/**
 * Custom Hooks for Driver (Tài xế)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import driverService from '@services/api/driver.service';
import { DriverSearchParams, CreateDriverDto, UpdateDriverDto } from '@base/models/entities/driver';

// Query keys factory
export const driverKeys = {
  all: ['drivers'] as const,
  lists: () => [...driverKeys.all, 'list'] as const,
  list: (params: DriverSearchParams) => [...driverKeys.lists(), params] as const,
  details: () => [...driverKeys.all, 'detail'] as const,
  detail: (id: string) => [...driverKeys.details(), id] as const,
};

/**
 * Hook tìm kiếm tài xế với phân trang
 */
export function useDrivers(params: DriverSearchParams = {}) {
  return useQuery({
    queryKey: driverKeys.list(params),
    queryFn: () => driverService.search(params),
    select: (response) => {
      if (response.success) {
        return {
          items: response.data.items,
          pagination: {
            pageIndex: response.data.pageIndex,
            pageSize: response.data.pageSize,
            totalRecords: response.data.totalRecords,
            totalPages: response.data.totalPages,
            hasNextPage: response.data.hasNextPage,
            hasPreviousPage: response.data.hasPreviousPage,
          },
        };
      }
      return { items: [], pagination: null };
    },
  });
}

/**
 * Hook lấy chi tiết tài xế
 */
export function useDriver(maTaiXe: string | undefined) {
  return useQuery({
    queryKey: driverKeys.detail(maTaiXe || ''),
    queryFn: () => driverService.getById(maTaiXe!),
    enabled: !!maTaiXe,
    select: (response) => (response.success ? response.data : null),
  });
}

/**
 * Hook tạo tài xế mới
 */
export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDriverDto) => driverService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        message.success('Thêm tài xế thành công');
        queryClient.invalidateQueries({ queryKey: driverKeys.lists() });
      } else {
        message.error(response.message || 'Không thể thêm tài xế');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}

/**
 * Hook cập nhật tài xế
 */
export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ maTaiXe, data }: { maTaiXe: string; data: UpdateDriverDto }) =>
      driverService.update(maTaiXe, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        message.success('Cập nhật tài xế thành công');
        queryClient.invalidateQueries({ queryKey: driverKeys.lists() });
        queryClient.invalidateQueries({ queryKey: driverKeys.detail(variables.maTaiXe) });
      } else {
        message.error(response.message || 'Không thể cập nhật tài xế');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}

/**
 * Hook xóa tài xế
 */
export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (maTaiXe: string) => driverService.remove(maTaiXe),
    onSuccess: (response) => {
      if (response.success) {
        message.success('Xóa tài xế thành công');
        queryClient.invalidateQueries({ queryKey: driverKeys.lists() });
      } else {
        message.error(response.message || 'Không thể xóa tài xế');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}
