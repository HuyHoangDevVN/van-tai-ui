/**
 * Format Utilities
 * Các hàm tiện ích định dạng dữ liệu
 */

import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Định dạng ngày theo format tiếng Việt
 * @param date - Ngày cần định dạng (string ISO hoặc Date)
 * @param formatStr - Chuỗi định dạng (mặc định: dd/MM/yyyy)
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = 'dd/MM/yyyy',
): string {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: vi });
  } catch {
    return '-';
  }
}

/**
 * Định dạng ngày giờ
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Định dạng tiền tệ VND
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Định dạng số với dấu phân cách hàng nghìn
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Cắt ngắn chuỗi với dấu ...
 */
export function truncate(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Lấy chữ cái đầu từ tên
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Định dạng khoảng cách km
 */
export function formatDistance(km: number | null | undefined): string {
  if (km === null || km === undefined) return '-';
  return `${formatNumber(km)} km`;
}

/**
 * Định dạng phần trăm
 */
export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
}
