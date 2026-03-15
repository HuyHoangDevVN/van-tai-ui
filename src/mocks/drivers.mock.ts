/**
 * Drivers Mock Data
 * Mock data cho quản lý tài xế
 */

import type { Driver, DriverSearchResult } from '@base/models/entities/driver';

// Vai trò tài xế
export const DRIVER_ROLES = [
  { ma: 'LAI_XE', ten: 'Lái xe chính', heSoLuong: 1.5 },
  { ma: 'PHU_XE', ten: 'Phụ xe', heSoLuong: 1.0 },
] as const;

// Mock drivers data
export const mockDrivers: DriverSearchResult[] = [
  {
    maTaiXe: 'TX001',
    tenTaiXe: 'Nguyễn Văn An',
    ngaySinh: '1985-03-15',
    gioiTinh: 'Nam',
    queQuan: 'Hà Nội',
    tonGiao: 'Không',
    soCccd: '001085012345',
    ngayKyHopDong: '2020-01-15',
    tuoi: 39,
    heSoLuong: 1.5,
    tongSoChuyen: 120,
    totalAssignments: 120,
    currentVehicle: 'XE001',
  },
  {
    maTaiXe: 'TX002',
    tenTaiXe: 'Trần Văn Bình',
    ngaySinh: '1988-07-22',
    gioiTinh: 'Nam',
    queQuan: 'Hải Phòng',
    tonGiao: 'Không',
    soCccd: '001088067890',
    ngayKyHopDong: '2019-06-01',
    tuoi: 36,
    heSoLuong: 1.5,
    tongSoChuyen: 200,
    totalAssignments: 200,
    currentVehicle: 'XE002',
  },
  {
    maTaiXe: 'TX003',
    tenTaiXe: 'Lê Văn Cường',
    ngaySinh: '1990-11-30',
    gioiTinh: 'Nam',
    queQuan: 'Nam Định',
    tonGiao: 'Phật giáo',
    soCccd: '001090111111',
    ngayKyHopDong: '2021-03-20',
    tuoi: 34,
    heSoLuong: 1.5,
    tongSoChuyen: 95,
    totalAssignments: 95,
    currentVehicle: 'XE003',
  },
  {
    maTaiXe: 'TX004',
    tenTaiXe: 'Phạm Văn Đức',
    ngaySinh: '1992-05-18',
    gioiTinh: 'Nam',
    queQuan: 'Thái Bình',
    tonGiao: 'Không',
    soCccd: '001092222222',
    ngayKyHopDong: '2022-01-10',
    tuoi: 32,
    heSoLuong: 1.5,
    tongSoChuyen: 80,
    totalAssignments: 80,
    currentVehicle: 'XE004',
  },
  {
    maTaiXe: 'TX005',
    tenTaiXe: 'Hoàng Văn Em',
    ngaySinh: '1995-09-25',
    gioiTinh: 'Nam',
    queQuan: 'Hà Nam',
    tonGiao: 'Không',
    soCccd: '001095333333',
    ngayKyHopDong: '2023-02-15',
    tuoi: 29,
    heSoLuong: 1.0, // Phụ xe
    tongSoChuyen: 60,
    totalAssignments: 60,
    currentVehicle: null,
  },
  {
    maTaiXe: 'TX006',
    tenTaiXe: 'Ngô Thị Hương',
    ngaySinh: '1993-12-08',
    gioiTinh: 'Nữ',
    queQuan: 'Hưng Yên',
    tonGiao: 'Không',
    soCccd: '001093444444',
    ngayKyHopDong: '2022-08-01',
    tuoi: 31,
    heSoLuong: 1.0, // Phụ xe
    tongSoChuyen: 45,
    totalAssignments: 45,
    currentVehicle: null,
  },
];

// Phân công tài xế theo chuyến (1 lái xe chính + 1 phụ xe)
export interface TripAssignment {
  maChuyen: string;
  maTaiXeLaiXe: string;
  tenTaiXeLaiXe: string;
  maTaiXePhuXe: string;
  tenTaiXePhuXe: string;
}

export const mockTripAssignments: TripAssignment[] = [
  {
    maChuyen: 'CH001',
    maTaiXeLaiXe: 'TX001',
    tenTaiXeLaiXe: 'Nguyễn Văn An',
    maTaiXePhuXe: 'TX005',
    tenTaiXePhuXe: 'Hoàng Văn Em',
  },
  {
    maChuyen: 'CH002',
    maTaiXeLaiXe: 'TX002',
    tenTaiXeLaiXe: 'Trần Văn Bình',
    maTaiXePhuXe: 'TX006',
    tenTaiXePhuXe: 'Ngô Thị Hương',
  },
  {
    maChuyen: 'CH003',
    maTaiXeLaiXe: 'TX003',
    tenTaiXeLaiXe: 'Lê Văn Cường',
    maTaiXePhuXe: 'TX005',
    tenTaiXePhuXe: 'Hoàng Văn Em',
  },
];

// Lấy vai trò tài xế theo hệ số lương
export const getDriverRole = (heSoLuong: number) => {
  return heSoLuong >= 1.5 ? DRIVER_ROLES[0] : DRIVER_ROLES[1];
};

// Mức lương cơ bản
export const BASE_SALARY = 8000000; // VND/tháng

// Interface chi tiết tài xế
export interface DriverDetail extends DriverSearchResult {
  tongThuLao?: number;
  soChuyenThang?: number;
}

// Tính thù lao tài xế theo chuyến
export const calculateDriverWage = (
  khoangCach: number,
  heSoLuong: number,
  heSoDuongKho: number = 1,
  donGiaCoSo: number = 2500, // VND/km
): number => {
  return Math.round(khoangCach * heSoLuong * heSoDuongKho * donGiaCoSo);
};
