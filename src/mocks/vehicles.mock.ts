/**
 * Vehicles Mock Data
 * Mock data cho quản lý xe khách
 */

import type { Vehicle, VehicleSearchResult } from '@base/models/entities/vehicle';

// Loại xe và số ghế tương ứng
export const VEHICLE_TYPES = [
  { ma: 'GIUONG_NAM', ten: 'Giường nằm', soGhe: 34, soKhachToiDa: 32 },
  { ma: 'BUS_NGOI', ten: 'Bus ngồi', soGhe: 45, soKhachToiDa: 43 },
  { ma: 'LIMOUSINE', ten: 'Limousine', soGhe: 22, soKhachToiDa: 20 },
  { ma: 'MINI_BUS', ten: 'Mini bus', soGhe: 16, soKhachToiDa: 14 },
] as const;

// Trạng thái xe
export const VEHICLE_STATUS = [
  { ma: 'HOAT_DONG', ten: 'Hoạt động', color: 'green' },
  { ma: 'BAO_TRI', ten: 'Bảo trì', color: 'orange' },
  { ma: 'NGUNG_HOAT_DONG', ten: 'Ngừng hoạt động', color: 'red' },
] as const;

// Mock vehicles data
export const mockVehicles: VehicleSearchResult[] = [
  {
    maXe: 'XE001',
    tenXe: 'Xe Limousine Hà Nội 01',
    bienSo: '29A-12345',
    hangSanXuat: 'Hyundai',
    namSanXuat: 2022,
    ngayDangKiem: '2025-06-15',
    trangThai: 'Hoạt động',
    tongKmVanHanh: 45000,
    ngayBaoTriCuoi: '2024-12-01',
    mucTieuHao: 12.5,
    phuThuPhiVanHanh: 50000,
    soChoNgoi: 22,
    totalTrips: 120,
    driverName: 'Nguyễn Văn An',
  },
  {
    maXe: 'XE002',
    tenXe: 'Xe Giường Nằm HN-SG 01',
    bienSo: '30A-67890',
    hangSanXuat: 'Thaco',
    namSanXuat: 2021,
    ngayDangKiem: '2025-03-20',
    trangThai: 'Hoạt động',
    tongKmVanHanh: 89000,
    ngayBaoTriCuoi: '2024-10-15',
    mucTieuHao: 18.0,
    phuThuPhiVanHanh: 70000,
    soChoNgoi: 34,
    totalTrips: 200,
    driverName: 'Trần Văn Bình',
  },
  {
    maXe: 'XE003',
    tenXe: 'Xe Bus Ngồi Hà Nội 02',
    bienSo: '29B-11111',
    hangSanXuat: 'Daewoo',
    namSanXuat: 2020,
    ngayDangKiem: '2024-12-01',
    trangThai: 'Bảo trì',
    tongKmVanHanh: 120000,
    ngayBaoTriCuoi: '2024-08-01',
    mucTieuHao: 20.0,
    phuThuPhiVanHanh: 80000,
    soChoNgoi: 45,
    totalTrips: 350,
    driverName: 'Lê Văn Cường',
  },
  {
    maXe: 'XE004',
    tenXe: 'Mini Bus VIP 01',
    bienSo: '29C-22222',
    hangSanXuat: 'Mercedes',
    namSanXuat: 2023,
    ngayDangKiem: '2026-01-10',
    trangThai: 'Hoạt động',
    tongKmVanHanh: 15000,
    ngayBaoTriCuoi: '2025-01-05',
    mucTieuHao: 10.0,
    phuThuPhiVanHanh: 45000,
    soChoNgoi: 16,
    totalTrips: 80,
    driverName: 'Phạm Văn Đức',
  },
  {
    maXe: 'XE005',
    tenXe: 'Xe Giường Nằm HN-ĐN 01',
    bienSo: '30B-33333',
    hangSanXuat: 'Thaco',
    namSanXuat: 2019,
    ngayDangKiem: '2024-09-15',
    trangThai: 'Ngừng hoạt động',
    tongKmVanHanh: 200000,
    ngayBaoTriCuoi: '2024-06-01',
    mucTieuHao: 19.5,
    phuThuPhiVanHanh: 75000,
    soChoNgoi: 34,
    totalTrips: 450,
    driverName: null,
  },
];

// Tính số khách tối đa = số ghế - 2 (theo quy định)
export const getMaxPassengers = (soGhe: number): number => {
  return Math.max(0, soGhe - 2);
};

// Lấy loại xe theo số ghế
export const getVehicleTypeBySeats = (soGhe: number) => {
  return VEHICLE_TYPES.find((type) => type.soGhe === soGhe);
};
