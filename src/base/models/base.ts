/**
 * Standard API Response format từ Backend
 */
export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode: number;
  timestamp: string;
}
