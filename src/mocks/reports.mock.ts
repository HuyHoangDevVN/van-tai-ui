/**
 * Reports Mock Data
 * Mock data cho báo cáo thống kê
 */

import type {
  ChiPhiCoBanReport,
  DoanhThuXeBusNgoiReport,
  GiaVeXeBusNgoiReport,
  DoanhThuTuyenDuongReport,
  LuongThangTaiXeReport,
} from '@base/models/entities/report';

// Mock báo cáo lương tài xế theo tháng
export interface DriverSalaryReport extends LuongThangTaiXeReport {
  vaiTro: string;
  soChuyen: number;
  heSoLuong: number;
  thangNam: string;
}

export const mockDriverSalaryReports: DriverSalaryReport[] = [
  {
    maTaiXe: 'TX001',
    tenTaiXe: 'Nguyễn Văn An',
    tongKm: 4580,
    soTuyen: 8,
    luongThang: 18500000,
    vaiTro: 'Lái xe chính',
    soChuyen: 12,
    heSoLuong: 1.5,
    thangNam: '01/2025',
  },
  {
    maTaiXe: 'TX002',
    tenTaiXe: 'Trần Văn Bình',
    tongKm: 6800,
    soTuyen: 5,
    luongThang: 22000000,
    vaiTro: 'Lái xe chính',
    soChuyen: 15,
    heSoLuong: 1.5,
    thangNam: '01/2025',
  },
  {
    maTaiXe: 'TX003',
    tenTaiXe: 'Lê Văn Cường',
    tongKm: 2400,
    soTuyen: 10,
    luongThang: 12000000,
    vaiTro: 'Lái xe chính',
    soChuyen: 20,
    heSoLuong: 1.5,
    thangNam: '01/2025',
  },
  {
    maTaiXe: 'TX004',
    tenTaiXe: 'Phạm Văn Đức',
    tongKm: 1920,
    soTuyen: 6,
    luongThang: 9500000,
    vaiTro: 'Lái xe chính',
    soChuyen: 8,
    heSoLuong: 1.5,
    thangNam: '01/2025',
  },
  {
    maTaiXe: 'TX005',
    tenTaiXe: 'Hoàng Văn Em',
    tongKm: 5200,
    soTuyen: 12,
    luongThang: 8500000,
    vaiTro: 'Phụ xe',
    soChuyen: 18,
    heSoLuong: 1.0,
    thangNam: '01/2025',
  },
  {
    maTaiXe: 'TX006',
    tenTaiXe: 'Ngô Thị Hương',
    tongKm: 3600,
    soTuyen: 8,
    luongThang: 6500000,
    vaiTro: 'Phụ xe',
    soChuyen: 14,
    heSoLuong: 1.0,
    thangNam: '01/2025',
  },
];

// Mock báo cáo doanh thu xe theo tháng
export interface VehicleRevenueReport extends DoanhThuXeBusNgoiReport {
  tenXe: string;
  bienSo: string;
  soChuyen: number;
  soVeBan: number;
  tongCho: number;
  tyLeLapDay: number;
}

export const mockVehicleRevenueReports: VehicleRevenueReport[] = [
  {
    maXe: 'XE001',
    thang: '01/2025',
    doanhThuThang: 45000000,
    tenXe: 'Xe Limousine Hà Nội 01',
    bienSo: '29A-12345',
    soChuyen: 12,
    soVeBan: 228,
    tongCho: 240,
    tyLeLapDay: 95,
  },
  {
    maXe: 'XE002',
    thang: '01/2025',
    doanhThuThang: 127500000,
    tenXe: 'Xe Giường Nằm HN-SG 01',
    bienSo: '30A-67890',
    soChuyen: 15,
    soVeBan: 450,
    tongCho: 480,
    tyLeLapDay: 93.75,
  },
  {
    maXe: 'XE003',
    thang: '01/2025',
    doanhThuThang: 30000000,
    tenXe: 'Xe Bus Ngồi Hà Nội 02',
    bienSo: '29B-11111',
    soChuyen: 20,
    soVeBan: 800,
    tongCho: 860,
    tyLeLapDay: 93.02,
  },
  {
    maXe: 'XE004',
    thang: '01/2025',
    doanhThuThang: 28000000,
    tenXe: 'Mini Bus VIP 01',
    bienSo: '29C-22222',
    soChuyen: 8,
    soVeBan: 108,
    tongCho: 112,
    tyLeLapDay: 96.43,
  },
];

// Mock báo cáo doanh thu theo tuyến đường
export interface RouteRevenueReport extends DoanhThuTuyenDuongReport {
  diemDi: string;
  diemDen: string;
  khoangCach: number;
  soChuyen: number;
  soVeBan: number;
}

export const mockRouteRevenueReports: RouteRevenueReport[] = [
  {
    maTuyen: 'TU001',
    tenTuyen: 'Hà Nội - Hồ Chí Minh',
    thang: '01/2025',
    doanhThuThang: 127500000,
    diemDi: 'Hà Nội',
    diemDen: 'Hồ Chí Minh',
    khoangCach: 1700,
    soChuyen: 15,
    soVeBan: 450,
  },
  {
    maTuyen: 'TU002',
    tenTuyen: 'Hà Nội - Đà Nẵng',
    thang: '01/2025',
    doanhThuThang: 45000000,
    diemDi: 'Hà Nội',
    diemDen: 'Đà Nẵng',
    khoangCach: 764,
    soChuyen: 12,
    soVeBan: 228,
  },
  {
    maTuyen: 'TU003',
    tenTuyen: 'Hà Nội - Sapa',
    thang: '01/2025',
    doanhThuThang: 28000000,
    diemDi: 'Hà Nội',
    diemDen: 'Sapa',
    khoangCach: 320,
    soChuyen: 8,
    soVeBan: 108,
  },
  {
    maTuyen: 'TU004',
    tenTuyen: 'Hà Nội - Hải Phòng',
    thang: '01/2025',
    doanhThuThang: 30000000,
    diemDi: 'Hà Nội',
    diemDen: 'Hải Phòng',
    khoangCach: 120,
    soChuyen: 20,
    soVeBan: 800,
  },
];

// Mock báo cáo doanh thu theo loại xe
export interface VehicleTypeRevenueReport {
  loaiXe: string;
  soXe: number;
  soChuyen: number;
  doanhThu: number;
  tyTrong: number;
  thang: string;
}

export const mockVehicleTypeRevenueReports: VehicleTypeRevenueReport[] = [
  {
    loaiXe: 'Giường nằm',
    soXe: 2,
    soChuyen: 15,
    doanhThu: 127500000,
    tyTrong: 55.32,
    thang: '01/2025',
  },
  {
    loaiXe: 'Limousine',
    soXe: 1,
    soChuyen: 12,
    doanhThu: 45000000,
    tyTrong: 19.52,
    thang: '01/2025',
  },
  {
    loaiXe: 'Bus ngồi',
    soXe: 1,
    soChuyen: 20,
    doanhThu: 30000000,
    tyTrong: 13.02,
    thang: '01/2025',
  },
  {
    loaiXe: 'Mini bus',
    soXe: 1,
    soChuyen: 8,
    doanhThu: 28000000,
    tyTrong: 12.15,
    thang: '01/2025',
  },
];

// Tính lương tài xế
// Công thức: Thù lao = Tổng km * Hệ số lương * Đơn giá cơ bản * Hệ số đường khó
export const calculateDriverSalary = (
  tongKm: number,
  heSoLuong: number,
  heSoDuongKho: number = 1,
  donGiaCoSo: number = 2500, // VND/km
): number => {
  return Math.round(tongKm * heSoLuong * heSoDuongKho * donGiaCoSo);
};

// Tính doanh thu xe
export const calculateVehicleRevenue = (soVeBan: number, giaVeTrungBinh: number): number => {
  return soVeBan * giaVeTrungBinh;
};

// Tổng hợp doanh thu theo tháng
export const getTotalMonthlyRevenue = (reports: VehicleRevenueReport[]): number => {
  return reports.reduce((sum, r) => sum + r.doanhThuThang, 0);
};
