/**
 * Custom Hooks for Maintenance (Bảo trì)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import maintenanceService from '@services/api/maintenance.service';
import { CreateMaintenanceDto } from '@base/models/entities/maintenance';
import { vehicleKeys } from './useVehicles';

// Query keys factory
export const maintenanceKeys = {
  all: ['maintenance'] as const,
  status: () => [...maintenanceKeys.all, 'status'] as const,
  history: (maXe: string) => [...maintenanceKeys.all, 'history', maXe] as const,
};

/**
 * Hook lấy trạng thái bảo trì của tất cả xe
 */
export function useMaintenanceStatus() {
  return useQuery({
    queryKey: maintenanceKeys.status(),
    queryFn: () => maintenanceService.getStatus(),
    select: (response) => (response.success ? response.data : []),
  });
}

/**
 * Hook lấy lịch sử bảo trì của xe
 */
export function useMaintenanceHistory(maXe: string | undefined) {
  return useQuery({
    queryKey: maintenanceKeys.history(maXe || ''),
    queryFn: () => maintenanceService.getHistory(maXe!),
    enabled: !!maXe,
    select: (response) => (response.success ? response.data : []),
  });
}

/**
 * Hook tạo bản ghi bảo trì mới
 */
export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaintenanceDto) => maintenanceService.create(data),
    onSuccess: (response, variables) => {
      if (response.success) {
        message.success('Thêm bảo trì thành công');
        // Invalidate maintenance queries
        queryClient.invalidateQueries({ queryKey: maintenanceKeys.status() });
        queryClient.invalidateQueries({ queryKey: maintenanceKeys.history(variables.maXe) });
        // Also invalidate vehicle queries since km gets reset
        queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      } else {
        message.error(response.message || 'Không thể thêm bảo trì');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}
