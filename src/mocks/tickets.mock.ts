/**
 * Tickets Mock Data
 * Mock data cho quản lý vé
 */

import type { Ticket, TicketSearchResult } from '@base/models/entities/ticket';

// Trạng thái thanh toán
export const PAYMENT_STATUS = [
  { ma: 'DA_THANH_TOAN', ten: 'Đã thanh toán', color: 'green' },
  { ma: 'CHUA_THANH_TOAN', ten: 'Chưa thanh toán', color: 'orange' },
  { ma: 'DA_HUY', ten: 'Đã hủy', color: 'red' },
] as const;

// Phương thức thanh toán
export const PAYMENT_METHODS = [
  { ma: 'TIEN_MAT', ten: 'Tiền mặt' },
  { ma: 'CHUYEN_KHOAN', ten: 'Chuyển khoản' },
  { ma: 'THE', ten: 'Thẻ tín dụng/ghi nợ' },
  { ma: 'MOMO', ten: 'Ví MoMo' },
  { ma: 'VNPAY', ten: 'VNPay' },
] as const;

// Vị trí ghế
export const SEAT_POSITIONS = [
  { ma: 'TRUOC', ten: 'Hàng đầu', phuThu: 20000 },
  { ma: 'GIUA', ten: 'Hàng giữa', phuThu: 0 },
  { ma: 'SAU', ten: 'Hàng sau', phuThu: -10000 },
] as const;

// Mock tickets data with full details
export interface TicketDetail extends TicketSearchResult {
  maVe: string; // Mã vé theo format: CHUYEN-TUYEN-XE-STT
  maXe: string;
  tenXe: string;
  bienSo: string;
  diemDi: string;
  diemDen: string;
  khoangCach: number;
}

export const mockTickets: TicketDetail[] = [
  {
    stt: 1,
    maKhach: 'KH001',
    maChuyen: 'CH001',
    phuongThucTT: 'Chuyển khoản',
    thoiGianDat: '2025-02-05T10:30:00',
    viTri: 'A1',
    trangThaiTT: 'Đã thanh toán',
    maGhe: 1,
    maGiuong: null,
    tenKhach: 'Nguyễn Minh Anh',
    dienThoai: '0901234567',
    thoiGianKhoiHanh: '2025-02-08T06:00:00',
    tenTuyen: 'Hà Nội - Hồ Chí Minh',
    giaVe: 850000,
    maVe: 'CH001-TU001-XE002-001',
    maXe: 'XE002',
    tenXe: 'Xe Giường Nằm HN-SG 01',
    bienSo: '30A-67890',
    diemDi: 'Hà Nội',
    diemDen: 'Hồ Chí Minh',
    khoangCach: 1700,
  },
  {
    stt: 2,
    maKhach: 'KH002',
    maChuyen: 'CH001',
    phuongThucTT: 'Tiền mặt',
    thoiGianDat: '2025-02-05T14:20:00',
    viTri: 'A2',
    trangThaiTT: 'Đã thanh toán',
    maGhe: 2,
    maGiuong: null,
    tenKhach: 'Trần Văn Hùng',
    dienThoai: '0912345678',
    thoiGianKhoiHanh: '2025-02-08T06:00:00',
    tenTuyen: 'Hà Nội - Hồ Chí Minh',
    giaVe: 850000,
    maVe: 'CH001-TU001-XE002-002',
    maXe: 'XE002',
    tenXe: 'Xe Giường Nằm HN-SG 01',
    bienSo: '30A-67890',
    diemDi: 'Hà Nội',
    diemDen: 'Hồ Chí Minh',
    khoangCach: 1700,
  },
  {
    stt: 3,
    maKhach: 'KH003',
    maChuyen: 'CH002',
    phuongThucTT: 'Ví MoMo',
    thoiGianDat: '2025-02-06T08:45:00',
    viTri: 'B1',
    trangThaiTT: 'Đã thanh toán',
    maGhe: 5,
    maGiuong: null,
    tenKhach: 'Lê Thị Hoa',
    dienThoai: '0923456789',
    thoiGianKhoiHanh: '2025-02-08T07:00:00',
    tenTuyen: 'Hà Nội - Đà Nẵng',
    giaVe: 450000,
    maVe: 'CH002-TU002-XE001-003',
    maXe: 'XE001',
    tenXe: 'Xe Limousine Hà Nội 01',
    bienSo: '29A-12345',
    diemDi: 'Hà Nội',
    diemDen: 'Đà Nẵng',
    khoangCach: 764,
  },
  {
    stt: 4,
    maKhach: 'KH004',
    maChuyen: 'CH002',
    phuongThucTT: 'Chuyển khoản',
    thoiGianDat: '2025-02-06T09:15:00',
    viTri: 'B2',
    trangThaiTT: 'Chưa thanh toán',
    maGhe: 6,
    maGiuong: null,
    tenKhach: 'Phạm Văn Nam',
    dienThoai: '0934567890',
    thoiGianKhoiHanh: '2025-02-08T07:00:00',
    tenTuyen: 'Hà Nội - Đà Nẵng',
    giaVe: 450000,
    maVe: 'CH002-TU002-XE001-004',
    maXe: 'XE001',
    tenXe: 'Xe Limousine Hà Nội 01',
    bienSo: '29A-12345',
    diemDi: 'Hà Nội',
    diemDen: 'Đà Nẵng',
    khoangCach: 764,
  },
  {
    stt: 5,
    maKhach: 'KH005',
    maChuyen: 'CH003',
    phuongThucTT: 'VNPay',
    thoiGianDat: '2025-02-05T16:00:00',
    viTri: 'C1',
    trangThaiTT: 'Đã thanh toán',
    maGhe: 10,
    maGiuong: null,
    tenKhach: 'Hoàng Văn Tú',
    dienThoai: '0945678901',
    thoiGianKhoiHanh: '2025-02-07T20:00:00',
    tenTuyen: 'Hà Nội - Sapa',
    giaVe: 350000,
    maVe: 'CH003-TU003-XE004-005',
    maXe: 'XE004',
    tenXe: 'Mini Bus VIP 01',
    bienSo: '29C-22222',
    diemDi: 'Hà Nội',
    diemDen: 'Sapa',
    khoangCach: 320,
  },
  {
    stt: 6,
    maKhach: 'KH006',
    maChuyen: 'CH004',
    phuongThucTT: 'Tiền mặt',
    thoiGianDat: '2025-02-07T07:30:00',
    viTri: 'D1',
    trangThaiTT: 'Đã hủy',
    maGhe: 15,
    maGiuong: null,
    tenKhach: 'Ngô Thị Mai',
    dienThoai: '0956789012',
    thoiGianKhoiHanh: '2025-02-08T08:00:00',
    tenTuyen: 'Hà Nội - Hải Phòng',
    giaVe: 150000,
    maVe: 'CH004-TU004-XE003-006',
    maXe: 'XE003',
    tenXe: 'Xe Bus Ngồi Hà Nội 02',
    bienSo: '29B-11111',
    diemDi: 'Hà Nội',
    diemDen: 'Hải Phòng',
    khoangCach: 120,
  },
];

// Sinh mã vé
export const generateTicketCode = (
  maChuyen: string,
  maTuyen: string,
  maXe: string,
  stt: number,
): string => {
  return `${maChuyen}-${maTuyen}-${maXe}-${String(stt).padStart(3, '0')}`;
};

// Kiểm tra có thể đặt vé không (số ghế còn lại)
export const canBookTicket = (
  _maChuyen: string,
  soGheDaDat: number,
  tongSoGhe: number,
): boolean => {
  return soGheDaDat < tongSoGhe;
};

// Mock khách hàng
export interface Customer {
  maKhach: string;
  tenKhach: string;
  dienThoai: string;
  email?: string;
  diaChi?: string;
}

export const mockCustomers: Customer[] = [
  {
    maKhach: 'KH001',
    tenKhach: 'Nguyễn Minh Anh',
    dienThoai: '0901234567',
    email: 'anh.nm@gmail.com',
  },
  {
    maKhach: 'KH002',
    tenKhach: 'Trần Văn Hùng',
    dienThoai: '0912345678',
    email: 'hung.tv@gmail.com',
  },
  { maKhach: 'KH003', tenKhach: 'Lê Thị Hoa', dienThoai: '0923456789', email: 'hoa.lt@gmail.com' },
  {
    maKhach: 'KH004',
    tenKhach: 'Phạm Văn Nam',
    dienThoai: '0934567890',
    email: 'nam.pv@gmail.com',
  },
  { maKhach: 'KH005', tenKhach: 'Hoàng Văn Tú', dienThoai: '0945678901', email: 'tu.hv@gmail.com' },
  { maKhach: 'KH006', tenKhach: 'Ngô Thị Mai', dienThoai: '0956789012', email: 'mai.nt@gmail.com' },
];
