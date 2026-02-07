import { Card, Col, Row, Alert, List, Typography, Button, Skeleton, Space } from 'antd';
import {
  UserOutlined,
  CarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  WarningOutlined,
  ReloadOutlined,
  TeamOutlined,
  PlusOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useMaintenanceStatus } from '@features/admin/hooks/useMaintenance';
import { formatNumber } from '@utils/format';
import driverService from '@services/api/driver.service';
import tripService from '@services/api/trip.service';
import ticketService from '@services/api/ticket.service';
import customerService from '@services/api/customer.service';

const { Title, Text } = Typography;

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  href?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, href, loading }) => {
  const content = (
    <Card hoverable={!!href} className="h-full transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className="p-3 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <span className="text-2xl text-white">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <Text type="secondary" className="text-sm">
            {title}
          </Text>
          <div className="mt-1">
            {loading ? (
              <Skeleton.Input active size="small" style={{ width: 60, height: 28 }} />
            ) : (
              <Text strong className="text-2xl">
                {value}
              </Text>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
};

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, title, description, href, color }) => (
  <Link to={href} className="block">
    <Card hoverable className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <span className="text-xl">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <Text strong className="block text-sm">
            {title}
          </Text>
          <Text type="secondary" className="text-xs">
            {description}
          </Text>
        </div>
      </div>
    </Card>
  </Link>
);

const Dashboard: React.FC = () => {
  // Fetch maintenance data
  const {
    data: maintenanceData,
    isLoading: isMaintenanceLoading,
    refetch,
  } = useMaintenanceStatus();

  // Fetch driver count
  const { data: driverData, isLoading: isDriverLoading } = useQuery({
    queryKey: ['dashboard', 'drivers-count'],
    queryFn: () => driverService.search({ pageSize: 1 }),
    select: (res) => (res.success ? res.data.totalRecords : 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch trip count (today)
  const { data: tripData, isLoading: isTripLoading } = useQuery({
    queryKey: ['dashboard', 'trips-count'],
    queryFn: () => tripService.search({ pageSize: 1 }),
    select: (res) => (res.success ? res.data.totalRecords : 0),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch ticket count
  const { data: ticketData, isLoading: isTicketLoading } = useQuery({
    queryKey: ['dashboard', 'tickets-count'],
    queryFn: () => ticketService.search({ pageSize: 1 }),
    select: (res) => (res.success ? res.data.totalRecords : 0),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch customer count
  const { data: customerData, isLoading: isCustomerLoading } = useQuery({
    queryKey: ['dashboard', 'customers-count'],
    queryFn: () => customerService.search({ pageSize: 1 }),
    select: (res) => (res.success ? res.data.totalRecords : 0),
    staleTime: 5 * 60 * 1000,
  });

  const vehiclesNeedMaintenance = maintenanceData?.filter((v) => v.canBaoTri) || [];
  const totalVehicles = maintenanceData?.length || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <Title level={2} className="!mb-1">
          Dashboard
        </Title>
        <Text type="secondary">Tổng quan hệ thống quản lý vận tải</Text>
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Tổng tài xế"
            value={formatNumber(driverData || 0)}
            icon={<UserOutlined />}
            color="#1677ff"
            href="/admin/drivers"
            loading={isDriverLoading}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Tổng xe"
            value={formatNumber(totalVehicles)}
            icon={<CarOutlined />}
            color="#52c41a"
            href="/admin/vehicles"
            loading={isMaintenanceLoading}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Tổng chuyến xe"
            value={formatNumber(tripData || 0)}
            icon={<EnvironmentOutlined />}
            color="#722ed1"
            href="/admin/trips"
            loading={isTripLoading}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Tổng vé bán"
            value={formatNumber(ticketData || 0)}
            icon={<FileTextOutlined />}
            color="#fa8c16"
            href="/admin/tickets"
            loading={isTicketLoading}
          />
        </Col>
      </Row>

      {/* Secondary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Khách hàng"
            value={formatNumber(customerData || 0)}
            icon={<TeamOutlined />}
            color="#13c2c2"
            href="/admin/users"
            loading={isCustomerLoading}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Xe cần bảo trì"
            value={vehiclesNeedMaintenance.length}
            icon={<WarningOutlined />}
            color={vehiclesNeedMaintenance.length > 0 ? '#ff4d4f' : '#52c41a'}
            href="/admin/vehicles"
            loading={isMaintenanceLoading}
          />
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Maintenance Alerts */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                <span>Cảnh báo bảo trì</span>
              </Space>
            }
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isMaintenanceLoading}
                size="small"
              >
                Làm mới
              </Button>
            }
            className="h-full"
          >
            {isMaintenanceLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} active avatar paragraph={{ rows: 1 }} />
                ))}
              </div>
            ) : vehiclesNeedMaintenance.length === 0 ? (
              <Alert
                message="Tất cả xe đều trong trạng thái tốt"
                description="Không có xe nào cần bảo trì trong thời gian tới"
                type="success"
                showIcon
              />
            ) : (
              <>
                <Alert
                  message={`${vehiclesNeedMaintenance.length} xe cần bảo trì`}
                  type="warning"
                  showIcon
                  className="mb-4"
                />
                <List
                  dataSource={vehiclesNeedMaintenance.slice(0, 5)}
                  renderItem={(vehicle) => (
                    <List.Item className="!px-0">
                      <List.Item.Meta
                        avatar={
                          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <WarningOutlined className="text-lg text-red-500" />
                          </div>
                        }
                        title={<span className="font-medium">{vehicle.tenXe || vehicle.maXe}</span>}
                        description={`Biển số: ${vehicle.bienSo || '-'}`}
                      />
                      <div className="text-right">
                        <Text type="danger" strong>
                          {vehicle.soNgayTuBaoTri} ngày
                        </Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {formatNumber(vehicle.tongKmVanHanh)} km
                        </Text>
                      </div>
                    </List.Item>
                  )}
                />
                {vehiclesNeedMaintenance.length > 5 && (
                  <Link to="/admin/vehicles" className="block text-center mt-4">
                    <Button type="link" size="small">
                      Xem tất cả {vehiclesNeedMaintenance.length} xe →
                    </Button>
                  </Link>
                )}
              </>
            )}
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={10}>
          <Card title="Thao tác nhanh" className="h-full">
            <div className="grid grid-cols-1 gap-3">
              <QuickAction
                icon={<PlusOutlined />}
                title="Đặt vé mới"
                description="Tạo vé cho khách hàng"
                href="/admin/tickets"
                color="#1677ff"
              />
              <QuickAction
                icon={<EnvironmentOutlined />}
                title="Tạo chuyến xe"
                description="Lên lịch chuyến xe mới"
                href="/admin/trips"
                color="#722ed1"
              />
              <QuickAction
                icon={<UserOutlined />}
                title="Thêm tài xế"
                description="Đăng ký tài xế mới"
                href="/admin/drivers"
                color="#52c41a"
              />
              <QuickAction
                icon={<BarChartOutlined />}
                title="Xem báo cáo"
                description="Thống kê doanh thu"
                href="/admin/reports"
                color="#fa8c16"
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
