/**
 * Routes Mock Data
 * Mock data cho quản lý tuyến đường
 */

import type { Route, RouteSearchResult } from '@base/models/entities/route';

// Độ phức tạp đường và hệ số
export const ROUTE_COMPLEXITY = [
  { ma: '1', ten: 'Đơn giản', heSo: 1.0, moTa: 'Đường cao tốc, quốc lộ phẳng' },
  { ma: '2', ten: 'Trung bình', heSo: 1.3, moTa: 'Đường tỉnh lộ, có đèo thấp' },
  { ma: '3', ten: 'Phức tạp', heSo: 1.6, moTa: 'Đường đèo núi, địa hình khó' },
] as const;

// Mock routes data
export const mockRoutes: RouteSearchResult[] = [
  {
    maTuyen: 'TU001',
    tenTuyen: 'Hà Nội - Hồ Chí Minh',
    diemDi: 'Hà Nội',
    diemDen: 'Hồ Chí Minh',
    khoangCach: 1700,
    maDoPhucTap: '1',
    tenDoPhucTap: 'Đơn giản',
    totalTrips: 150,
    totalRevenue: 1200000000,
  },
  {
    maTuyen: 'TU002',
    tenTuyen: 'Hà Nội - Đà Nẵng',
    diemDi: 'Hà Nội',
    diemDen: 'Đà Nẵng',
    khoangCach: 764,
    maDoPhucTap: '2',
    tenDoPhucTap: 'Trung bình',
    totalTrips: 200,
    totalRevenue: 800000000,
  },
  {
    maTuyen: 'TU003',
    tenTuyen: 'Hà Nội - Sapa',
    diemDi: 'Hà Nội',
    diemDen: 'Sapa',
    khoangCach: 320,
    maDoPhucTap: '3',
    tenDoPhucTap: 'Phức tạp',
    totalTrips: 80,
    totalRevenue: 320000000,
  },
  {
    maTuyen: 'TU004',
    tenTuyen: 'Hà Nội - Hải Phòng',
    diemDi: 'Hà Nội',
    diemDen: 'Hải Phòng',
    khoangCach: 120,
    maDoPhucTap: '1',
    tenDoPhucTap: 'Đơn giản',
    totalTrips: 300,
    totalRevenue: 450000000,
  },
  {
    maTuyen: 'TU005',
    tenTuyen: 'Hà Nội - Ninh Bình',
    diemDi: 'Hà Nội',
    diemDen: 'Ninh Bình',
    khoangCach: 93,
    maDoPhucTap: '1',
    tenDoPhucTap: 'Đơn giản',
    totalTrips: 250,
    totalRevenue: 280000000,
  },
  {
    maTuyen: 'TU006',
    tenTuyen: 'Hà Nội - Mộc Châu',
    diemDi: 'Hà Nội',
    diemDen: 'Mộc Châu',
    khoangCach: 195,
    maDoPhucTap: '3',
    tenDoPhucTap: 'Phức tạp',
    totalTrips: 60,
    totalRevenue: 180000000,
  },
  {
    maTuyen: 'TU007',
    tenTuyen: 'Đà Nẵng - Hồ Chí Minh',
    diemDi: 'Đà Nẵng',
    diemDen: 'Hồ Chí Minh',
    khoangCach: 960,
    maDoPhucTap: '2',
    tenDoPhucTap: 'Trung bình',
    totalTrips: 120,
    totalRevenue: 600000000,
  },
  {
    maTuyen: 'TU008',
    tenTuyen: 'Hồ Chí Minh - Đà Lạt',
    diemDi: 'Hồ Chí Minh',
    diemDen: 'Đà Lạt',
    khoangCach: 305,
    maDoPhucTap: '3',
    tenDoPhucTap: 'Phức tạp',
    totalTrips: 100,
    totalRevenue: 350000000,
  },
];

// Lấy hệ số đường khó theo mã độ phức tạp
export const getComplexityFactor = (maDoPhucTap: string): number => {
  const complexity = ROUTE_COMPLEXITY.find((c) => c.ma === maDoPhucTap);
  return complexity?.heSo ?? 1.0;
};

// Tính km thực tế = km tuyến * hệ số đường khó
export const calculateActualKm = (khoangCach: number, maDoPhucTap: string): number => {
  const heSo = getComplexityFactor(maDoPhucTap);
  return Math.round(khoangCach * heSo);
};

// Giá vé cơ bản theo km
export const BASE_PRICE_PER_KM = 800; // VND/km

// Hệ số giá theo thời điểm
export const PRICE_SEASON = [
  { ma: 'THUONG', ten: 'Ngày thường', heSo: 1.0 },
  { ma: 'CUOI_TUAN', ten: 'Cuối tuần', heSo: 1.15 },
  { ma: 'LE', ten: 'Lễ/Tết', heSo: 1.5 },
  { ma: 'MUA_DU_LICH', ten: 'Mùa du lịch', heSo: 1.3 },
] as const;

// Tính giá vé = khoảng cách * giá cơ bản * hệ số mùa
export const calculateTicketPrice = (khoangCach: number, seasonType: string = 'THUONG'): number => {
  const season = PRICE_SEASON.find((s) => s.ma === seasonType);
  const heSoMua = season?.heSo ?? 1.0;
  return Math.round(khoangCach * BASE_PRICE_PER_KM * heSoMua);
};
