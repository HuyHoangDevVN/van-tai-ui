import { useMemo, useState } from 'react';
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Empty,
  Row,
  Segmented,
  Space,
  Spin,
  Statistic,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import {
  useDoanhThuTuyenDuong,
  useDoanhThuXeBusNgoi,
  useLuongThangTaiXe,
} from '@features/admin/hooks/useReports';
import type {
  DoanhThuTuyenDuongReport,
  DoanhThuXeBusNgoiReport,
  LuongThangTaiXeReport,
  ReportDateRangeParams,
} from '@base/models/entities/report';
import { formatCurrency, formatDate, formatNumber } from '@utils/format';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ReportTab = 'driver-salary' | 'vehicle-revenue' | 'route-revenue';

const defaultRange: [Dayjs, Dayjs] = [dayjs().startOf('month'), dayjs().endOf('month')];

const driverColumns: ColumnsType<LuongThangTaiXeReport> = [
  { title: 'Mã tài xế', dataIndex: 'maTaiXe', key: 'maTaiXe', width: 120 },
  { title: 'Tên tài xế', dataIndex: 'tenTaiXe', key: 'tenTaiXe' },
  {
    title: 'Tổng km',
    dataIndex: 'tongKm',
    key: 'tongKm',
    align: 'right',
    render: (value) => formatNumber(value),
  },
  {
    title: 'Số tuyến',
    dataIndex: 'soTuyen',
    key: 'soTuyen',
    align: 'center',
    render: (value) => formatNumber(value),
  },
  {
    title: 'Lương tháng',
    dataIndex: 'luongThang',
    key: 'luongThang',
    align: 'right',
    render: (value) => formatCurrency(value ?? 0),
  },
];

const vehicleColumns: ColumnsType<DoanhThuXeBusNgoiReport> = [
  { title: 'Mã xe', dataIndex: 'maXe', key: 'maXe', width: 120 },
  { title: 'Tháng', dataIndex: 'thang', key: 'thang', width: 140 },
  {
    title: 'Doanh thu',
    dataIndex: 'doanhThuThang',
    key: 'doanhThuThang',
    align: 'right',
    render: (value) => formatCurrency(value ?? 0),
  },
];

const routeColumns: ColumnsType<DoanhThuTuyenDuongReport> = [
  { title: 'Mã tuyến', dataIndex: 'maTuyen', key: 'maTuyen', width: 120 },
  { title: 'Tên tuyến', dataIndex: 'tenTuyen', key: 'tenTuyen' },
  { title: 'Tháng', dataIndex: 'thang', key: 'thang', width: 140 },
  {
    title: 'Doanh thu',
    dataIndex: 'doanhThuThang',
    key: 'doanhThuThang',
    align: 'right',
    render: (value) => formatCurrency(value ?? 0),
  },
];

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('driver-salary');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(defaultRange);

  const params: ReportDateRangeParams = useMemo(
    () => ({
      tuNgay: dateRange?.[0]?.format('YYYY-MM-DD') ?? '',
      denNgay: dateRange?.[1]?.format('YYYY-MM-DD') ?? '',
    }),
    [dateRange],
  );

  const {
    data: driverSalaryData = [],
    isLoading: isDriverSalaryLoading,
    error: driverSalaryError,
  } = useLuongThangTaiXe(params, activeTab === 'driver-salary');
  const {
    data: vehicleRevenueData = [],
    isLoading: isVehicleRevenueLoading,
    error: vehicleRevenueError,
  } = useDoanhThuXeBusNgoi(params, activeTab === 'vehicle-revenue');
  const {
    data: routeRevenueData = [],
    isLoading: isRouteRevenueLoading,
    error: routeRevenueError,
  } = useDoanhThuTuyenDuong(params, activeTab === 'route-revenue');

  const currentConfig = useMemo(() => {
    if (activeTab === 'driver-salary') {
      const totalSalary = driverSalaryData.reduce((sum, item) => sum + (item.luongThang ?? 0), 0);
      const totalKm = driverSalaryData.reduce((sum, item) => sum + (item.tongKm ?? 0), 0);

      return {
        title: 'Báo cáo lương lái xe',
        subtitle: 'Theo dõi lương, tổng km và số tuyến của đội tài xế theo kỳ.',
        loading: isDriverSalaryLoading,
        error: driverSalaryError,
        data: driverSalaryData,
        columns: driverColumns,
        summary: [
          { title: 'Tổng tài xế', value: driverSalaryData.length, formatter: formatNumber },
          { title: 'Tổng km', value: totalKm, formatter: (value: number) => `${formatNumber(value)} km` },
          { title: 'Tổng lương', value: totalSalary, formatter: formatCurrency },
        ],
      };
    }

    if (activeTab === 'vehicle-revenue') {
      const totalRevenue = vehicleRevenueData.reduce((sum, item) => sum + (item.doanhThuThang ?? 0), 0);

      return {
        title: 'Báo cáo doanh thu xe',
        subtitle: 'Tổng hợp doanh thu theo từng xe trong khoảng thời gian đã chọn.',
        loading: isVehicleRevenueLoading,
        error: vehicleRevenueError,
        data: vehicleRevenueData,
        columns: vehicleColumns,
        summary: [
          { title: 'Bản ghi', value: vehicleRevenueData.length, formatter: formatNumber },
          { title: 'Tổng doanh thu', value: totalRevenue, formatter: formatCurrency },
          {
            title: 'Xe có doanh thu',
            value: new Set(vehicleRevenueData.map((item) => item.maXe)).size,
            formatter: formatNumber,
          },
        ],
      };
    }

    const totalRevenue = routeRevenueData.reduce((sum, item) => sum + (item.doanhThuThang ?? 0), 0);

    return {
      title: 'Báo cáo doanh thu tuyến',
      subtitle: 'Tổng hợp doanh thu theo tuyến trong kỳ vận hành.',
      loading: isRouteRevenueLoading,
      error: routeRevenueError,
      data: routeRevenueData,
      columns: routeColumns,
      summary: [
        { title: 'Bản ghi', value: routeRevenueData.length, formatter: formatNumber },
        { title: 'Tổng doanh thu', value: totalRevenue, formatter: formatCurrency },
        {
          title: 'Tuyến phát sinh',
          value: new Set(routeRevenueData.map((item) => item.maTuyen)).size,
          formatter: formatNumber,
        },
      ],
    };
  }, [
    activeTab,
    driverSalaryData,
    driverSalaryError,
    isDriverSalaryLoading,
    isRouteRevenueLoading,
    isVehicleRevenueLoading,
    routeRevenueData,
    routeRevenueError,
    vehicleRevenueData,
    vehicleRevenueError,
  ]);

  const hasDateRange = Boolean(dateRange?.[0] && dateRange?.[1]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Reports
        </Title>
        <Text type="secondary">
          Báo cáo vận hành production-lite cho khu vực quản trị nội bộ.
        </Text>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Segmented<ReportTab>
            block
            value={activeTab}
            onChange={(value) => setActiveTab(value)}
            options={[
              { label: 'Lương lái xe', value: 'driver-salary' },
              { label: 'Doanh thu xe', value: 'vehicle-revenue' },
              { label: 'Doanh thu tuyến', value: 'route-revenue' },
            ]}
          />
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={(value) => setDateRange(value as [Dayjs, Dayjs] | null)}
              format="DD/MM/YYYY"
              allowClear={false}
            />
            <Text type="secondary">
              Kỳ báo cáo: {formatDate(params.tuNgay)} - {formatDate(params.denNgay)}
            </Text>
          </Space>
        </Space>
      </Card>

      <Card>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              {currentConfig.title}
            </Title>
            <Text type="secondary">{currentConfig.subtitle}</Text>
          </div>

          <Row gutter={16}>
            {currentConfig.summary.map((item) => (
              <Col xs={24} md={8} key={item.title}>
                <Card size="small">
                  <Statistic title={item.title} value={item.formatter(item.value)} />
                </Card>
              </Col>
            ))}
          </Row>

          {!hasDateRange ? (
            <Empty description="Chọn khoảng thời gian để xem báo cáo." />
          ) : currentConfig.error ? (
            <Alert
              type="error"
              showIcon
              message="Không tải được dữ liệu báo cáo"
              description={(currentConfig.error as Error).message}
            />
          ) : currentConfig.loading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Spin size="large" />
            </div>
          ) : currentConfig.data.length === 0 ? (
            <Empty description="Không có dữ liệu trong khoảng thời gian đã chọn." />
          ) : activeTab === 'driver-salary' ? (
            <Table<LuongThangTaiXeReport>
              columns={driverColumns}
              dataSource={driverSalaryData}
              rowKey="maTaiXe"
              pagination={{ pageSize: 10, showSizeChanger: false }}
              scroll={{ x: 960 }}
            />
          ) : activeTab === 'vehicle-revenue' ? (
            <Table<DoanhThuXeBusNgoiReport>
              columns={vehicleColumns}
              dataSource={vehicleRevenueData}
              rowKey={(record) => `${record.maXe}-${record.thang}`}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              scroll={{ x: 960 }}
            />
          ) : (
            <Table<DoanhThuTuyenDuongReport>
              columns={routeColumns}
              dataSource={routeRevenueData}
              rowKey={(record) => `${record.maTuyen}-${record.thang}`}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              scroll={{ x: 960 }}
            />
          )}
        </Space>
      </Card>
    </div>
  );
};

export default Reports;
