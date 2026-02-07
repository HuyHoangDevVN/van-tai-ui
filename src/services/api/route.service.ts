/**
 * Route API Service
 * Quản lý các API liên quan đến Tuyến đường
 */

import HttpService from '@services/api/http.service';
import { BaseResponse } from '@base/models/base';
import { BasePaginatedResponse } from '@base/models/basePaginated';
import {
  Route,
  RouteSearchResult,
  RouteSearchParams,
  CreateRouteDto,
  UpdateRouteDto,
} from '@base/models/entities/route';

const ROUTE_BASE_URL = '/tuyen-duong';

class RouteService extends HttpService {
  /**
   * Tìm kiếm tuyến đường với phân trang
   */
  async search(params: RouteSearchParams = {}): Promise<BasePaginatedResponse<RouteSearchResult>> {
    return this.getPaginated<RouteSearchResult>(`${ROUTE_BASE_URL}/tim-kiem`, params);
  }

  /**
   * Lấy tất cả tuyến đường
   */
  async getAll(): Promise<BaseResponse<Route[]>> {
    return this.get<Route[]>(ROUTE_BASE_URL);
  }

  /**
   * Lấy tuyến đường theo mã
   */
  async getById(maTuyen: string): Promise<BaseResponse<Route>> {
    return this.get<Route>(`${ROUTE_BASE_URL}/${maTuyen}`);
  }

  /**
   * Thêm tuyến đường mới
   */
  async create(data: CreateRouteDto): Promise<BaseResponse<void>> {
    return this.post<void>(ROUTE_BASE_URL, data);
  }

  /**
   * Cập nhật tuyến đường
   */
  async update(maTuyen: string, data: UpdateRouteDto): Promise<BaseResponse<void>> {
    return this.put<void>(`${ROUTE_BASE_URL}/${maTuyen}`, data);
  }

  /**
   * Xóa tuyến đường
   */
  async remove(maTuyen: string): Promise<BaseResponse<void>> {
    return this.delete<BaseResponse<void>>(`${ROUTE_BASE_URL}/${maTuyen}`);
  }
}

const routeService = new RouteService();
export default routeService;
