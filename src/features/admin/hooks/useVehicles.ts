/**
 * Custom Hooks for Vehicle (Xe)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import vehicleService from '@services/api/vehicle.service';
import {
  VehicleSearchParams,
  CreateVehicleDto,
  UpdateVehicleDto,
} from '@base/models/entities/vehicle';

// Query keys factory
export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (params: VehicleSearchParams) => [...vehicleKeys.lists(), params] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
};

/**
 * Hook tìm kiếm xe với phân trang
 */
export function useVehicles(params: VehicleSearchParams = {}) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => vehicleService.search(params),
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
 * Hook lấy chi tiết xe
 */
export function useVehicle(maXe: string | undefined) {
  return useQuery({
    queryKey: vehicleKeys.detail(maXe || ''),
    queryFn: () => vehicleService.getById(maXe!),
    enabled: !!maXe,
    select: (response) => (response.success ? response.data : null),
  });
}

/**
 * Hook tạo xe mới
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleDto) => vehicleService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        message.success('Thêm xe thành công');
        queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      } else {
        message.error(response.message || 'Không thể thêm xe');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}

/**
 * Hook cập nhật xe
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ maXe, data }: { maXe: string; data: UpdateVehicleDto }) =>
      vehicleService.update(maXe, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        message.success('Cập nhật xe thành công');
        queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
        queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(variables.maXe) });
      } else {
        message.error(response.message || 'Không thể cập nhật xe');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}

/**
 * Hook xóa xe
 */
export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (maXe: string) => vehicleService.remove(maXe),
    onSuccess: (response) => {
      if (response.success) {
        message.success('Xóa xe thành công');
        queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      } else {
        message.error(response.message || 'Không thể xóa xe');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}
