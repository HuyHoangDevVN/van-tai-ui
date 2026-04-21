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
  ngayBaoTriTiepTheo?: string | null;
  ngayDangKiem?: string | null;
  soNgayTuBaoTri: number | null;
  soNgayConLai?: number | null;
  soNgayDenDangKiem?: number | null;
  trangThaiBaoTri: string | null;
  trangThaiDangKiem?: string | null;
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

export interface MaintenanceAlert {
  id: number;
  maXe: string;
  tenXe: string | null;
  bienSo: string | null;
  alertType: string;
  status: string;
  severity: string;
  title: string;
  messageSnapshot: string;
  dueDate: string | null;
  triggeredAt: string;
  lastSeenAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface MaintenanceAlertQuery {
  status?: string;
  severity?: string;
  maXe?: string;
}

export interface MaintenanceAlertScanResult {
  totalEvaluated: number;
  activeAlerts: number;
  resolvedAlerts: number;
}
