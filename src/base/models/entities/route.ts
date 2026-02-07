/**
 * Route (Tuyến đường) Entity Types
 */

export interface Route {
  maTuyen: string;
  tenTuyen: string | null;
  diemDi: string | null;
  diemDen: string | null;
  khoangCach: number | null;
  maDoPhucTap: string | null;
}

export interface RouteSearchResult extends Route {
  tenDoPhucTap: string | null;
  totalTrips: number | null;
  totalRevenue: number | null;
}

export interface CreateRouteDto {
  maTuyen: string;
  tenTuyen?: string;
  diemDi?: string;
  diemDen?: string;
  khoangCach?: number;
  maDoPhucTap?: string;
}

export interface UpdateRouteDto extends Partial<Omit<CreateRouteDto, 'maTuyen'>> {}

export interface RouteSearchParams {
  keyword?: string;
  diemDi?: string;
  diemDen?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}
