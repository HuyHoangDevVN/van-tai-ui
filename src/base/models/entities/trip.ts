/**
 * Trip (Chuyến xe) Entity Types
 */

export interface Trip {
  maChuyen: string;
  tenChuyen: string | null;
  thoiGianKhoiHanh: string | null;
  thoiGianDen: string | null;
  maXe: string | null;
  maTuyen: string | null;
  trangThai: string | null;
}

export interface TripSearchResult extends Trip {
  tenXe: string | null;
  bienSo: string | null;
  tenTuyen: string | null;
  soVeDaBan: number | null;
  tongCho: number | null;
}

export interface CreateTripDto {
  maChuyen: string;
  tenChuyen?: string;
  thoiGianKhoiHanh?: string;
  thoiGianDen?: string;
  maXe?: string;
  maTuyen?: string;
}

export interface UpdateTripDto extends Partial<Omit<CreateTripDto, 'maChuyen'>> {}

export interface TripSearchParams {
  keyword?: string;
  maTuyen?: string;
  maXe?: string;
  fromDate?: string;
  toDate?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}
