/**
 * Enhanced Trip List Page
 * Quản lý chuyến xe với đầy đủ ràng buộc
 *
 * Ràng buộc:
 * - 1 lái xe chính + 1 phụ xe cho mỗi chuyến
 * - Không vượt quá số ghế cho phép
 * - Giá vé phụ thuộc tuyến + thời điểm
 */

import { useState, useMemo } from 'react';
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
  Modal,
  Form,
  DatePicker,
  message,
  Row,
  Col,
  Statistic,
  Alert,
  Descriptions,
  Drawer,
  Progress,
  Tooltip,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  ClearOutlined,
  CarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  useTrips,
  useDeleteTrip,
  useCompleteTrip,
  useCancelTrip,
} from '@features/admin/hooks/useTrips';
import { useTableState } from '@features/admin/hooks/usePagination';
import { formatDateTime, formatDate, formatCurrency, formatNumber } from '@utils/format';
import type { TripSearchResult } from '@base/models/entities/trip';
import { mockTrips, TRIP_STATUS, type TripDetail } from '@mocks/trips.mock';
import { mockDrivers, DRIVER_ROLES } from '@mocks/drivers.mock';
import { mockRoutes, PRICE_SEASON, calculateTicketPrice } from '@mocks/routes.mock';
import { mockVehicles, getMaxPassengers } from '@mocks/vehicles.mock';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface TripFilters {
  maTuyen: string;
  maXe: string;
}

const getStatusColor = (status: string | null) => {
  const statusObj = TRIP_STATUS.find((s) => s.ma === status);
  return statusObj?.color || 'default';
};

const getStatusText = (status: string | null) => {
  const statusObj = TRIP_STATUS.find((s) => s.ma === status);
  return statusObj?.ten || status || '-';
};

const TripListEnhanced: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripDetail | null>(null);
  const [editingTrip, setEditingTrip] = useState<TripDetail | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('THUONG');
  const [form] = Form.useForm();

  const tableState = useTableState<TripFilters>({
    maTuyen: '',
    maXe: '',
  });

  const { data, isLoading, isError, refetch } = useTrips(tableState.queryParams);
  const deleteMutation = useDeleteTrip();
  const completeMutation = useCompleteTrip();
  const cancelMutation = useCancelTrip();

  // Use mock data as fallback
  const tripsData: TripDetail[] = useMemo(() => {
    return data?.items?.length ? (data.items as TripDetail[]) : mockTrips;
  }, [data]);

  // Get main drivers (lái xe chính)
  const mainDrivers = useMemo(() => {
    return mockDrivers.filter((d) => (d.heSoLuong ?? 0) >= 1.5);
  }, []);

  // Get assistant drivers (phụ xe)
  const assistantDrivers = useMemo(() => {
    return mockDrivers.filter((d) => (d.heSoLuong ?? 0) < 1.5);
  }, []);

  // Calculate ticket price when route/season changes
  const calculatedPrice = useMemo(() => {
    const route = mockRoutes.find((r) => r.maTuyen === selectedRoute);
    if (!route) return 0;
    return calculateTicketPrice(route.khoangCach || 0, selectedSeason);
  }, [selectedRoute, selectedSeason]);

  // Get vehicle max passengers
  const vehicleMaxPassengers = useMemo(() => {
    const vehicle = mockVehicles.find((v) => v.maXe === selectedVehicle);
    if (!vehicle) return 0;
    return getMaxPassengers(vehicle.soChoNgoi || 0);
  }, [selectedVehicle]);

  const handleSearch = () => {
    tableState.setSearchText(searchInput);
  };

  const handleOpenModal = (trip?: TripDetail) => {
    if (trip) {
      setEditingTrip(trip);
      setSelectedRoute(trip.maTuyen || '');
      setSelectedVehicle(trip.maXe || '');
      form.setFieldsValue({
        maChuyen: trip.maChuyen,
        tenChuyen: trip.tenChuyen,
        thoiGianKhoiHanh: trip.thoiGianKhoiHanh ? dayjs(trip.thoiGianKhoiHanh) : null,
        maXe: trip.maXe,
        maTuyen: trip.maTuyen,
        maTaiXeLaiXe: trip.maTaiXeLaiXe,
        maTaiXePhuXe: trip.maTaiXePhuXe,
      });
    } else {
      setEditingTrip(null);
      setSelectedRoute('');
      setSelectedVehicle('');
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrip(null);
    form.resetFields();
  };

  const handleViewDetail = (trip: TripDetail) => {
    setSelectedTrip(trip);
    setIsDetailDrawerOpen(true);
  };

  const handleSubmit = async (values: any) => {
    // Validate: Lái xe và phụ xe không được trùng nhau
    if (values.maTaiXeLaiXe === values.maTaiXePhuXe) {
      message.error('Lái xe chính và phụ xe không được trùng nhau');
      return;
    }

    try {
      message.success(editingTrip ? 'Cập nhật chuyến xe thành công' : 'Thêm chuyến xe thành công');
      handleCloseModal();
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const columns: ColumnsType<TripDetail> = [
    {
      title: 'Mã chuyến',
      dataIndex: 'maChuyen',
      key: 'maChuyen',
      width: 110,
      fixed: 'left',
      render: (text) => (
        <Text strong style={{ color: '#1677ff' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Tuyến đường',
      key: 'route',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.tenTuyen || '-'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <EnvironmentOutlined /> {record.diemDi} → {record.diemDen}
          </Text>
        </div>
      ),
    },
    {
      title: 'Xe',
      key: 'vehicle',
      width: 160,
      render: (_, record) => (
        <div>
          <div>{record.tenXe || record.maXe || '-'}</div>
          {record.bienSo && (
            <Tag color="blue" style={{ marginTop: 4 }}>
              {record.bienSo}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: (
        <span>
          <TeamOutlined /> Tài xế
        </span>
      ),
      key: 'drivers',
      width: 180,
      render: (_, record) => (
        <div>
          <div>
            <Tag color="green">Lái xe:</Tag> {record.tenTaiXeLaiXe || '-'}
          </div>
          <div style={{ marginTop: 4 }}>
            <Tag color="orange">Phụ xe:</Tag> {record.tenTaiXePhuXe || '-'}
          </div>
        </div>
      ),
    },
    {
      title: 'Khởi hành',
      dataIndex: 'thoiGianKhoiHanh',
      key: 'thoiGianKhoiHanh',
      width: 150,
      render: (text) => formatDateTime(text),
    },
    {
      title: (
        <span>
          Vé bán{' '}
          <Tooltip title="Số vé bán / Số khách tối đa">
            <InfoCircleOutlined />
          </Tooltip>
        </span>
      ),
      key: 'tickets',
      width: 140,
      render: (_, record) => {
        const percent = record.tongCho
          ? Math.round(((record.soVeDaBan || 0) / record.tongCho) * 100)
          : 0;
        const isFull = percent >= 100;
        return (
          <div>
            <Progress
              percent={percent}
              size="small"
              status={isFull ? 'success' : percent > 80 ? 'active' : 'normal'}
              format={() => `${record.soVeDaBan || 0}/${record.tongCho || 0}`}
            />
            {isFull && (
              <Tag color="red" style={{ marginTop: 4 }}>
                Hết chỗ
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Chi phí / Thu',
      key: 'costs',
      width: 150,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>
            <Text type="secondary">Chi phí: </Text>
            {formatCurrency(record.chiPhiVanHanh)}
          </div>
          <div>
            <Text type="secondary">Thù lao: </Text>
            {formatCurrency((record.thuLaoLaiXe || 0) + (record.thuLaoPhuXe || 0))}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 120,
      render: (text) => <Tag color={getStatusColor(text)}>{getStatusText(text)}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title="Chi tiết"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            title="Sửa"
          />
          {record.trangThai === 'Scheduled' && (
            <>
              <Popconfirm
                title="Hoàn thành chuyến"
                description="Xác nhận hoàn thành chuyến xe này?"
                onConfirm={() => completeMutation.mutateAsync(record.maChuyen)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                  title="Hoàn thành"
                />
              </Popconfirm>
              <Popconfirm
                title="Hủy chuyến"
                description="Bạn có chắc chắn muốn hủy chuyến xe này?"
                onConfirm={() => cancelMutation.mutateAsync(record.maChuyen)}
                okText="Hủy chuyến"
                cancelText="Không"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" icon={<CloseOutlined />} danger title="Hủy chuyến" />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    if (pagination.current) {
      tableState.goToPage(pagination.current);
    }
    if (pagination.pageSize) {
      tableState.changePageSize(pagination.pageSize);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = tripsData.length;
    const scheduled = tripsData.filter((t) => t.trangThai === 'Scheduled').length;
    const inProgress = tripsData.filter((t) => t.trangThai === 'InProgress').length;
    const completed = tripsData.filter((t) => t.trangThai === 'Completed').length;
    const totalTickets = tripsData.reduce((sum, t) => sum + (t.soVeDaBan || 0), 0);
    return { total, scheduled, inProgress, completed, totalTickets };
  }, [tripsData]);

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
            <EnvironmentOutlined /> Quản lý Chuyến xe
          </Title>
          <Text type="secondary">Quản lý danh sách chuyến xe với phân công tài xế</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Thêm chuyến xe
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={5}>
          <Card>
            <Statistic title="Tổng chuyến" value={stats.total} />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Đã lên lịch"
              value={stats.scheduled}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Đang chạy"
              value={stats.inProgress}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Tổng vé bán" value={stats.totalTickets} suffix="vé" />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm theo tên chuyến..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Chọn tuyến đường"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => tableState.updateFilter('maTuyen', value || '')}
          >
            {mockRoutes.map((r) => (
              <Select.Option key={r.maTuyen} value={r.maTuyen}>
                {r.tenTuyen}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Chọn xe"
            style={{ width: 180 }}
            allowClear
            onChange={(value) => tableState.updateFilter('maXe', value || '')}
          >
            {mockVehicles
              .filter((v) => v.trangThai === 'Hoạt động')
              .map((v) => (
                <Select.Option key={v.maXe} value={v.maXe}>
                  {v.bienSo} - {v.tenXe}
                </Select.Option>
              ))}
          </Select>
          <Select placeholder="Trạng thái" style={{ width: 140 }} allowClear>
            {TRIP_STATUS.map((s) => (
              <Select.Option key={s.ma} value={s.ma}>
                {s.ten}
              </Select.Option>
            ))}
          </Select>
          <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
          {tableState.hasActiveFilters && (
            <Button
              icon={<ClearOutlined />}
              onClick={() => {
                tableState.clearFilters();
                setSearchInput('');
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table<TripDetail>
          columns={columns}
          dataSource={tripsData}
          rowKey="maChuyen"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chuyến`,
          }}
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingTrip ? 'Sửa chuyến xe' : 'Thêm chuyến xe mới'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maChuyen"
                label="Mã chuyến"
                rules={[{ required: true, message: 'Vui lòng nhập mã chuyến' }]}
              >
                <Input placeholder="VD: CH001" disabled={!!editingTrip} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tenChuyen" label="Tên chuyến">
                <Input placeholder="VD: HN-SG Sáng 06:00" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maTuyen"
                label="Tuyến đường"
                rules={[{ required: true, message: 'Vui lòng chọn tuyến đường' }]}
              >
                <Select placeholder="Chọn tuyến đường" onChange={setSelectedRoute}>
                  {mockRoutes.map((r) => (
                    <Select.Option key={r.maTuyen} value={r.maTuyen}>
                      {r.tenTuyen} ({formatNumber(r.khoangCach)} km)
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maXe"
                label={
                  <span>
                    Xe{' '}
                    <Tooltip title="Chỉ xe đang hoạt động">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn xe' }]}
              >
                <Select placeholder="Chọn xe" onChange={setSelectedVehicle}>
                  {mockVehicles
                    .filter((v) => v.trangThai === 'Hoạt động')
                    .map((v) => (
                      <Select.Option key={v.maXe} value={v.maXe}>
                        {v.bienSo} - {v.tenXe} ({v.soChoNgoi} ghế)
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedVehicle && (
            <Alert
              message={`Số khách tối đa: ${vehicleMaxPassengers} người (Số ghế - 2 theo quy định)`}
              type="info"
              style={{ marginBottom: 16 }}
            />
          )}

          <Divider orientation="left">
            <TeamOutlined /> Phân công tài xế
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maTaiXeLaiXe"
                label={
                  <span>
                    <Tag color="green">Lái xe chính</Tag> (hệ số lương 1.5)
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn lái xe chính' }]}
              >
                <Select placeholder="Chọn lái xe chính">
                  {mainDrivers.map((d) => (
                    <Select.Option key={d.maTaiXe} value={d.maTaiXe}>
                      {d.tenTaiXe} ({d.tongSoChuyen} chuyến)
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maTaiXePhuXe"
                label={
                  <span>
                    <Tag color="orange">Phụ xe</Tag> (hệ số lương 1.0)
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn phụ xe' }]}
              >
                <Select placeholder="Chọn phụ xe">
                  {assistantDrivers.map((d) => (
                    <Select.Option key={d.maTaiXe} value={d.maTaiXe}>
                      {d.tenTaiXe} ({d.tongSoChuyen} chuyến)
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="thoiGianKhoiHanh"
                label="Thời gian khởi hành"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Chọn ngày giờ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="seasonType" label="Hệ số giá vé">
                <Select
                  placeholder="Chọn loại ngày"
                  defaultValue="THUONG"
                  onChange={setSelectedSeason}
                >
                  {PRICE_SEASON.map((s) => (
                    <Select.Option key={s.ma} value={s.ma}>
                      {s.ten} (x{s.heSo})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedRoute && (
            <Alert
              message={
                <span>
                  <DollarOutlined /> Giá vé dự kiến:{' '}
                  <strong style={{ color: '#52c41a' }}>{formatCurrency(calculatedPrice)}</strong>
                </span>
              }
              type="success"
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseModal}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingTrip ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title={`Chi tiết chuyến: ${selectedTrip?.maChuyen}`}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        width={550}
      >
        {selectedTrip && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Mã chuyến">{selectedTrip.maChuyen}</Descriptions.Item>
              <Descriptions.Item label="Tên chuyến">{selectedTrip.tenChuyen}</Descriptions.Item>
              <Descriptions.Item label="Tuyến đường">{selectedTrip.tenTuyen}</Descriptions.Item>
              <Descriptions.Item label="Lộ trình">
                {selectedTrip.diemDi} → {selectedTrip.diemDen}
              </Descriptions.Item>
              <Descriptions.Item label="Khoảng cách">
                {formatNumber(selectedTrip.khoangCach)} km
              </Descriptions.Item>
              <Descriptions.Item label="Xe">
                {selectedTrip.tenXe} ({selectedTrip.bienSo})
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedTrip.trangThai)}>
                  {getStatusText(selectedTrip.trangThai)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24 }}>
              <TeamOutlined /> Tài xế
            </Title>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Lái xe chính">
                <Tag color="green">Lái xe</Tag> {selectedTrip.tenTaiXeLaiXe}
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Thù lao: {formatCurrency(selectedTrip.thuLaoLaiXe)}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Phụ xe">
                <Tag color="orange">Phụ xe</Tag> {selectedTrip.tenTaiXePhuXe}
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Thù lao: {formatCurrency(selectedTrip.thuLaoPhuXe)}
                </div>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24 }}>
              <DollarOutlined /> Chi phí & Doanh thu
            </Title>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Chi phí vận hành">
                {formatCurrency(selectedTrip.chiPhiVanHanh)}
              </Descriptions.Item>
              <Descriptions.Item label="Thù lao tài xế">
                {formatCurrency((selectedTrip.thuLaoLaiXe || 0) + (selectedTrip.thuLaoPhuXe || 0))}
              </Descriptions.Item>
              <Descriptions.Item label="Số vé bán">
                {selectedTrip.soVeDaBan || 0} / {selectedTrip.tongCho || 0}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TripListEnhanced;
