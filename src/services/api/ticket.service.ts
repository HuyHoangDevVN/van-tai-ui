/**
 * Ticket API Service
 * Quản lý các API liên quan đến Vé
 */

import HttpService from '@services/api/http.service';
import { BaseResponse } from '@base/models/base';
import { BasePaginatedResponse } from '@base/models/basePaginated';
import {
  Ticket,
  TicketSearchResult,
  TicketSearchParams,
  CreateTicketDto,
  BookTicketDto,
} from '@base/models/entities/ticket';

const TICKET_BASE_URL = '/ve';

class TicketService extends HttpService {
  /**
   * Tìm kiếm vé với phân trang và bộ lọc
   */
  async search(
    params: TicketSearchParams = {},
  ): Promise<BasePaginatedResponse<TicketSearchResult>> {
    return this.getPaginated<TicketSearchResult>(`${TICKET_BASE_URL}/tim-kiem`, params);
  }

  /**
   * Lấy tất cả vé (không phân trang)
   */
  async getAll(): Promise<BaseResponse<Ticket[]>> {
    return this.get<Ticket[]>(TICKET_BASE_URL);
  }

  /**
   * Lấy vé theo STT
   */
  async getById(stt: number): Promise<BaseResponse<Ticket>> {
    return this.get<Ticket>(`${TICKET_BASE_URL}/${stt}`);
  }

  /**
   * Tạo vé mới
   */
  async create(data: CreateTicketDto): Promise<BaseResponse<void>> {
    return this.post<void>(TICKET_BASE_URL, data);
  }

  /**
   * Đặt vé
   */
  async book(data: BookTicketDto): Promise<BaseResponse<number>> {
    return this.post<number>(`${TICKET_BASE_URL}/dat-ve`, data);
  }

  /**
   * Hủy vé
   */
  async cancel(stt: number): Promise<BaseResponse<void>> {
    return this.put<void>(`${TICKET_BASE_URL}/${stt}/huy`);
  }

  /**
   * Lấy vé theo chuyến xe
   */
  async getByTrip(maChuyen: string): Promise<BaseResponse<TicketSearchResult[]>> {
    return this.get<TicketSearchResult[]>(`${TICKET_BASE_URL}/theo-chuyen/${maChuyen}`);
  }

  /**
   * Xóa vé
   */
  async remove(stt: number): Promise<BaseResponse<void>> {
    return this.delete<BaseResponse<void>>(`${TICKET_BASE_URL}/${stt}`);
  }
}

const ticketService = new TicketService();
export default ticketService;
