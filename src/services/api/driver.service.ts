/**
 * Driver API Service
 * Quản lý các API liên quan đến Tài xế
 */

import HttpService from '@services/api/http.service';
import { BaseResponse } from '@base/models/base';
import { BasePaginatedResponse } from '@base/models/basePaginated';
import {
  Driver,
  DriverSearchResult,
  DriverSearchParams,
  CreateDriverDto,
  UpdateDriverDto,
} from '@base/models/entities/driver';

const DRIVER_BASE_URL = '/tai-xe';

class DriverService extends HttpService {
  /**
   * Tìm kiếm tài xế với phân trang và bộ lọc
   */
  async search(
    params: DriverSearchParams = {},
  ): Promise<BasePaginatedResponse<DriverSearchResult>> {
    return this.getPaginated<DriverSearchResult>(`${DRIVER_BASE_URL}/tim-kiem`, params);
  }

  /**
   * Lấy tất cả tài xế (không phân trang)
   */
  async getAll(): Promise<BaseResponse<Driver[]>> {
    return this.get<Driver[]>(DRIVER_BASE_URL);
  }

  /**
   * Lấy tài xế theo mã
   */
  async getById(maTaiXe: string): Promise<BaseResponse<Driver>> {
    return this.get<Driver>(`${DRIVER_BASE_URL}/${maTaiXe}`);
  }

  /**
   * Thêm tài xế mới
   */
  async create(data: CreateDriverDto): Promise<BaseResponse<void>> {
    return this.post<void>(DRIVER_BASE_URL, data);
  }

  /**
   * Cập nhật tài xế
   */
  async update(maTaiXe: string, data: UpdateDriverDto): Promise<BaseResponse<void>> {
    return this.put<void>(`${DRIVER_BASE_URL}/${maTaiXe}`, data);
  }

  /**
   * Xóa tài xế
   */
  async remove(maTaiXe: string): Promise<BaseResponse<void>> {
    return this.delete<BaseResponse<void>>(`${DRIVER_BASE_URL}/${maTaiXe}`);
  }
}

const driverService = new DriverService();
export default driverService;
