/**
 * Enhanced Driver List Page
 * Quản lý tài xế với thông tin chuyến xe và lương
 *
 * Ràng buộc:
 * - Mỗi tài xế có thể lái xe chính hoặc phụ xe (vai trò thay đổi theo chuyến)
 * - Hệ số lương: Lái xe = 1.5, Phụ xe = 1.0
 * - Lương = Hệ số × Lương cơ bản × Số chuyến
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Popconfirm,
  Drawer,
  Descriptions,
  Avatar,
  Row,
  Col,
  Statistic,
  Badge,
  Tabs,
  List,
  Empty,
  Progress,
  Tooltip,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClearOutlined,
  UserOutlined,
  CarOutlined,
  DollarOutlined,
  CalendarOutlined,
  TrophyOutlined,
  TeamOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from '@tanstack/react-router';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useDrivers, useDeleteDriver, useDebounce } from '@features/admin/hooks';
import { useTableState } from '@features/admin/hooks/usePagination';
import { formatDate, formatCurrency, formatNumber } from '@utils/format';
import type { DriverSearchResult } from '@base/models/entities/driver';
import {
  mockDrivers,
  DRIVER_ROLES,
  BASE_SALARY,
  calculateDriverWage,
  type DriverDetail,
} from '@mocks/drivers.mock';
import { mockTrips, calculateDriverWage as calcTripWage, type TripDetail } from '@mocks/trips.mock';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface DriverFilters {
  gioiTinh: string;
  role: string;
}

// Get driver trips with role
const getDriverTrips = (maTaiXe: string) => {
  const asMainDriver = mockTrips.filter((t) => t.maTaiXeLaiXe === maTaiXe);
  const asAssistant = mockTrips.filter((t) => t.maTaiXePhuXe === maTaiXe);
  return {
    asMainDriver,
    asAssistant,
    total: asMainDriver.length + asAssistant.length,
  };
};

// Calculate monthly salary
const calculateMonthlySalary = (maTaiXe: string, month: number, year: number) => {
  const trips = mockTrips.filter((t) => {
    const tripDate = new Date(t.thoiGianKhoiHanh || '');
    return tripDate.getMonth() === month && tripDate.getFullYear() === year;
  });

  let salary = 0;
  trips.forEach((t) => {
    if (t.maTaiXeLaiXe === maTaiXe) {
      salary += t.thuLaoLaiXe || 0;
    }
    if (t.maTaiXePhuXe === maTaiXe) {
      salary += t.thuLaoPhuXe || 0;
    }
  });
  return salary;
};

const DriverListEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<DriverDetail | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 500);

  const tableState = useTableState<DriverFilters>({
    gioiTinh: '',
    role: '',
  });

  useEffect(() => {
    tableState.setSearchText(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading, isError, refetch } = useDrivers(tableState.queryParams);
  const deleteMutation = useDeleteDriver();

  // Use mock data as fallback
  const driversData: DriverDetail[] = useMemo(() => {
    return data?.items?.length ? (data.items as DriverDetail[]) : mockDrivers;
  }, [data]);

  // Enrich driver data with trip info
  const enrichedDrivers = useMemo(() => {
    return driversData.map((driver) => {
      const tripInfo = getDriverTrips(driver.maTaiXe);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const luongThang = calculateMonthlySalary(driver.maTaiXe, currentMonth, currentYear);

      return {
        ...driver,
        soChuyenLaiXe: tripInfo.asMainDriver.length,
        soChuyenPhuXe: tripInfo.asAssistant.length,
        tongSoChuyen: tripInfo.total,
        luongThangNay: luongThang,
      };
    });
  }, [driversData]);

  // Stats
  const stats = useMemo(() => {
    const total = enrichedDrivers.length;
    const mainDrivers = enrichedDrivers.filter((d) => (d.heSoLuong ?? 0) >= 1.5).length;
    const assistants = enrichedDrivers.filter((d) => (d.heSoLuong ?? 0) < 1.5).length;
    const totalTrips = enrichedDrivers.reduce((sum, d) => sum + d.tongSoChuyen, 0);
    const avgTrips = total > 0 ? Math.round(totalTrips / total) : 0;
    return { total, mainDrivers, assistants, totalTrips, avgTrips };
  }, [enrichedDrivers]);

  const handleDelete = useCallback(
    async (maTaiXe: string) => {
      await deleteMutation.mutateAsync(maTaiXe);
    },
    [deleteMutation],
  );

  const handleViewDetail = (driver: DriverDetail) => {
    setSelectedDriver(driver);
    setIsDetailDrawerOpen(true);
  };

  const columns: ColumnsType<DriverDetail> = useMemo(
    () => [
      {
        title: 'Mã tài xế',
        dataIndex: 'maTaiXe',
        key: 'maTaiXe',
        width: 100,
        fixed: 'left',
        render: (text) => (
          <Text strong style={{ color: '#1677ff' }}>
            {text}
          </Text>
        ),
      },
      {
        title: 'Tên tài xế',
        dataIndex: 'tenTaiXe',
        key: 'tenTaiXe',
        render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
            <div>
              <div style={{ fontWeight: 500 }}>{text || '-'}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.soCccd}
              </Text>
            </div>
          </div>
        ),
      },
      {
        title: <Tooltip title="Hệ số lương: Lái xe=1.5, Phụ xe=1.0">Vai trò / Hệ số</Tooltip>,
        key: 'role',
        width: 140,
        render: (_, record) => {
          const isMainDriver = (record.heSoLuong || 0) >= 1.5;
          return (
            <Tag color={isMainDriver ? 'green' : 'orange'}>
              {isMainDriver ? 'Lái xe chính' : 'Phụ xe'} (x{record.heSoLuong || 1.0})
            </Tag>
          );
        },
      },
      {
        title: (
          <span>
            <CarOutlined /> Số chuyến
          </span>
        ),
        key: 'trips',
        width: 150,
        render: (_, record: any) => {
          const soChuyenLaiXe = record.soChuyenLaiXe || 0;
          const soChuyenPhuXe = record.soChuyenPhuXe || 0;
          const total = soChuyenLaiXe + soChuyenPhuXe;
          return (
            <div>
              <div style={{ marginBottom: 4 }}>
                <Badge status="success" text={`Lái xe: ${soChuyenLaiXe}`} />
              </div>
              <div>
                <Badge status="warning" text={`Phụ xe: ${soChuyenPhuXe}`} />
              </div>
              <div style={{ marginTop: 4 }}>
                <Text strong>Tổng: {total} chuyến</Text>
              </div>
            </div>
          );
        },
      },
      {
        title: (
          <span>
            <DollarOutlined /> Lương tháng này
          </span>
        ),
        key: 'salary',
        width: 140,
        render: (_, record: any) => (
          <Text strong style={{ color: '#52c41a' }}>
            {formatCurrency(record.luongThangNay || 0)}
          </Text>
        ),
        sorter: (a: any, b: any) => (a.luongThangNay || 0) - (b.luongThangNay || 0),
      },
      {
        title: 'Giới tính',
        dataIndex: 'gioiTinh',
        key: 'gioiTinh',
        width: 90,
        render: (text) => <Tag color={text === 'Nam' ? 'blue' : 'magenta'}>{text || '-'}</Tag>,
      },
      {
        title: 'Ngày sinh',
        dataIndex: 'ngaySinh',
        key: 'ngaySinh',
        width: 110,
        render: (text) => formatDate(text),
      },
      {
        title: 'Quê quán',
        dataIndex: 'queQuan',
        key: 'queQuan',
        width: 120,
        render: (text) => text || '-',
      },
      {
        title: 'Thao tác',
        key: 'action',
        width: 130,
        fixed: 'right',
        align: 'center',
        render: (_, record) => (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              title="Chi tiết"
            />
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate({ to: `/admin/drivers/${record.maTaiXe}/edit` })}
              title="Sửa"
            />
            <Popconfirm
              title="Xóa tài xế"
              description="Bạn có chắc chắn muốn xóa tài xế này?"
              onConfirm={() => handleDelete(record.maTaiXe)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" size="small" icon={<DeleteOutlined />} danger title="Xóa" />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [navigate, handleDelete],
  );

  const handleTableChange = useCallback(
    (pagination: TablePaginationConfig) => {
      if (pagination.current) {
        tableState.goToPage(pagination.current);
      }
      if (pagination.pageSize) {
        tableState.changePageSize(pagination.pageSize);
      }
    },
    [tableState],
  );

  // Get trip history for selected driver
  const driverTripHistory = useMemo(() => {
    if (!selectedDriver) return { asMain: [], asAssistant: [] };
    const info = getDriverTrips(selectedDriver.maTaiXe);
    return {
      asMain: info.asMainDriver,
      asAssistant: info.asAssistant,
    };
  }, [selectedDriver]);

  if (isError) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="danger">Không thể tải dữ liệu. </Text>
            <Button type="link" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
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
            <TeamOutlined /> Quản lý Tài xế
          </Title>
          <Text type="secondary">Danh sách tài xế với thông tin chuyến và lương</Text>
        </div>
        <Link to="/admin/drivers/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm tài xế
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={5}>
          <Card>
            <Statistic title="Tổng tài xế" value={stats.total} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Lái xe chính"
              value={stats.mainDrivers}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic title="Phụ xe" value={stats.assistants} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic title="Tổng chuyến" value={stats.totalTrips} prefix={<CarOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="TB chuyến/người" value={stats.avgTrips} suffix="chuyến" />
          </Card>
        </Col>
      </Row>

      {/* Info about salary */}
      <Card style={{ marginBottom: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
        <Text>
          <DollarOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          <strong>Công thức tính lương:</strong> Thù lao = Hệ số lương × Lương cơ bản (
          {formatCurrency(BASE_SALARY)}) × Hệ số chuyến
          <span style={{ marginLeft: 16 }}>
            | <Tag color="green">Lái xe: x1.5</Tag> <Tag color="orange">Phụ xe: x1.0</Tag>
          </span>
        </Text>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Tìm theo tên, CCCD..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            placeholder="Vai trò"
            value={tableState.filters.role || undefined}
            onChange={(value) => tableState.updateFilter('role', value || '')}
            style={{ width: 140 }}
            allowClear
          >
            <Select.Option value="main">Lái xe chính</Select.Option>
            <Select.Option value="assistant">Phụ xe</Select.Option>
          </Select>
          <Select
            placeholder="Giới tính"
            value={tableState.filters.gioiTinh || undefined}
            onChange={(value) => tableState.updateFilter('gioiTinh', value || '')}
            style={{ width: 120 }}
            allowClear
            options={[
              { value: 'Nam', label: 'Nam' },
              { value: 'Nữ', label: 'Nữ' },
            ]}
          />
          {tableState.hasActiveFilters && (
            <Button
              icon={<ClearOutlined />}
              onClick={() => {
                tableState.clearFilters();
                setSearchInput('');
              }}
            >
              Xóa lọc
            </Button>
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table<DriverDetail>
          columns={columns}
          dataSource={enrichedDrivers}
          rowKey="maTaiXe"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tài xế`,
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={
          <span>
            <UserOutlined /> Chi tiết tài xế: {selectedDriver?.tenTaiXe}
          </span>
        }
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        width={600}
      >
        {selectedDriver && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Mã tài xế">{selectedDriver.maTaiXe}</Descriptions.Item>
              <Descriptions.Item label="Tên tài xế">{selectedDriver.tenTaiXe}</Descriptions.Item>
              <Descriptions.Item label="Giới tính">{selectedDriver.gioiTinh}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {formatDate(selectedDriver.ngaySinh)}
              </Descriptions.Item>
              <Descriptions.Item label="CCCD">{selectedDriver.soCccd}</Descriptions.Item>
              <Descriptions.Item label="Quê quán">{selectedDriver.queQuan}</Descriptions.Item>
              <Descriptions.Item label="Hệ số lương">
                <Tag color={(selectedDriver.heSoLuong ?? 0) >= 1.5 ? 'green' : 'orange'}>
                  x{selectedDriver.heSoLuong}
                </Tag>
                {(selectedDriver.heSoLuong ?? 0) >= 1.5 ? ' (Lái xe chính)' : ' (Phụ xe)'}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <HistoryOutlined /> Lịch sử chuyến xe
            </Divider>

            <Tabs defaultActiveKey="main">
              <TabPane
                tab={
                  <span>
                    <Badge status="success" /> Lái xe chính ({driverTripHistory.asMain.length})
                  </span>
                }
                key="main"
              >
                {driverTripHistory.asMain.length > 0 ? (
                  <List
                    size="small"
                    dataSource={driverTripHistory.asMain}
                    renderItem={(trip: TripDetail) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<CarOutlined style={{ color: '#52c41a' }} />}
                          title={trip.tenChuyen || trip.maChuyen}
                          description={
                            <div>
                              <div>
                                {trip.tenTuyen}: {trip.diemDi} → {trip.diemDen}
                              </div>
                              <div>
                                Thù lao:{' '}
                                <Text strong style={{ color: '#52c41a' }}>
                                  {formatCurrency(trip.thuLaoLaiXe)}
                                </Text>
                              </div>
                            </div>
                          }
                        />
                        <Tag color={trip.trangThai === 'Completed' ? 'green' : 'blue'}>
                          {trip.trangThai}
                        </Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="Chưa có chuyến lái xe chính" />
                )}
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <Badge status="warning" /> Phụ xe ({driverTripHistory.asAssistant.length})
                  </span>
                }
                key="assistant"
              >
                {driverTripHistory.asAssistant.length > 0 ? (
                  <List
                    size="small"
                    dataSource={driverTripHistory.asAssistant}
                    renderItem={(trip: TripDetail) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<CarOutlined style={{ color: '#faad14' }} />}
                          title={trip.tenChuyen || trip.maChuyen}
                          description={
                            <div>
                              <div>
                                {trip.tenTuyen}: {trip.diemDi} → {trip.diemDen}
                              </div>
                              <div>
                                Thù lao:{' '}
                                <Text strong style={{ color: '#faad14' }}>
                                  {formatCurrency(trip.thuLaoPhuXe)}
                                </Text>
                              </div>
                            </div>
                          }
                        />
                        <Tag color={trip.trangThai === 'Completed' ? 'green' : 'blue'}>
                          {trip.trangThai}
                        </Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="Chưa có chuyến phụ xe" />
                )}
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default DriverListEnhanced;
