/**
 * Maintenance (Bảo trì) Entity Types
 */

export interface Maintenance {
  maBaoTri: string;
  maXe: string;
  donVi: string | null;
  chiPhi: number | null;
  ngay: string | null;
  soKm: number | null;
}

export interface MaintenanceStatus {
  maXe: string;
  tenXe: string | null;
  bienSo: string | null;
  trangThai: string | null;
  tongKmVanHanh: number | null;
  ngayBaoTriCuoi: string | null;
  soNgayTuBaoTri: number | null;
  trangThaiBaoTri: string | null;
  canBaoTri: boolean;
}

export interface CreateMaintenanceDto {
  maBaoTri: string;
  maXe: string;
  donVi?: string;
  chiPhi?: number;
  ngay?: string;
  soKm?: number;
}
