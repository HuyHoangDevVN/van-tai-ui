/**
 * Vehicle (Xe) Entity Types
 */

export interface Vehicle {
  maXe: string;
  tenXe: string | null;
  bienSo: string | null;
  hangSanXuat: string | null;
  namSanXuat: number | null;
  ngayDangKiem: string | null;
  trangThai: string | null;
  tongKmVanHanh: number | null;
  ngayBaoTriCuoi: string | null;
  mucTieuHao: number | null;
  phuThuPhiVanHanh: number | null;
}

export interface VehicleSearchResult extends Vehicle {
  soChoNgoi: number | null;
  totalTrips: number | null;
  driverName: string | null;
}

export interface CreateVehicleDto {
  maXe: string;
  tenXe?: string;
  bienSo?: string;
  hangSanXuat?: string;
  namSanXuat?: number;
  ngayDangKiem?: string;
  trangThai?: string;
  mucTieuHao?: number;
  phuThuPhiVanHanh?: number;
}

export interface UpdateVehicleDto extends Partial<Omit<CreateVehicleDto, 'maXe'>> {}

export interface VehicleSearchParams {
  keyword?: string;
  status?: string;
  hangSanXuat?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}
