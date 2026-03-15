/**
 * Trips Mock Data
 * Mock data cho quản lý chuyến xe
 */

import type { Trip, TripSearchResult } from '@base/models/entities/trip';

// Trạng thái chuyến xe
export const TRIP_STATUS = [
  { ma: 'Scheduled', ten: 'Đã lên lịch', color: 'blue' },
  { ma: 'InProgress', ten: 'Đang chạy', color: 'orange' },
  { ma: 'Completed', ten: 'Hoàn thành', color: 'green' },
  { ma: 'Cancelled', ten: 'Đã hủy', color: 'red' },
] as const;

// Chi tiết chuyến xe mở rộng
export interface TripDetail extends TripSearchResult {
  maTaiXeLaiXe: string;
  tenTaiXeLaiXe: string;
  maTaiXePhuXe: string;
  tenTaiXePhuXe: string;
  chiPhiVanHanh: number;
  thuLaoLaiXe: number;
  thuLaoPhuXe: number;
  diemDi: string;
  diemDen: string;
  khoangCach: number;
}

// Mock trips data
export const mockTrips: TripDetail[] = [
  {
    maChuyen: 'CH001',
    tenChuyen: 'HN-SG Sáng 06:00',
    thoiGianKhoiHanh: '2025-02-08T06:00:00',
    thoiGianDen: '2025-02-09T06:00:00',
    maXe: 'XE002',
    maTuyen: 'TU001',
    trangThai: 'Scheduled',
    tenXe: 'Xe Giường Nằm HN-SG 01',
    bienSo: '30A-67890',
    tenTuyen: 'Hà Nội - Hồ Chí Minh',
    soVeDaBan: 28,
    tongCho: 32,
    maTaiXeLaiXe: 'TX002',
    tenTaiXeLaiXe: 'Trần Văn Bình',
    maTaiXePhuXe: 'TX006',
    tenTaiXePhuXe: 'Ngô Thị Hương',
    chiPhiVanHanh: 8500000,
    thuLaoLaiXe: 2500000,
    thuLaoPhuXe: 1500000,
    diemDi: 'Hà Nội',
    diemDen: 'Hồ Chí Minh',
    khoangCach: 1700,
  },
  {
    maChuyen: 'CH002',
    tenChuyen: 'HN-DN Sáng 07:00',
    thoiGianKhoiHanh: '2025-02-08T07:00:00',
    thoiGianDen: '2025-02-08T19:00:00',
    maXe: 'XE001',
    maTuyen: 'TU002',
    trangThai: 'InProgress',
    tenXe: 'Xe Limousine Hà Nội 01',
    bienSo: '29A-12345',
    tenTuyen: 'Hà Nội - Đà Nẵng',
    soVeDaBan: 20,
    tongCho: 20,
    maTaiXeLaiXe: 'TX001',
    tenTaiXeLaiXe: 'Nguyễn Văn An',
    maTaiXePhuXe: 'TX005',
    tenTaiXePhuXe: 'Hoàng Văn Em',
    chiPhiVanHanh: 4200000,
    thuLaoLaiXe: 1800000,
    thuLaoPhuXe: 1000000,
    diemDi: 'Hà Nội',
    diemDen: 'Đà Nẵng',
    khoangCach: 764,
  },
  {
    maChuyen: 'CH003',
    tenChuyen: 'HN-SP Tối 20:00',
    thoiGianKhoiHanh: '2025-02-07T20:00:00',
    thoiGianDen: '2025-02-08T04:00:00',
    maXe: 'XE004',
    maTuyen: 'TU003',
    trangThai: 'Completed',
    tenXe: 'Mini Bus VIP 01',
    bienSo: '29C-22222',
    tenTuyen: 'Hà Nội - Sapa',
    soVeDaBan: 14,
    tongCho: 14,
    maTaiXeLaiXe: 'TX004',
    tenTaiXeLaiXe: 'Phạm Văn Đức',
    maTaiXePhuXe: 'TX005',
    tenTaiXePhuXe: 'Hoàng Văn Em',
    chiPhiVanHanh: 2800000,
    thuLaoLaiXe: 1500000,
    thuLaoPhuXe: 900000,
    diemDi: 'Hà Nội',
    diemDen: 'Sapa',
    khoangCach: 320,
  },
  {
    maChuyen: 'CH004',
    tenChuyen: 'HN-HP Sáng 08:00',
    thoiGianKhoiHanh: '2025-02-08T08:00:00',
    thoiGianDen: '2025-02-08T10:30:00',
    maXe: 'XE003',
    maTuyen: 'TU004',
    trangThai: 'Scheduled',
    tenXe: 'Xe Bus Ngồi Hà Nội 02',
    bienSo: '29B-11111',
    tenTuyen: 'Hà Nội - Hải Phòng',
    soVeDaBan: 35,
    tongCho: 43,
    maTaiXeLaiXe: 'TX003',
    tenTaiXeLaiXe: 'Lê Văn Cường',
    maTaiXePhuXe: 'TX006',
    tenTaiXePhuXe: 'Ngô Thị Hương',
    chiPhiVanHanh: 1200000,
    thuLaoLaiXe: 800000,
    thuLaoPhuXe: 500000,
    diemDi: 'Hà Nội',
    diemDen: 'Hải Phòng',
    khoangCach: 120,
  },
  {
    maChuyen: 'CH005',
    tenChuyen: 'HN-SG Tối 19:00',
    thoiGianKhoiHanh: '2025-02-06T19:00:00',
    thoiGianDen: '2025-02-07T19:00:00',
    maXe: 'XE002',
    maTuyen: 'TU001',
    trangThai: 'Completed',
    tenXe: 'Xe Giường Nằm HN-SG 01',
    bienSo: '30A-67890',
    tenTuyen: 'Hà Nội - Hồ Chí Minh',
    soVeDaBan: 30,
    tongCho: 32,
    maTaiXeLaiXe: 'TX002',
    tenTaiXeLaiXe: 'Trần Văn Bình',
    maTaiXePhuXe: 'TX005',
    tenTaiXePhuXe: 'Hoàng Văn Em',
    chiPhiVanHanh: 8500000,
    thuLaoLaiXe: 2500000,
    thuLaoPhuXe: 1500000,
    diemDi: 'Hà Nội',
    diemDen: 'Hồ Chí Minh',
    khoangCach: 1700,
  },
];

// Tính chi phí vận hành
export const calculateOperationCost = (
  khoangCach: number,
  mucTieuHao: number,
  giaNhienLieu: number = 22000,
): number => {
  // Chi phí nhiên liệu = khoảng cách * mức tiêu hao / 100 * giá nhiên liệu
  const chiPhiNhienLieu = (khoangCach * mucTieuHao * giaNhienLieu) / 100;
  // Phụ phí khác (ước tính 30%)
  const phuPhi = chiPhiNhienLieu * 0.3;
  return Math.round(chiPhiNhienLieu + phuPhi);
};

// Tính thù lao tài xế theo độ khó tuyến
export const calculateDriverWage = (
  khoangCach: number,
  heSoDuongKho: number,
  heSoLuong: number,
  giaCoSo: number = 5000, // VND/km
): number => {
  return Math.round(khoangCach * heSoDuongKho * heSoLuong * giaCoSo);
};

// Kiểm tra xe còn chỗ không
export const hasAvailableSeats = (trip: TripDetail): boolean => {
  return (trip.soVeDaBan ?? 0) < (trip.tongCho ?? 0);
};

// Lấy số chỗ còn trống
export const getAvailableSeats = (trip: TripDetail): number => {
  return Math.max(0, (trip.tongCho ?? 0) - (trip.soVeDaBan ?? 0));
};
