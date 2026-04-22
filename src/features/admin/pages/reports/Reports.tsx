import { useMemo, useState, type ReactNode } from 'react';
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
import {
  BarChartOutlined,
  CarOutlined,
  DollarCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
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

type SummaryItem = {
  title: string;
  value: number;
  formatter: (value: number) => string;
};

type CurrentReportConfig = {
  title: string;
  subtitle: string;
  loading: boolean;
  error: unknown;
  data: Array<LuongThangTaiXeReport | DoanhThuXeBusNgoiReport | DoanhThuTuyenDuongReport>;
  summary: SummaryItem[];
};

const defaultRange: [Dayjs, Dayjs] = [dayjs().startOf('month'), dayjs().endOf('month')];

const driverColumns: ColumnsType<LuongThangTaiXeReport> = [
  { title: 'Ma tai xe', dataIndex: 'maTaiXe', key: 'maTaiXe', width: 120 },
  { title: 'Ten tai xe', dataIndex: 'tenTaiXe', key: 'tenTaiXe' },
  {
    title: 'Tong km',
    dataIndex: 'tongKm',
    key: 'tongKm',
    align: 'right',
    render: (value) => formatNumber(value),
  },
  {
    title: 'So tuyen',
    dataIndex: 'soTuyen',
    key: 'soTuyen',
    align: 'center',
    render: (value) => formatNumber(value),
  },
  {
    title: 'Luong thang',
    dataIndex: 'luongThang',
    key: 'luongThang',
    align: 'right',
    render: (value) => formatCurrency(value ?? 0),
  },
];

const vehicleColumns: ColumnsType<DoanhThuXeBusNgoiReport> = [
  { title: 'Ma xe', dataIndex: 'maXe', key: 'maXe', width: 120 },
  { title: 'Thang', dataIndex: 'thang', key: 'thang', width: 140 },
  {
    title: 'Doanh thu',
    dataIndex: 'doanhThuThang',
    key: 'doanhThuThang',
    align: 'right',
    render: (value) => formatCurrency(value ?? 0),
  },
];

const routeColumns: ColumnsType<DoanhThuTuyenDuongReport> = [
  { title: 'Ma tuyen', dataIndex: 'maTuyen', key: 'maTuyen', width: 120 },
  { title: 'Ten tuyen', dataIndex: 'tenTuyen', key: 'tenTuyen' },
  { title: 'Thang', dataIndex: 'thang', key: 'thang', width: 140 },
  {
    title: 'Doanh thu',
    dataIndex: 'doanhThuThang',
    key: 'doanhThuThang',
    align: 'right',
    render: (value) => formatCurrency(value ?? 0),
  },
];

const reportTabOptions = [
  { label: 'Luong lai xe', value: 'driver-salary' as const },
  { label: 'Doanh thu xe', value: 'vehicle-revenue' as const },
  { label: 'Doanh thu tuyen', value: 'route-revenue' as const },
];

const reportHeroMeta: Record<
  ReportTab,
  { eyebrow: string; icon: ReactNode; badgeLabel: string }
> = {
  'driver-salary': {
    eyebrow: 'Van hanh doi ngu',
    icon: <TeamOutlined />,
    badgeLabel: 'Luong theo ky',
  },
  'vehicle-revenue': {
    eyebrow: 'Hieu qua phuong tien',
    icon: <CarOutlined />,
    badgeLabel: 'Doanh thu theo xe',
  },
  'route-revenue': {
    eyebrow: 'Doanh thu tuyen',
    icon: <BarChartOutlined />,
    badgeLabel: 'Tuyen dang phat sinh',
  },
};

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

  const currentConfig: CurrentReportConfig = useMemo(() => {
    if (activeTab === 'driver-salary') {
      const totalSalary = driverSalaryData.reduce((sum, item) => sum + (item.luongThang ?? 0), 0);
      const totalKm = driverSalaryData.reduce((sum, item) => sum + (item.tongKm ?? 0), 0);

      return {
        title: 'Bao cao luong lai xe',
        subtitle: 'Theo doi tong km, so tuyen va tong luong cua doi lai xe trong ky da chon.',
        loading: isDriverSalaryLoading,
        error: driverSalaryError,
        data: driverSalaryData,
        summary: [
          { title: 'Tong tai xe', value: driverSalaryData.length, formatter: formatNumber },
          { title: 'Tong km', value: totalKm, formatter: (value: number) => `${formatNumber(value)} km` },
          { title: 'Tong luong', value: totalSalary, formatter: formatCurrency },
        ],
      };
    }

    if (activeTab === 'vehicle-revenue') {
      const totalRevenue = vehicleRevenueData.reduce((sum, item) => sum + (item.doanhThuThang ?? 0), 0);

      return {
        title: 'Bao cao doanh thu xe',
        subtitle: 'Tong hop doanh thu theo tung xe trong khoang thoi gian van hanh.',
        loading: isVehicleRevenueLoading,
        error: vehicleRevenueError,
        data: vehicleRevenueData,
        summary: [
          { title: 'Ban ghi', value: vehicleRevenueData.length, formatter: formatNumber },
          { title: 'Tong doanh thu', value: totalRevenue, formatter: formatCurrency },
          {
            title: 'Xe co doanh thu',
            value: new Set(vehicleRevenueData.map((item) => item.maXe)).size,
            formatter: formatNumber,
          },
        ],
      };
    }

    const totalRevenue = routeRevenueData.reduce((sum, item) => sum + (item.doanhThuThang ?? 0), 0);

    return {
      title: 'Bao cao doanh thu tuyen',
      subtitle: 'Tong hop doanh thu theo tung tuyen de doi soat hieu qua khai thac.',
      loading: isRouteRevenueLoading,
      error: routeRevenueError,
      data: routeRevenueData,
      summary: [
        { title: 'Ban ghi', value: routeRevenueData.length, formatter: formatNumber },
        { title: 'Tong doanh thu', value: totalRevenue, formatter: formatCurrency },
        {
          title: 'Tuyen phat sinh',
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
  const heroMeta = reportHeroMeta[activeTab];

  const renderTable = () => {
    if (!hasDateRange) {
      return (
        <div className="admin-data-state">
          <Empty description="Chon khoang thoi gian de xem bao cao." />
        </div>
      );
    }

    if (currentConfig.error) {
      return (
        <Alert
          type="error"
          showIcon
          message="Khong tai duoc du lieu bao cao"
          description={(currentConfig.error as Error).message}
        />
      );
    }

    if (currentConfig.loading) {
      return (
        <div className="admin-data-state">
          <Spin size="large" />
        </div>
      );
    }

    if (currentConfig.data.length === 0) {
      return (
        <div className="admin-data-state">
          <Empty description="Khong co du lieu trong khoang thoi gian da chon." />
        </div>
      );
    }

    if (activeTab === 'driver-salary') {
      return (
        <Table<LuongThangTaiXeReport>
          columns={driverColumns}
          dataSource={driverSalaryData}
          rowKey="maTaiXe"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 960 }}
        />
      );
    }

    if (activeTab === 'vehicle-revenue') {
      return (
        <Table<DoanhThuXeBusNgoiReport>
          columns={vehicleColumns}
          dataSource={vehicleRevenueData}
          rowKey={(record) => `${record.maXe}-${record.thang}`}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 960 }}
        />
      );
    }

    return (
      <Table<DoanhThuTuyenDuongReport>
        columns={routeColumns}
        dataSource={routeRevenueData}
        rowKey={(record) => `${record.maTuyen}-${record.thang}`}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 960 }}
      />
    );
  };

  return (
    <div className="admin-page">
      <section className="admin-page-hero">
        <div className="admin-page-hero__meta">
          <span className="admin-page-hero__eyebrow">
            {heroMeta.icon}
            {heroMeta.eyebrow}
          </span>
          <Title level={2} className="admin-page-hero__title">
            Trung tam bao cao van hanh
          </Title>
          <Text type="secondary" className="admin-page-hero__description">
            Mot man hinh duy nhat de theo doi luong lai xe va doanh thu theo xe, theo tuyen
            trong ky. Giao dien uu tien doc nhanh, doi soat nhanh va khong chen them thong tin
            trang tri.
          </Text>
        </div>

        <div className="admin-page-hero__aside">
          <span className="admin-page-hero__aside-label">Ky dang xem</span>
          <p className="admin-page-hero__aside-value">
            {formatDate(params.tuNgay)} - {formatDate(params.denNgay)}
          </p>
          <Text type="secondary">{heroMeta.badgeLabel}</Text>
        </div>
      </section>

      <Card className="admin-surface-card admin-filter-card" bordered={false}>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <div className="admin-section-heading">
            <div>
              <Title level={4} className="admin-section-heading__title">
                Bo loc bao cao
              </Title>
              <Text type="secondary" className="admin-section-heading__description">
                Chuyen nhanh giua cac nhom bao cao va khoa ky doi soat theo ngay.
              </Text>
            </div>
            <div className="admin-subtle-panel">
              <Space size={8}>
                <DollarCircleOutlined style={{ color: '#2563eb' }} />
                <Text type="secondary">Du lieu lay truc tiep tu API backend hien tai.</Text>
              </Space>
            </div>
          </div>

          <Segmented<ReportTab>
            block
            value={activeTab}
            onChange={(value) => setActiveTab(value)}
            options={reportTabOptions}
          />

          <div className="admin-toolbar">
            <div className="admin-toolbar__meta">
              <RangePicker
                value={dateRange}
                onChange={(value) => setDateRange(value as [Dayjs, Dayjs] | null)}
                format="DD/MM/YYYY"
                allowClear={false}
              />
            </div>
            <Text type="secondary">
              Ky bao cao: {formatDate(params.tuNgay)} - {formatDate(params.denNgay)}
            </Text>
          </div>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {currentConfig.summary.map((item) => (
          <Col xs={24} md={8} key={item.title}>
            <Card className="admin-surface-card admin-stat-card" bordered={false}>
              <Statistic title={item.title} value={item.formatter(item.value)} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="admin-surface-card admin-table-card" bordered={false}>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <div className="admin-section-heading">
            <div>
              <Title level={4} className="admin-section-heading__title">
                {currentConfig.title}
              </Title>
              <Text type="secondary" className="admin-section-heading__description">
                {currentConfig.subtitle}
              </Text>
            </div>
            <div className="admin-subtle-panel">
              <Text type="secondary">So dong hien thi: {formatNumber(currentConfig.data.length)}</Text>
            </div>
          </div>

          {renderTable()}
        </Space>
      </Card>
    </div>
  );
};

export default Reports;
