/**
 * Driver (Tài xế) Entity Types
 */

export interface Driver {
  maTaiXe: string;
  tenTaiXe: string | null;
  ngaySinh: string | null;
  gioiTinh: string | null;
  queQuan: string | null;
  tonGiao: string | null;
  soCccd: string | null;
  ngayKyHopDong: string | null;
  tuoi: number | null;
  heSoLuong: number | null;
}

export interface DriverSearchResult extends Driver {
  tongSoChuyen: number | null;
  totalAssignments: number | null;
  currentVehicle: string | null;
}

export interface CreateDriverDto {
  maTaiXe: string;
  tenTaiXe?: string;
  ngaySinh?: string;
  gioiTinh?: string;
  queQuan?: string;
  tonGiao?: string;
  soCccd?: string;
  ngayKyHopDong?: string;
  tuoi?: number;
  heSoLuong?: number;
}

export interface UpdateDriverDto extends Partial<Omit<CreateDriverDto, 'maTaiXe'>> {}

export interface DriverSearchParams {
  keyword?: string;
  gioiTinh?: string;
  queQuan?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}
