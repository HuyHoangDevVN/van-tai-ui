/**
 * Maintenance API Service
 * Quản lý các API liên quan đến Bảo trì xe
 */

import HttpService from '@services/api/http.service';
import { BaseResponse } from '@base/models/base';
import {
  Maintenance,
  MaintenanceStatus,
  CreateMaintenanceDto,
} from '@base/models/entities/maintenance';

const MAINTENANCE_BASE_URL = '/bao-tri';

class MaintenanceService extends HttpService {
  /**
   * Lấy trạng thái bảo trì của tất cả xe
   */
  async getStatus(): Promise<BaseResponse<MaintenanceStatus[]>> {
    return this.get<MaintenanceStatus[]>(`${MAINTENANCE_BASE_URL}/trang-thai`);
  }

  /**
   * Thêm lịch bảo trì mới
   * Side effects: Reset km vận hành, cập nhật ngày bảo trì cuối
   */
  async create(data: CreateMaintenanceDto): Promise<BaseResponse<void>> {
    return this.post<void>(MAINTENANCE_BASE_URL, data);
  }

  /**
   * Lấy lịch sử bảo trì của xe
   */
  async getHistory(maXe: string): Promise<BaseResponse<Maintenance[]>> {
    return this.get<Maintenance[]>(`${MAINTENANCE_BASE_URL}/lich-su/${maXe}`);
  }
}

const maintenanceService = new MaintenanceService();
export default maintenanceService;
