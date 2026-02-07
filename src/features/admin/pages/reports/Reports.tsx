/**
 * Reports Page
 * Trang báo cáo thống kê
 */

import { useState } from 'react';
import { Card, Tabs, Table, Typography, Spin, Empty, DatePicker, Button, Space } from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  BarChartOutlined,
  TeamOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  useChiPhiCoBan,
  useGiaVeXeBusNgoi,
  useDoanhThuXeBusNgoi,
  useLuongThangTaiXe,
} from '@features/admin/hooks/useReports';
import { formatCurrency, formatNumber } from '@utils/format';
import type {
  ChiPhiCoBanReport,
  GiaVeXeBusNgoiReport,
  DoanhThuXeBusNgoiReport,
  LuongThangTaiXeReport,
} from '@base/models/entities/report';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chi-phi');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Chi phí cơ bản
  const { data: chiPhiData, isLoading: loadingChiPhi } = useChiPhiCoBan();

  // Giá vé
  const { data: giaVeData, isLoading: loadingGiaVe } = useGiaVeXeBusNgoi();

  // Doanh thu xe
  const doanhThuParams = {
    tuNgay: dateRange?.[0]?.format('YYYY-MM-DD') || '',
    denNgay: dateRange?.[1]?.format('YYYY-MM-DD') || '',
  };
  const { data: doanhThuData, isLoading: loadingDoanhThu } = useDoanhThuXeBusNgoi(
    doanhThuParams,
    activeTab === 'doanh-thu' && !!dateRange,
  );

  // Lương tài xế
  const { data: luongData, isLoading: loadingLuong } = useLuongThangTaiXe(
    doanhThuParams,
    activeTab === 'luong' && !!dateRange,
  );

  const chiPhiColumns: ColumnsType<ChiPhiCoBanReport> = [
    { title: 'Mã chuyến', dataIndex: 'maChuyen', key: 'maChuyen', width: 110 },
    { title: 'Tên chuyến', dataIndex: 'tenChuyen', key: 'tenChuyen' },
    { title: 'Mã xe', dataIndex: 'maXe', key: 'maXe', width: 100 },
    {
      title: 'Khoảng cách (km)',
      dataIndex: 'khoangCach',
      key: 'khoangCach',
      width: 140,
      align: 'right',
      render: (text) => formatNumber(text),
    },
    {
      title: 'Chi phí cơ bản',
      dataIndex: 'chiPhiCoBan',
      key: 'chiPhiCoBan',
      width: 150,
      align: 'right',
      render: (text) => (
        <Text strong style={{ color: '#1677ff' }}>
          {formatCurrency(text)}
        </Text>
      ),
    },
  ];

  const giaVeColumns: ColumnsType<GiaVeXeBusNgoiReport> = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 70 },
    { title: 'Mã chuyến', dataIndex: 'maChuyen', key: 'maChuyen', width: 110 },
    { title: 'Tên chuyến', dataIndex: 'tenChuyen', key: 'tenChuyen' },
    { title: 'Vị trí', dataIndex: 'viTri', key: 'viTri', width: 100 },
    {
      title: 'Khoảng cách',
      dataIndex: 'khoangCach',
      key: 'khoangCach',
      width: 120,
      align: 'right',
      render: (text) => `${formatNumber(text)} km`,
    },
    {
      title: 'Giá vé',
      dataIndex: 'giaVe',
      key: 'giaVe',
      width: 140,
      align: 'right',
      render: (text) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(text)}
        </Text>
      ),
    },
  ];

  const doanhThuColumns: ColumnsType<DoanhThuXeBusNgoiReport> = [
    { title: 'Mã xe', dataIndex: 'maXe', key: 'maXe', width: 100 },
    { title: 'Tháng', dataIndex: 'thang', key: 'thang', width: 120 },
    {
      title: 'Doanh thu tháng',
      dataIndex: 'doanhThuThang',
      key: 'doanhThuThang',
      align: 'right',
      render: (text) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(text)}
        </Text>
      ),
    },
  ];

  const luongColumns: ColumnsType<LuongThangTaiXeReport> = [
    { title: 'Mã tài xế', dataIndex: 'maTaiXe', key: 'maTaiXe', width: 110 },
    { title: 'Tên tài xế', dataIndex: 'tenTaiXe', key: 'tenTaiXe' },
    {
      title: 'Tổng KM',
      dataIndex: 'tongKm',
      key: 'tongKm',
      width: 120,
      align: 'right',
      render: (text) => formatNumber(text),
    },
    {
      title: 'Số tuyến',
      dataIndex: 'soTuyen',
      key: 'soTuyen',
      width: 100,
      align: 'center',
    },
    {
      title: 'Lương tháng',
      dataIndex: 'luongThang',
      key: 'luongThang',
      width: 150,
      align: 'right',
      render: (text) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(text)}
        </Text>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'chi-phi',
      label: (
        <span>
          <FileTextOutlined /> Chi phí cơ bản
        </span>
      ),
      children: (
        <div>
          <Title level={4}>Chi phí cơ bản các chuyến xe</Title>
          {loadingChiPhi ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : (
            <Table<ChiPhiCoBanReport>
              columns={chiPhiColumns}
              dataSource={chiPhiData || []}
              rowKey="maChuyen"
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'gia-ve',
      label: (
        <span>
          <DollarOutlined /> Giá vé
        </span>
      ),
      children: (
        <div>
          <Title level={4}>Bảng giá vé xe bus ngồi</Title>
          {loadingGiaVe ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : (
            <Table<GiaVeXeBusNgoiReport>
              columns={giaVeColumns}
              dataSource={giaVeData || []}
              rowKey="stt"
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'doanh-thu',
      label: (
        <span>
          <BarChartOutlined /> Doanh thu
        </span>
      ),
      children: (
        <div>
          <Title level={4}>Doanh thu xe bus ngồi theo tháng</Title>
          <Space style={{ marginBottom: 16 }}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Space>
          {!dateRange ? (
            <Empty description="Chọn khoảng thời gian để xem báo cáo" />
          ) : loadingDoanhThu ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : (
            <Table<DoanhThuXeBusNgoiReport>
              columns={doanhThuColumns}
              dataSource={doanhThuData || []}
              rowKey={(record) => `${record.maXe}-${record.thang}`}
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'luong',
      label: (
        <span>
          <TeamOutlined /> Lương tài xế
        </span>
      ),
      children: (
        <div>
          <Title level={4}>Bảng lương tháng tài xế</Title>
          <Space style={{ marginBottom: 16 }}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Space>
          {!dateRange ? (
            <Empty description="Chọn tháng để xem bảng lương" />
          ) : loadingLuong ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : (
            <Table<LuongThangTaiXeReport>
              columns={luongColumns}
              dataSource={luongData || []}
              rowKey="maTaiXe"
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Báo cáo
        </Title>
        <Text type="secondary">Xem các báo cáo thống kê hệ thống</Text>
      </div>

      {/* Report Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default Reports;
