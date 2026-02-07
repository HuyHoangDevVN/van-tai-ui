/**
 * Vehicle API Service
 * Quản lý các API liên quan đến Xe
 */

import HttpService from '@services/api/http.service';
import { BaseResponse } from '@base/models/base';
import { BasePaginatedResponse } from '@base/models/basePaginated';
import {
  Vehicle,
  VehicleSearchResult,
  VehicleSearchParams,
  CreateVehicleDto,
  UpdateVehicleDto,
} from '@base/models/entities/vehicle';

const VEHICLE_BASE_URL = '/xe';

class VehicleService extends HttpService {
  /**
   * Tìm kiếm xe với phân trang và bộ lọc
   */
  async search(
    params: VehicleSearchParams = {},
  ): Promise<BasePaginatedResponse<VehicleSearchResult>> {
    return this.getPaginated<VehicleSearchResult>(`${VEHICLE_BASE_URL}/tim-kiem`, params);
  }

  /**
   * Lấy tất cả xe (không phân trang)
   */
  async getAll(): Promise<BaseResponse<Vehicle[]>> {
    return this.get<Vehicle[]>(VEHICLE_BASE_URL);
  }

  /**
   * Lấy xe theo mã
   */
  async getById(maXe: string): Promise<BaseResponse<Vehicle>> {
    return this.get<Vehicle>(`${VEHICLE_BASE_URL}/${maXe}`);
  }

  /**
   * Thêm xe mới
   */
  async create(data: CreateVehicleDto): Promise<BaseResponse<void>> {
    return this.post<void>(VEHICLE_BASE_URL, data);
  }

  /**
   * Cập nhật xe
   */
  async update(maXe: string, data: UpdateVehicleDto): Promise<BaseResponse<void>> {
    return this.put<void>(`${VEHICLE_BASE_URL}/${maXe}`, data);
  }

  /**
   * Xóa xe
   */
  async remove(maXe: string): Promise<BaseResponse<void>> {
    return this.delete<BaseResponse<void>>(`${VEHICLE_BASE_URL}/${maXe}`);
  }
}

const vehicleService = new VehicleService();
export default vehicleService;
