/**
 * Enhanced Reports Page
 * Trang báo cáo với đầy đủ các loại báo cáo:
 * 1. Lương tài xế theo tháng
 * 2. Doanh thu xe theo tháng
 * 3. Doanh thu theo tuyến đường
 * 4. Doanh thu theo loại xe
 */

import { useState, useMemo } from 'react';
import {
  Card,
  Tabs,
  Table,
  Typography,
  DatePicker,
  Space,
  Row,
  Col,
  Statistic,
  Tag,
  Select,
  Progress,
  Alert,
  Tooltip,
  Divider,
} from 'antd';
import {
  DollarOutlined,
  TeamOutlined,
  CarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TrophyOutlined,
  RiseOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { formatCurrency, formatNumber } from '@utils/format';
import {
  mockDriverSalaryReports,
  mockVehicleRevenueReports,
  mockRouteRevenueReports,
} from '@mocks/reports.mock';
import { mockDrivers, DRIVER_ROLES, BASE_SALARY } from '@mocks/drivers.mock';
import { mockTrips } from '@mocks/trips.mock';
import { mockVehicles, VEHICLE_TYPES } from '@mocks/vehicles.mock';
import { mockRoutes, ROUTE_COMPLEXITY } from '@mocks/routes.mock';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Interface for reports
interface DriverSalaryRow {
  key: string;
  maTaiXe: string;
  tenTaiXe: string;
  soChuyenLaiXe: number;
  soChuyenPhuXe: number;
  tongThuLao: number;
  heSoTB: number;
}

interface VehicleRevenueRow {
  key: string;
  maXe: string;
  tenXe: string;
  bienSo: string;
  loaiXe: string;
  soChuyen: number;
  tongDoanhThu: number;
  chiPhi: number;
  loiNhuan: number;
}

interface RouteRevenueRow {
  key: string;
  maTuyen: string;
  tenTuyen: string;
  diemDi: string;
  diemDen: string;
  khoangCach: number;
  doPhucTap: string;
  soChuyen: number;
  tongDoanhThu: number;
}

interface VehicleTypeRevenueRow {
  key: string;
  loaiXe: string;
  tenLoaiXe: string;
  soXe: number;
  soChuyen: number;
  tongDoanhThu: number;
  tbDoanhThu: number;
}

const ReportsEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState('driver-salary');
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs>(dayjs());

  // Calculate driver salary for selected month
  const driverSalaryData: DriverSalaryRow[] = useMemo(() => {
    const month = selectedMonth.month();
    const year = selectedMonth.year();

    return mockDrivers
      .map((driver) => {
        // Filter trips in selected month
        const monthTrips = mockTrips.filter((t) => {
          const tripDate = dayjs(t.thoiGianKhoiHanh);
          return tripDate.month() === month && tripDate.year() === year;
        });

        // Count trips as main driver and assistant
        const asMain = monthTrips.filter((t) => t.maTaiXeLaiXe === driver.maTaiXe);
        const asAssistant = monthTrips.filter((t) => t.maTaiXePhuXe === driver.maTaiXe);

        // Calculate total wage
        const mainDriverWage = asMain.reduce((sum, t) => sum + (t.thuLaoLaiXe || 0), 0);
        const assistantWage = asAssistant.reduce((sum, t) => sum + (t.thuLaoPhuXe || 0), 0);

        // Calculate average coefficient
        const totalTrips = asMain.length + asAssistant.length;
        const avgCoeff =
          totalTrips > 0 ? (asMain.length * 1.5 + asAssistant.length * 1.0) / totalTrips : 0;

        return {
          key: driver.maTaiXe,
          maTaiXe: driver.maTaiXe,
          tenTaiXe: driver.tenTaiXe || '',
          soChuyenLaiXe: asMain.length,
          soChuyenPhuXe: asAssistant.length,
          tongThuLao: mainDriverWage + assistantWage,
          heSoTB: avgCoeff,
        };
      })
      .filter((d) => d.soChuyenLaiXe > 0 || d.soChuyenPhuXe > 0);
  }, [selectedMonth]);

  // Calculate vehicle revenue for selected month
  const vehicleRevenueData: VehicleRevenueRow[] = useMemo(() => {
    const month = selectedMonth.month();
    const year = selectedMonth.year();

    return mockVehicles
      .map((vehicle) => {
        // Filter trips for this vehicle in selected month
        const vehicleTrips = mockTrips.filter((t) => {
          const tripDate = dayjs(t.thoiGianKhoiHanh);
          return t.maXe === vehicle.maXe && tripDate.month() === month && tripDate.year() === year;
        });

        // Calculate revenue and costs
        const tongDoanhThu = vehicleTrips.reduce((sum, t) => {
          // Assume revenue is tickets sold × average ticket price
          const avgTicketPrice = 500000; // Average
          return sum + (t.soVeDaBan || 0) * avgTicketPrice;
        }, 0);

        const chiPhi = vehicleTrips.reduce((sum, t) => {
          return sum + (t.chiPhiVanHanh || 0) + (t.thuLaoLaiXe || 0) + (t.thuLaoPhuXe || 0);
        }, 0);

        const vehicleType = VEHICLE_TYPES.find((vt) => vt.soGhe === vehicle.soChoNgoi);

        return {
          key: vehicle.maXe,
          maXe: vehicle.maXe,
          tenXe: vehicle.tenXe || '',
          bienSo: vehicle.bienSo || '',
          loaiXe: vehicleType?.ten || '',
          soChuyen: vehicleTrips.length,
          tongDoanhThu,
          chiPhi,
          loiNhuan: tongDoanhThu - chiPhi,
        };
      })
      .filter((v) => v.soChuyen > 0);
  }, [selectedMonth]);

  // Calculate route revenue
  const routeRevenueData: RouteRevenueRow[] = useMemo(() => {
    const month = selectedMonth.month();
    const year = selectedMonth.year();

    return mockRoutes
      .map((route) => {
        // Filter trips for this route in selected month
        const routeTrips = mockTrips.filter((t) => {
          const tripDate = dayjs(t.thoiGianKhoiHanh);
          return (
            t.maTuyen === route.maTuyen && tripDate.month() === month && tripDate.year() === year
          );
        });

        // Calculate revenue
        const tongDoanhThu = routeTrips.reduce((sum, t) => {
          const avgTicketPrice = 500000;
          return sum + (t.soVeDaBan || 0) * avgTicketPrice;
        }, 0);

        const complexity = ROUTE_COMPLEXITY.find((c) => c.ma === route.maDoPhucTap);

        return {
          key: route.maTuyen,
          maTuyen: route.maTuyen,
          tenTuyen: route.tenTuyen || '',
          diemDi: route.diemDi || '',
          diemDen: route.diemDen || '',
          khoangCach: route.khoangCach || 0,
          doPhucTap: complexity?.ten || '',
          soChuyen: routeTrips.length,
          tongDoanhThu,
        };
      })
      .filter((r) => r.soChuyen > 0);
  }, [selectedMonth]);

  // Calculate revenue by vehicle type
  const vehicleTypeRevenueData: VehicleTypeRevenueRow[] = useMemo(() => {
    const month = selectedMonth.month();
    const year = selectedMonth.year();

    return VEHICLE_TYPES.map((vType) => {
      // Get all vehicles of this type
      const typeVehicles = mockVehicles.filter((v) => v.soChoNgoi === vType.soGhe);

      // Get all trips for these vehicles
      const typeTrips = mockTrips.filter((t) => {
        const tripDate = dayjs(t.thoiGianKhoiHanh);
        return (
          typeVehicles.some((v) => v.maXe === t.maXe) &&
          tripDate.month() === month &&
          tripDate.year() === year
        );
      });

      // Calculate revenue
      const tongDoanhThu = typeTrips.reduce((sum, t) => {
        const avgTicketPrice = 500000;
        return sum + (t.soVeDaBan || 0) * avgTicketPrice;
      }, 0);

      return {
        key: vType.ma,
        loaiXe: vType.ma,
        tenLoaiXe: vType.ten,
        soXe: typeVehicles.length,
        soChuyen: typeTrips.length,
        tongDoanhThu,
        tbDoanhThu: typeTrips.length > 0 ? tongDoanhThu / typeTrips.length : 0,
      };
    }).filter((vt) => vt.soChuyen > 0);
  }, [selectedMonth]);

  // Statistics
  const stats = useMemo(() => {
    const totalDriverSalary = driverSalaryData.reduce((sum, d) => sum + d.tongThuLao, 0);
    const totalVehicleRevenue = vehicleRevenueData.reduce((sum, v) => sum + v.tongDoanhThu, 0);
    const totalProfit = vehicleRevenueData.reduce((sum, v) => sum + v.loiNhuan, 0);
    const topRoute = [...routeRevenueData].sort((a, b) => b.tongDoanhThu - a.tongDoanhThu)[0];

    return {
      totalDriverSalary,
      totalVehicleRevenue,
      totalProfit,
      topRoute: topRoute?.tenTuyen || '-',
      topRouteRevenue: topRoute?.tongDoanhThu || 0,
    };
  }, [driverSalaryData, vehicleRevenueData, routeRevenueData]);

  // Columns for driver salary
  const driverSalaryColumns: ColumnsType<DriverSalaryRow> = [
    {
      title: 'Mã tài xế',
      dataIndex: 'maTaiXe',
      key: 'maTaiXe',
      width: 100,
    },
    {
      title: 'Tên tài xế',
      dataIndex: 'tenTaiXe',
      key: 'tenTaiXe',
    },
    {
      title: (
        <span>
          Chuyến lái xe <Tag color="green">x1.5</Tag>
        </span>
      ),
      dataIndex: 'soChuyenLaiXe',
      key: 'soChuyenLaiXe',
      width: 140,
      align: 'center',
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: (
        <span>
          Chuyến phụ xe <Tag color="orange">x1.0</Tag>
        </span>
      ),
      dataIndex: 'soChuyenPhuXe',
      key: 'soChuyenPhuXe',
      width: 140,
      align: 'center',
      render: (value) => <Text>{value}</Text>,
    },
    {
      title: 'Tổng chuyến',
      key: 'tongChuyen',
      width: 100,
      align: 'center',
      render: (_, record) => <Text strong>{record.soChuyenLaiXe + record.soChuyenPhuXe}</Text>,
    },
    {
      title: 'HS trung bình',
      dataIndex: 'heSoTB',
      key: 'heSoTB',
      width: 120,
      align: 'center',
      render: (value) => <Tag color={value >= 1.3 ? 'green' : 'blue'}>x{value.toFixed(2)}</Tag>,
    },
    {
      title: 'Tổng thù lao',
      dataIndex: 'tongThuLao',
      key: 'tongThuLao',
      width: 150,
      align: 'right',
      render: (value) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(value)}
        </Text>
      ),
      sorter: (a, b) => a.tongThuLao - b.tongThuLao,
    },
  ];

  // Columns for vehicle revenue
  const vehicleRevenueColumns: ColumnsType<VehicleRevenueRow> = [
    {
      title: 'Mã xe',
      dataIndex: 'maXe',
      key: 'maXe',
      width: 80,
    },
    {
      title: 'Tên xe / Biển số',
      key: 'tenXe',
      render: (_, record) => (
        <div>
          <div>{record.tenXe}</div>
          <Tag color="blue">{record.bienSo}</Tag>
        </div>
      ),
    },
    {
      title: 'Loại xe',
      dataIndex: 'loaiXe',
      key: 'loaiXe',
      width: 130,
    },
    {
      title: 'Số chuyến',
      dataIndex: 'soChuyen',
      key: 'soChuyen',
      width: 100,
      align: 'center',
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'tongDoanhThu',
      key: 'tongDoanhThu',
      width: 140,
      align: 'right',
      render: (value) => <Text style={{ color: '#1677ff' }}>{formatCurrency(value)}</Text>,
      sorter: (a, b) => a.tongDoanhThu - b.tongDoanhThu,
    },
    {
      title: 'Chi phí',
      dataIndex: 'chiPhi',
      key: 'chiPhi',
      width: 130,
      align: 'right',
      render: (value) => <Text type="secondary">{formatCurrency(value)}</Text>,
    },
    {
      title: 'Lợi nhuận',
      dataIndex: 'loiNhuan',
      key: 'loiNhuan',
      width: 140,
      align: 'right',
      render: (value) => (
        <Text strong style={{ color: value >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {formatCurrency(value)}
        </Text>
      ),
      sorter: (a, b) => a.loiNhuan - b.loiNhuan,
    },
  ];

  // Columns for route revenue
  const routeRevenueColumns: ColumnsType<RouteRevenueRow> = [
    {
      title: 'Mã tuyến',
      dataIndex: 'maTuyen',
      key: 'maTuyen',
      width: 90,
    },
    {
      title: 'Tên tuyến',
      dataIndex: 'tenTuyen',
      key: 'tenTuyen',
    },
    {
      title: 'Lộ trình',
      key: 'loTrinh',
      render: (_, record) => (
        <Text type="secondary">
          {record.diemDi} → {record.diemDen}
        </Text>
      ),
    },
    {
      title: 'Khoảng cách',
      dataIndex: 'khoangCach',
      key: 'khoangCach',
      width: 110,
      align: 'right',
      render: (value) => `${formatNumber(value)} km`,
    },
    {
      title: (
        <Tooltip title="Độ phức tạp ảnh hưởng đến chu kỳ bảo dưỡng và thù lao tài xế">
          Độ phức tạp <InfoCircleOutlined />
        </Tooltip>
      ),
      dataIndex: 'doPhucTap',
      key: 'doPhucTap',
      width: 120,
      render: (value) => {
        const colors: Record<string, string> = {
          'Đơn giản': 'green',
          'Trung bình': 'orange',
          'Phức tạp': 'red',
        };
        return <Tag color={colors[value] || 'default'}>{value}</Tag>;
      },
    },
    {
      title: 'Số chuyến',
      dataIndex: 'soChuyen',
      key: 'soChuyen',
      width: 100,
      align: 'center',
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'tongDoanhThu',
      key: 'tongDoanhThu',
      width: 150,
      align: 'right',
      render: (value) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(value)}
        </Text>
      ),
      sorter: (a, b) => a.tongDoanhThu - b.tongDoanhThu,
    },
  ];

  // Columns for vehicle type revenue
  const vehicleTypeRevenueColumns: ColumnsType<VehicleTypeRevenueRow> = [
    {
      title: 'Loại xe',
      dataIndex: 'tenLoaiXe',
      key: 'tenLoaiXe',
    },
    {
      title: 'Số xe sở hữu',
      dataIndex: 'soXe',
      key: 'soXe',
      width: 120,
      align: 'center',
    },
    {
      title: 'Số chuyến',
      dataIndex: 'soChuyen',
      key: 'soChuyen',
      width: 100,
      align: 'center',
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: 'Tổng doanh thu',
      dataIndex: 'tongDoanhThu',
      key: 'tongDoanhThu',
      width: 150,
      align: 'right',
      render: (value) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(value)}
        </Text>
      ),
      sorter: (a, b) => a.tongDoanhThu - b.tongDoanhThu,
    },
    {
      title: 'TB doanh thu/chuyến',
      dataIndex: 'tbDoanhThu',
      key: 'tbDoanhThu',
      width: 160,
      align: 'right',
      render: (value) => <Text type="secondary">{formatCurrency(value)}</Text>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined /> Báo cáo & Thống kê
          </Title>
          <Text type="secondary">
            Báo cáo lương tài xế, doanh thu xe, doanh thu tuyến theo tháng
          </Text>
        </div>
        <Space>
          <Text>Chọn tháng:</Text>
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(date) => setSelectedMonth(date || dayjs())}
            format="MM/YYYY"
            allowClear={false}
          />
        </Space>
      </div>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng lương tài xế"
              value={stats.totalDriverSalary}
              prefix={<TeamOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalVehicleRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1677ff' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng lợi nhuận"
              value={stats.totalProfit}
              prefix={<RiseOutlined />}
              valueStyle={{ color: stats.totalProfit >= 0 ? '#52c41a' : '#ff4d4f' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={
                <span>
                  <TrophyOutlined style={{ color: '#faad14' }} /> Tuyến top
                </span>
              }
              value={stats.topRoute}
              suffix={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({formatCurrency(stats.topRouteRevenue)})
                </Text>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Formula Info */}
      <Alert
        message={
          <Space split={<Divider type="vertical" />}>
            <span>
              <strong>Công thức:</strong>
            </span>
            <span>Thù lao TXe = Hệ số × {formatCurrency(BASE_SALARY)} × Hệ số chuyến</span>
            <span>Lợi nhuận = Doanh thu - Chi phí - Thù lao</span>
          </Space>
        }
        type="info"
        style={{ marginBottom: 16 }}
      />

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <TeamOutlined /> Lương tài xế ({driverSalaryData.length})
              </span>
            }
            key="driver-salary"
          >
            <Table
              columns={driverSalaryColumns}
              dataSource={driverSalaryData}
              pagination={{ pageSize: 10 }}
              summary={(pageData) => {
                const total = pageData.reduce((sum, row) => sum + row.tongThuLao, 0);
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6}>
                        <Text strong>Tổng cộng</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ color: '#52c41a' }}>
                          {formatCurrency(total)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <CarOutlined /> Doanh thu xe ({vehicleRevenueData.length})
              </span>
            }
            key="vehicle-revenue"
          >
            <Table
              columns={vehicleRevenueColumns}
              dataSource={vehicleRevenueData}
              pagination={{ pageSize: 10 }}
              summary={(pageData) => {
                const totalRevenue = pageData.reduce((sum, row) => sum + row.tongDoanhThu, 0);
                const totalCost = pageData.reduce((sum, row) => sum + row.chiPhi, 0);
                const totalProfit = pageData.reduce((sum, row) => sum + row.loiNhuan, 0);
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text strong>Tổng cộng</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text style={{ color: '#1677ff' }}>{formatCurrency(totalRevenue)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <Text type="secondary">{formatCurrency(totalCost)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <Text strong style={{ color: totalProfit >= 0 ? '#52c41a' : '#ff4d4f' }}>
                          {formatCurrency(totalProfit)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <EnvironmentOutlined /> Doanh thu tuyến ({routeRevenueData.length})
              </span>
            }
            key="route-revenue"
          >
            <Table
              columns={routeRevenueColumns}
              dataSource={routeRevenueData}
              pagination={{ pageSize: 10 }}
              summary={(pageData) => {
                const totalRevenue = pageData.reduce((sum, row) => sum + row.tongDoanhThu, 0);
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6}>
                        <Text strong>Tổng cộng</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ color: '#52c41a' }}>
                          {formatCurrency(totalRevenue)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <CarOutlined /> Doanh thu loại xe ({vehicleTypeRevenueData.length})
              </span>
            }
            key="vehicle-type-revenue"
          >
            <Table
              columns={vehicleTypeRevenueColumns}
              dataSource={vehicleTypeRevenueData}
              pagination={{ pageSize: 10 }}
              summary={(pageData) => {
                const totalRevenue = pageData.reduce((sum, row) => sum + row.tongDoanhThu, 0);
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Text strong>Tổng cộng</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ color: '#52c41a' }}>
                          {formatCurrency(totalRevenue)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReportsEnhanced;
