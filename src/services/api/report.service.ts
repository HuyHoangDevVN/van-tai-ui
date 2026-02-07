/**
 * Report API Service
 * Quản lý các API liên quan đến Báo cáo thống kê
 */

import HttpService from '@services/api/http.service';
import { BaseResponse } from '@base/models/base';
import {
  ChiPhiCoBanReport,
  DoanhThuXeBusNgoiReport,
  GiaVeXeBusNgoiReport,
  DoanhThuTuyenDuongReport,
  LuongThangTaiXeReport,
  ReportDateRangeParams,
} from '@base/models/entities/report';

const REPORT_BASE_URL = '/baocao';

class ReportService extends HttpService {
  /**
   * Lấy chi phí cơ bản của các chuyến xe
   */
  async getChiPhiCoBan(): Promise<BaseResponse<ChiPhiCoBanReport[]>> {
    return this.get<ChiPhiCoBanReport[]>(`${REPORT_BASE_URL}/chi-phi-co-ban`);
  }

  /**
   * Lấy doanh thu xe bus ngồi theo tháng
   */
  async getDoanhThuXeBusNgoi(
    params: ReportDateRangeParams,
  ): Promise<BaseResponse<DoanhThuXeBusNgoiReport[]>> {
    return this.get<DoanhThuXeBusNgoiReport[]>(`${REPORT_BASE_URL}/doanh-thu-xe-bus-ngoi`, params);
  }

  /**
   * Lấy bảng giá vé xe bus ngồi
   */
  async getGiaVeXeBusNgoi(): Promise<BaseResponse<GiaVeXeBusNgoiReport[]>> {
    return this.get<GiaVeXeBusNgoiReport[]>(`${REPORT_BASE_URL}/gia-ve-xe-bus-ngoi`);
  }

  /**
   * Lấy doanh thu tuyến đường theo tháng
   */
  async getDoanhThuTuyenDuong(
    params: ReportDateRangeParams,
  ): Promise<BaseResponse<DoanhThuTuyenDuongReport[]>> {
    return this.get<DoanhThuTuyenDuongReport[]>(`${REPORT_BASE_URL}/doanh-thu-tuyen-duong`, params);
  }

  /**
   * Lấy lương tháng tài xế
   */
  async getLuongThangTaiXe(
    params: ReportDateRangeParams,
  ): Promise<BaseResponse<LuongThangTaiXeReport[]>> {
    return this.get<LuongThangTaiXeReport[]>(`${REPORT_BASE_URL}/luong-thang-tai-xe`, params);
  }
}

const reportService = new ReportService();
export default reportService;
