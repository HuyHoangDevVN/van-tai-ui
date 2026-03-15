/**
 * Maintenance Mock Data
 * Mock data cho bảo dưỡng và đăng kiểm
 *
 * Logic bảo dưỡng:
 * - Chu kỳ bảo dưỡng tối đa: 360 ngày
 * - Số ngày giảm: 1 ngày / 100km làm việc
 * - Km làm việc = km tuyến * hệ số đường khó
 */

import type { Maintenance, MaintenanceStatus } from '@base/models/entities/maintenance';
import { getComplexityFactor } from './routes.mock';

// Chu kỳ bảo dưỡng
export const MAINTENANCE_CYCLE_DAYS = 360;
export const KM_PER_DAY_REDUCTION = 100; // 100km giảm 1 ngày

// Trạng thái bảo dưỡng
export const MAINTENANCE_STATUS = [
  { ma: 'BINH_THUONG', ten: 'Bình thường', color: 'green' },
  { ma: 'SAP_DEN_HAN', ten: 'Sắp đến hạn', color: 'orange' },
  { ma: 'QUA_HAN', ten: 'Quá hạn', color: 'red' },
] as const;

// Loại bảo dưỡng
export const MAINTENANCE_TYPES = [
  { ma: 'DINH_KY', ten: 'Bảo dưỡng định kỳ' },
  { ma: 'SUA_CHUA', ten: 'Sửa chữa' },
  { ma: 'DANG_KIEM', ten: 'Đăng kiểm' },
  { ma: 'DOT_XUAT', ten: 'Đột xuất' },
] as const;

// Mock maintenance status data với tính toán ngày bảo dưỡng
export interface MaintenanceStatusExtended extends MaintenanceStatus {
  ngayBaoTriTiepTheo: string;
  soNgayConLai: number;
  hanDangKiem: string;
  soNgayDenDangKiem: number;
  trangThaiDangKiem: string;
  kmTuBaoTri: number;
}

// Tính số ngày bảo dưỡng còn lại
export const calculateMaintenanceDaysLeft = (
  ngayBaoTriCuoi: string,
  tongKmTuBaoTri: number,
): number => {
  const today = new Date();
  const lastMaintenance = new Date(ngayBaoTriCuoi);
  const daysSinceMaintenance = Math.floor(
    (today.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Giảm thêm ngày dựa trên km đã chạy
  const daysReductionFromKm = Math.floor(tongKmTuBaoTri / KM_PER_DAY_REDUCTION);

  // Số ngày còn lại = 360 - số ngày đã trôi qua - số ngày giảm từ km
  const daysLeft = MAINTENANCE_CYCLE_DAYS - daysSinceMaintenance - daysReductionFromKm;

  return daysLeft;
};

// Tính ngày bảo dưỡng tiếp theo
export const calculateNextMaintenanceDate = (
  ngayBaoTriCuoi: string,
  tongKmTuBaoTri: number,
): Date => {
  const daysLeft = calculateMaintenanceDaysLeft(ngayBaoTriCuoi, tongKmTuBaoTri);
  const today = new Date();
  const nextDate = new Date(today.getTime() + daysLeft * 24 * 60 * 60 * 1000);
  return nextDate;
};

// Lấy trạng thái bảo dưỡng
export const getMaintenanceStatus = (daysLeft: number): (typeof MAINTENANCE_STATUS)[number] => {
  if (daysLeft <= 0) return MAINTENANCE_STATUS[2]; // Quá hạn
  if (daysLeft <= 30) return MAINTENANCE_STATUS[1]; // Sắp đến hạn
  return MAINTENANCE_STATUS[0]; // Bình thường
};

// Mock data cho trạng thái bảo dưỡng xe
export const mockMaintenanceStatus: MaintenanceStatusExtended[] = [
  {
    maXe: 'XE001',
    tenXe: 'Xe Limousine Hà Nội 01',
    bienSo: '29A-12345',
    trangThai: 'Hoạt động',
    tongKmVanHanh: 45000,
    ngayBaoTriCuoi: '2024-12-01',
    soNgayTuBaoTri: 68,
    trangThaiBaoTri: 'Bình thường',
    canBaoTri: false,
    ngayBaoTriTiepTheo: '2025-10-15',
    soNgayConLai: 250,
    hanDangKiem: '2025-06-15',
    soNgayDenDangKiem: 128,
    trangThaiDangKiem: 'Bình thường',
    kmTuBaoTri: 8500,
  },
  {
    maXe: 'XE002',
    tenXe: 'Xe Giường Nằm HN-SG 01',
    bienSo: '30A-67890',
    trangThai: 'Hoạt động',
    tongKmVanHanh: 89000,
    ngayBaoTriCuoi: '2024-10-15',
    soNgayTuBaoTri: 115,
    trangThaiBaoTri: 'Sắp đến hạn',
    canBaoTri: false,
    ngayBaoTriTiepTheo: '2025-03-10',
    soNgayConLai: 31,
    hanDangKiem: '2025-03-20',
    soNgayDenDangKiem: 41,
    trangThaiDangKiem: 'Sắp đến hạn',
    kmTuBaoTri: 25000,
  },
  {
    maXe: 'XE003',
    tenXe: 'Xe Bus Ngồi Hà Nội 02',
    bienSo: '29B-11111',
    trangThai: 'Bảo trì',
    tongKmVanHanh: 120000,
    ngayBaoTriCuoi: '2024-08-01',
    soNgayTuBaoTri: 190,
    trangThaiBaoTri: 'Quá hạn',
    canBaoTri: true,
    ngayBaoTriTiepTheo: '2025-01-25',
    soNgayConLai: -13,
    hanDangKiem: '2024-12-01',
    soNgayDenDangKiem: -68,
    trangThaiDangKiem: 'Quá hạn',
    kmTuBaoTri: 35000,
  },
  {
    maXe: 'XE004',
    tenXe: 'Mini Bus VIP 01',
    bienSo: '29C-22222',
    trangThai: 'Hoạt động',
    tongKmVanHanh: 15000,
    ngayBaoTriCuoi: '2025-01-05',
    soNgayTuBaoTri: 33,
    trangThaiBaoTri: 'Bình thường',
    canBaoTri: false,
    ngayBaoTriTiepTheo: '2025-12-01',
    soNgayConLai: 297,
    hanDangKiem: '2026-01-10',
    soNgayDenDangKiem: 337,
    trangThaiDangKiem: 'Bình thường',
    kmTuBaoTri: 3000,
  },
  {
    maXe: 'XE005',
    tenXe: 'Xe Giường Nằm HN-ĐN 01',
    bienSo: '30B-33333',
    trangThai: 'Ngừng hoạt động',
    tongKmVanHanh: 200000,
    ngayBaoTriCuoi: '2024-06-01',
    soNgayTuBaoTri: 251,
    trangThaiBaoTri: 'Quá hạn',
    canBaoTri: true,
    ngayBaoTriTiepTheo: '2024-11-20',
    soNgayConLai: -79,
    hanDangKiem: '2024-09-15',
    soNgayDenDangKiem: -145,
    trangThaiDangKiem: 'Quá hạn',
    kmTuBaoTri: 45000,
  },
];

// Lịch sử bảo dưỡng
export const mockMaintenanceHistory: Maintenance[] = [
  {
    maBaoTri: 'BT001',
    maXe: 'XE001',
    donVi: 'Garage Thành Công',
    chiPhi: 5000000,
    ngay: '2024-12-01',
    soKm: 45000,
  },
  {
    maBaoTri: 'BT002',
    maXe: 'XE002',
    donVi: 'Trung tâm bảo dưỡng Thaco',
    chiPhi: 8500000,
    ngay: '2024-10-15',
    soKm: 89000,
  },
  {
    maBaoTri: 'BT003',
    maXe: 'XE003',
    donVi: 'Garage Phương Nam',
    chiPhi: 12000000,
    ngay: '2024-08-01',
    soKm: 120000,
  },
  {
    maBaoTri: 'BT004',
    maXe: 'XE004',
    donVi: 'Mercedes Service Center',
    chiPhi: 6500000,
    ngay: '2025-01-05',
    soKm: 15000,
  },
  {
    maBaoTri: 'BT005',
    maXe: 'XE001',
    donVi: 'Garage Thành Công',
    chiPhi: 4500000,
    ngay: '2024-06-01',
    soKm: 38000,
  },
];

// Tính km thực tế sau khi áp dụng hệ số đường khó
export const calculateActualKmWorked = (kmTuyen: number, maDoPhucTap: string): number => {
  const heSo = getComplexityFactor(maDoPhucTap);
  return Math.round(kmTuyen * heSo);
};
