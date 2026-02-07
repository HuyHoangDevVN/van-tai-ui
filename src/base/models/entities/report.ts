/**
 * Report (Báo cáo) Types
 */

export interface ChiPhiCoBanReport {
  maChuyen: string;
  tenChuyen: string | null;
  maXe: string | null;
  khoangCach: number | null;
  chiPhiCoBan: number | null;
}

export interface DoanhThuXeBusNgoiReport {
  maXe: string;
  thang: string;
  doanhThuThang: number;
}

export interface GiaVeXeBusNgoiReport {
  stt: number;
  maChuyen: string;
  tenChuyen: string | null;
  viTri: string | null;
  maXe: string | null;
  chiPhiCoBan: number | null;
  khoangCach: number | null;
  giaVe: number | null;
}

export interface DoanhThuTuyenDuongReport {
  maTuyen: string;
  tenTuyen: string | null;
  thang: string;
  doanhThuThang: number;
}

export interface LuongThangTaiXeReport {
  maTaiXe: string;
  tenTaiXe: string | null;
  tongKm: number | null;
  soTuyen: number | null;
  luongThang: number | null;
}

export interface ReportDateRangeParams {
  tuNgay: string;
  denNgay: string;
}
