/**
 * Custom Hooks for Reports (Báo cáo)
 */

import { useQuery } from '@tanstack/react-query';
import reportService from '@services/api/report.service';
import { ReportDateRangeParams } from '@base/models/entities/report';

// Query keys factory
export const reportKeys = {
  all: ['reports'] as const,
  chiPhiCoBan: () => [...reportKeys.all, 'chi-phi-co-ban'] as const,
  giaVe: () => [...reportKeys.all, 'gia-ve'] as const,
  doanhThuXe: (params: ReportDateRangeParams) =>
    [...reportKeys.all, 'doanh-thu-xe', params] as const,
  doanhThuTuyen: (params: ReportDateRangeParams) =>
    [...reportKeys.all, 'doanh-thu-tuyen', params] as const,
  luongTaiXe: (params: ReportDateRangeParams) =>
    [...reportKeys.all, 'luong-tai-xe', params] as const,
};

/**
 * Hook lấy chi phí cơ bản
 */
export function useChiPhiCoBan() {
  return useQuery({
    queryKey: reportKeys.chiPhiCoBan(),
    queryFn: () => reportService.getChiPhiCoBan(),
    select: (response) => (response.success ? response.data : []),
  });
}

/**
 * Hook lấy giá vé xe bus ngồi
 */
export function useGiaVeXeBusNgoi() {
  return useQuery({
    queryKey: reportKeys.giaVe(),
    queryFn: () => reportService.getGiaVeXeBusNgoi(),
    select: (response) => (response.success ? response.data : []),
  });
}

/**
 * Hook lấy doanh thu xe bus ngồi theo tháng
 */
export function useDoanhThuXeBusNgoi(params: ReportDateRangeParams, enabled: boolean = true) {
  return useQuery({
    queryKey: reportKeys.doanhThuXe(params),
    queryFn: () => reportService.getDoanhThuXeBusNgoi(params),
    enabled: enabled && !!params.tuNgay && !!params.denNgay,
    select: (response) => (response.success ? response.data : []),
  });
}

/**
 * Hook lấy doanh thu tuyến đường theo tháng
 */
export function useDoanhThuTuyenDuong(params: ReportDateRangeParams, enabled: boolean = true) {
  return useQuery({
    queryKey: reportKeys.doanhThuTuyen(params),
    queryFn: () => reportService.getDoanhThuTuyenDuong(params),
    enabled: enabled && !!params.tuNgay && !!params.denNgay,
    select: (response) => (response.success ? response.data : []),
  });
}

/**
 * Hook lấy lương tháng tài xế
 */
export function useLuongThangTaiXe(params: ReportDateRangeParams, enabled: boolean = true) {
  return useQuery({
    queryKey: reportKeys.luongTaiXe(params),
    queryFn: () => reportService.getLuongThangTaiXe(params),
    enabled: enabled && !!params.tuNgay && !!params.denNgay,
    select: (response) => (response.success ? response.data : []),
  });
}
