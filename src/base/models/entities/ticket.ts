/**
 * Ticket (Vé) Entity Types
 */

export interface Ticket {
  stt: number;
  maKhach: string | null;
  maChuyen: string | null;
  phuongThucTT: string | null;
  thoiGianDat: string | null;
  viTri: string | null;
  trangThaiTT: string | null;
  maGhe: number | null;
  maGiuong: number | null;
}

export interface TicketSearchResult extends Ticket {
  tenKhach: string | null;
  dienThoai: string | null;
  thoiGianKhoiHanh: string | null;
  tenTuyen: string | null;
  giaVe: number | null;
}

export interface CreateTicketDto {
  maKhach: string;
  maChuyen: string;
  phuongThucTT: string;
  viTri: string;
  maGhe?: number;
  maGiuong?: number;
}

export interface BookTicketDto {
  maKhach: string;
  maChuyen: string;
  phuongThucTT: string;
  viTri: string;
  maGhe?: number;
  maGiuong?: number;
}

export interface TicketSearchParams {
  keyword?: string;
  maKhach?: string;
  maChuyen?: string;
  trangThaiTT?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}
