/**
 * Customer (Khách hàng) Entity Types
 */

export interface Customer {
  maKhach: string;
  ten: string | null;
  ngaySinh: string | null;
  dienThoai: string | null;
  email: string | null;
  soCccd: string | null;
  maGiamHo: string | null;
}

export interface CustomerSearchResult extends Customer {
  totalTickets: number | null;
  totalSpending: number | null;
  lastBookingDate: string | null;
  guardianName: string | null;
}

export interface CreateCustomerDto {
  maKhach: string;
  ten?: string;
  ngaySinh?: string;
  dienThoai?: string;
  email?: string;
  soCccd?: string;
  maGiamHo?: string;
}

export interface UpdateCustomerDto extends Partial<Omit<CreateCustomerDto, 'maKhach'>> {}

export interface CustomerSearchParams {
  keyword?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}
