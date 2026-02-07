/**
 * Customer API Service
 * Quản lý các API liên quan đến Khách hàng
 */

import HttpService from '@services/api/http.service';
import { BaseResponse } from '@base/models/base';
import { BasePaginatedResponse } from '@base/models/basePaginated';
import {
  Customer,
  CustomerSearchResult,
  CustomerSearchParams,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '@base/models/entities/customer';

const CUSTOMER_BASE_URL = '/khach-hang';

class CustomerService extends HttpService {
  /**
   * Tìm kiếm khách hàng với phân trang
   */
  async search(
    params: CustomerSearchParams = {},
  ): Promise<BasePaginatedResponse<CustomerSearchResult>> {
    return this.getPaginated<CustomerSearchResult>(`${CUSTOMER_BASE_URL}/tim-kiem`, params);
  }

  /**
   * Lấy tất cả khách hàng
   */
  async getAll(): Promise<BaseResponse<Customer[]>> {
    return this.get<Customer[]>(CUSTOMER_BASE_URL);
  }

  /**
   * Lấy khách hàng theo mã
   */
  async getById(maKhach: string): Promise<BaseResponse<Customer>> {
    return this.get<Customer>(`${CUSTOMER_BASE_URL}/${maKhach}`);
  }

  /**
   * Thêm khách hàng mới
   */
  async create(data: CreateCustomerDto): Promise<BaseResponse<void>> {
    return this.post<void>(CUSTOMER_BASE_URL, data);
  }

  /**
   * Cập nhật khách hàng
   */
  async update(maKhach: string, data: UpdateCustomerDto): Promise<BaseResponse<void>> {
    return this.put<void>(`${CUSTOMER_BASE_URL}/${maKhach}`, data);
  }

  /**
   * Xóa khách hàng
   */
  async remove(maKhach: string): Promise<BaseResponse<void>> {
    return this.delete<BaseResponse<void>>(`${CUSTOMER_BASE_URL}/${maKhach}`);
  }
}

const customerService = new CustomerService();
export default customerService;
