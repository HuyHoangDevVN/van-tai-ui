/**
 * Paginated Response format từ Backend
 */
export interface PaginationInfo {
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  currentPageSize: number;
  startRecord: number;
  endRecord: number;
}

export interface PaginatedData<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  currentPageSize: number;
  startRecord: number;
  endRecord: number;
}

export interface BasePaginatedResponse<T> {
  success: boolean;
  message: string;
  data: PaginatedData<T>;
  errorCode: number;
  timestamp: string;
}
