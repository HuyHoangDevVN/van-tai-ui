/**
 * Trip API Service
 * Quản lý các API liên quan đến Chuyến xe
 */

import HttpService from '@services/api/http.service';
import { BaseResponse } from '@base/models/base';
import { BasePaginatedResponse } from '@base/models/basePaginated';
import {
  Trip,
  TripSearchResult,
  TripSearchParams,
  CreateTripDto,
  UpdateTripDto,
} from '@base/models/entities/trip';

const TRIP_BASE_URL = '/chuyen-xe';

class TripService extends HttpService {
  /**
   * Tìm kiếm chuyến xe với phân trang và bộ lọc
   */
  async search(params: TripSearchParams = {}): Promise<BasePaginatedResponse<TripSearchResult>> {
    return this.getPaginated<TripSearchResult>(`${TRIP_BASE_URL}/tim-kiem`, params);
  }

  /**
   * Lấy tất cả chuyến xe (không phân trang)
   */
  async getAll(): Promise<BaseResponse<Trip[]>> {
    return this.get<Trip[]>(TRIP_BASE_URL);
  }

  /**
   * Lấy chuyến xe theo mã
   */
  async getById(maChuyen: string): Promise<BaseResponse<Trip>> {
    return this.get<Trip>(`${TRIP_BASE_URL}/${maChuyen}`);
  }

  /**
   * Thêm chuyến xe mới
   */
  async create(data: CreateTripDto): Promise<BaseResponse<void>> {
    return this.post<void>(TRIP_BASE_URL, data);
  }

  /**
   * Cập nhật chuyến xe
   */
  async update(maChuyen: string, data: UpdateTripDto): Promise<BaseResponse<void>> {
    return this.put<void>(`${TRIP_BASE_URL}/${maChuyen}`, data);
  }

  /**
   * Xóa chuyến xe
   */
  async remove(maChuyen: string): Promise<BaseResponse<void>> {
    return this.delete<BaseResponse<void>>(`${TRIP_BASE_URL}/${maChuyen}`);
  }

  /**
   * Hoàn thành chuyến xe
   * IMPORTANT: Kích hoạt cập nhật dữ liệu bảo trì
   */
  async complete(maChuyen: string): Promise<BaseResponse<void>> {
    return this.put<void>(`${TRIP_BASE_URL}/${maChuyen}/hoan-thanh`);
  }

  /**
   * Hủy chuyến xe
   */
  async cancel(maChuyen: string): Promise<BaseResponse<void>> {
    return this.put<void>(`${TRIP_BASE_URL}/${maChuyen}/huy`);
  }
}

const tripService = new TripService();
export default tripService;
