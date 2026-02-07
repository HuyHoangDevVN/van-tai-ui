/**
 * Custom Hooks for Trip (Chuyến xe)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import tripService from '@services/api/trip.service';
import { TripSearchParams, CreateTripDto, UpdateTripDto } from '@base/models/entities/trip';

// Query keys factory
export const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  list: (params: TripSearchParams) => [...tripKeys.lists(), params] as const,
  details: () => [...tripKeys.all, 'detail'] as const,
  detail: (id: string) => [...tripKeys.details(), id] as const,
};

/**
 * Hook tìm kiếm chuyến xe với phân trang
 */
export function useTrips(params: TripSearchParams = {}) {
  return useQuery({
    queryKey: tripKeys.list(params),
    queryFn: () => tripService.search(params),
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
 * Hook lấy chi tiết chuyến xe
 */
export function useTrip(maChuyen: string | undefined) {
  return useQuery({
    queryKey: tripKeys.detail(maChuyen || ''),
    queryFn: () => tripService.getById(maChuyen!),
    enabled: !!maChuyen,
    select: (response) => (response.success ? response.data : null),
  });
}

/**
 * Hook tạo chuyến xe mới
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTripDto) => tripService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        message.success('Thêm chuyến xe thành công');
        queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      } else {
        message.error(response.message || 'Không thể thêm chuyến xe');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}

/**
 * Hook cập nhật chuyến xe
 */
export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ maChuyen, data }: { maChuyen: string; data: UpdateTripDto }) =>
      tripService.update(maChuyen, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        message.success('Cập nhật chuyến xe thành công');
        queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
        queryClient.invalidateQueries({ queryKey: tripKeys.detail(variables.maChuyen) });
      } else {
        message.error(response.message || 'Không thể cập nhật chuyến xe');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}

/**
 * Hook hoàn thành chuyến xe
 */
export function useCompleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (maChuyen: string) => tripService.complete(maChuyen),
    onSuccess: (response) => {
      if (response.success) {
        message.success('Hoàn thành chuyến xe thành công');
        queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      } else {
        message.error(response.message || 'Không thể hoàn thành chuyến xe');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}

/**
 * Hook hủy chuyến xe
 */
export function useCancelTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (maChuyen: string) => tripService.cancel(maChuyen),
    onSuccess: (response) => {
      if (response.success) {
        message.success('Hủy chuyến xe thành công');
        queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      } else {
        message.error(response.message || 'Không thể hủy chuyến xe');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}

/**
 * Hook xóa chuyến xe
 */
export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (maChuyen: string) => tripService.remove(maChuyen),
    onSuccess: (response) => {
      if (response.success) {
        message.success('Xóa chuyến xe thành công');
        queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      } else {
        message.error(response.message || 'Không thể xóa chuyến xe');
      }
    },
    onError: () => {
      message.error('Đã có lỗi xảy ra');
    },
  });
}
