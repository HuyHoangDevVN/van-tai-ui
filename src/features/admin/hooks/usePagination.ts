/**
 * Pagination Hooks
 * Quản lý state phân trang và bộ lọc
 */

import { useState, useCallback, useMemo } from 'react';

const DEFAULT_PAGE_SIZE = 20;

interface UsePaginationReturn {
  pageIndex: number;
  pageSize: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  changePageSize: (size: number) => void;
  reset: () => void;
}

/**
 * Hook quản lý state phân trang
 */
export function usePagination(
  initialPage: number = 1,
  initialPageSize: number = DEFAULT_PAGE_SIZE,
): UsePaginationReturn {
  const [pageIndex, setPageIndex] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const goToPage = useCallback((page: number) => {
    setPageIndex(Math.max(1, page));
  }, []);

  const nextPage = useCallback(() => {
    setPageIndex((prev) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPageIndex((prev) => Math.max(1, prev - 1));
  }, []);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(1); // Reset to first page when changing size
  }, []);

  const reset = useCallback(() => {
    setPageIndex(1);
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  return {
    pageIndex,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    reset,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UseSearchFiltersReturn<T extends Record<string, any>> {
  filters: T;
  searchText: string;
  setSearchText: (text: string) => void;
  updateFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  clearFilters: () => void;
  activeFilters: [keyof T, T[keyof T]][];
  hasActiveFilters: boolean;
}

/**
 * Hook quản lý bộ lọc và tìm kiếm
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSearchFilters<T extends Record<string, any>>(
  initialFilters: T,
): UseSearchFiltersReturn<T> {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [searchText, setSearchText] = useState('');

  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchText('');
  }, [initialFilters]);

  const activeFilters = useMemo(() => {
    return Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ) as [keyof T, T[keyof T]][];
  }, [filters]);

  return {
    filters,
    searchText,
    setSearchText,
    updateFilter,
    clearFilters,
    activeFilters,
    hasActiveFilters: activeFilters.length > 0 || searchText !== '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UseTableStateReturn<T extends Record<string, any>>
  extends UsePaginationReturn, Omit<UseSearchFiltersReturn<T>, 'setSearchText' | 'updateFilter'> {
  updateFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  setSearchText: (text: string) => void;
  queryParams: T & { keyword?: string; pageIndex: number; pageSize: number };
}

/**
 * Hook kết hợp phân trang và bộ lọc cho bảng dữ liệu
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTableState<T extends Record<string, any>>(
  initialFilters: T,
): UseTableStateReturn<T> {
  const pagination = usePagination();
  const search = useSearchFilters(initialFilters);

  // Reset pagination khi thay đổi bộ lọc
  const updateFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      search.updateFilter(key, value);
      pagination.goToPage(1);
    },
    [search, pagination],
  );

  const setSearchText = useCallback(
    (text: string) => {
      search.setSearchText(text);
      pagination.goToPage(1);
    },
    [search, pagination],
  );

  // Xây dựng query params cho API
  const queryParams = useMemo(
    () => ({
      keyword: search.searchText || undefined,
      ...search.filters,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    }),
    [search.searchText, search.filters, pagination.pageIndex, pagination.pageSize],
  );

  return {
    ...pagination,
    ...search,
    updateFilter,
    setSearchText,
    queryParams: queryParams as T & { keyword?: string; pageIndex: number; pageSize: number },
  };
}
