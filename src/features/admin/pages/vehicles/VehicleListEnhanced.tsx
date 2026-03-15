/**
 * Enhanced Vehicle List Page
 * Quản lý xe khách với đầy đủ ràng buộc CSDL
 *
 * Ràng buộc:
 * - Số ghế phụ thuộc loại xe
 * - Số khách tối đa = số ghế - 2
 * - Hiển thị ngày bảo dưỡng gần nhất, tiếp theo
 * - Hạn đăng kiểm
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
  InputNumber,
  DatePicker,
  message,
  Tooltip,
  Statistic,
  Row,
  Col,
  Alert,
  Descriptions,
  Drawer,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ClearOutlined,
  CarOutlined,
  EyeOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  useVehicles,
  useDeleteVehicle,
  useCreateVehicle,
  useUpdateVehicle,
} from '@features/admin/hooks/useVehicles';
import { useTableState } from '@features/admin/hooks/usePagination';
import { formatDate, formatNumber, formatCurrency } from '@utils/format';
import type {
  VehicleSearchResult,
  CreateVehicleDto,
  UpdateVehicleDto,
} from '@base/models/entities/vehicle';
import {
  VEHICLE_TYPES,
  VEHICLE_STATUS,
  getMaxPassengers,
  mockVehicles,
} from '@mocks/vehicles.mock';
import { mockMaintenanceStatus } from '@mocks/maintenance.mock';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface VehicleFilters {
  status: string;
  hangSanXuat: string;
}

// Màu status
const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'Hoạt động':
      return 'green';
    case 'Bảo trì':
      return 'orange';
    case 'Ngừng hoạt động':
      return 'red';
    default:
      return 'default';
  }
};

// Màu bảo dưỡng
const getMaintenanceStatusColor = (soNgay: number) => {
  if (soNgay <= 0) return 'red';
  if (soNgay <= 30) return 'orange';
  return 'green';
};

// Extended vehicle data với thông tin bảo dưỡng
interface VehicleWithMaintenance extends VehicleSearchResult {
  ngayBaoTriTiepTheo?: string;
  soNgayConLaiBaoTri?: number;
  hanDangKiem?: string;
  soNgayDenDangKiem?: number;
  trangThaiBaoTri?: string;
  kmTuBaoTri?: number;
}

const VehicleList: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleWithMaintenance | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithMaintenance | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
  const [form] = Form.useForm();

  const tableState = useTableState<VehicleFilters>({
    status: '',
    hangSanXuat: '',
  });

  const { data, isLoading, isError, refetch } = useVehicles(tableState.queryParams);
  const deleteMutation = useDeleteVehicle();
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();

  // Merge vehicle data với maintenance status
  const vehiclesWithMaintenance: VehicleWithMaintenance[] = useMemo(() => {
    const vehicles = data?.items || [];
    return vehicles.map((vehicle) => {
      const maintenance = mockMaintenanceStatus.find((m) => m.maXe === vehicle.maXe);
      return {
        ...vehicle,
        ngayBaoTriTiepTheo: maintenance?.ngayBaoTriTiepTheo,
        soNgayConLaiBaoTri: maintenance?.soNgayConLai,
        hanDangKiem: maintenance?.hanDangKiem,
        soNgayDenDangKiem: maintenance?.soNgayDenDangKiem,
        trangThaiBaoTri: maintenance?.trangThaiBaoTri ?? undefined,
        kmTuBaoTri: maintenance?.kmTuBaoTri,
      };
    });
  }, [data]);

  const handleSearch = () => {
    tableState.setSearchText(searchInput);
  };

  const handleOpenModal = (vehicle?: VehicleWithMaintenance) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      const vehicleType = VEHICLE_TYPES.find((t) => t.soGhe === vehicle.soChoNgoi);
      setSelectedVehicleType(vehicleType?.ma || '');
      form.setFieldsValue({
        maXe: vehicle.maXe,
        tenXe: vehicle.tenXe,
        bienSo: vehicle.bienSo,
        hangSanXuat: vehicle.hangSanXuat,
        namSanXuat: vehicle.namSanXuat,
        ngayDangKiem: vehicle.ngayDangKiem ? dayjs(vehicle.ngayDangKiem) : null,
        trangThai: vehicle.trangThai,
        mucTieuHao: vehicle.mucTieuHao,
        phuThuPhiVanHanh: vehicle.phuThuPhiVanHanh,
        loaiXe: vehicleType?.ma,
      });
    } else {
      setEditingVehicle(null);
      setSelectedVehicleType('');
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setSelectedVehicleType('');
    form.resetFields();
  };

  const handleViewDetail = (vehicle: VehicleWithMaintenance) => {
    setSelectedVehicle(vehicle);
    setIsDetailDrawerOpen(true);
  };

  const handleVehicleTypeChange = (value: string) => {
    setSelectedVehicleType(value);
    const vehicleType = VEHICLE_TYPES.find((t) => t.ma === value);
    if (vehicleType) {
      // Auto-fill số ghế dựa trên loại xe
      form.setFieldsValue({
        soChoNgoi: vehicleType.soGhe,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const vehicleType = VEHICLE_TYPES.find((t) => t.ma === values.loaiXe);
      const submitData: CreateVehicleDto = {
        maXe: values.maXe,
        tenXe: values.tenXe,
        bienSo: values.bienSo,
        hangSanXuat: values.hangSanXuat,
        namSanXuat: values.namSanXuat,
        ngayDangKiem: values.ngayDangKiem?.format('YYYY-MM-DD'),
        trangThai: values.trangThai || 'Hoạt động',
        mucTieuHao: values.mucTieuHao,
        phuThuPhiVanHanh: values.phuThuPhiVanHanh,
      };

      if (editingVehicle) {
        await updateMutation.mutateAsync({
          maXe: editingVehicle.maXe,
          data: submitData,
        });
        message.success('Cập nhật xe thành công');
      } else {
        await createMutation.mutateAsync(submitData);
        message.success('Thêm xe thành công');
      }
      handleCloseModal();
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (maXe: string) => {
    try {
      await deleteMutation.mutateAsync(maXe);
      message.success('Xóa xe thành công');
    } catch (error: any) {
      message.error(error.message || 'Xóa xe thất bại');
    }
  };

  const columns: ColumnsType<VehicleWithMaintenance> = [
    {
      title: 'Mã xe',
      dataIndex: 'maXe',
      key: 'maXe',
      width: 100,
      fixed: 'left',
      render: (text) => (
        <Text strong style={{ color: '#1677ff' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Thông tin xe',
      key: 'info',
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.tenXe || '-'}</div>
          <div style={{ fontSize: 12 }}>
            <Tag color="blue">{record.bienSo || '-'}</Tag>
            <Text type="secondary">
              {record.hangSanXuat} {record.namSanXuat}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span>
          Loại xe / Số ghế{' '}
          <Tooltip title="Số khách tối đa = Số ghế - 2">
            <InfoCircleOutlined />
          </Tooltip>
        </span>
      ),
      key: 'seats',
      width: 150,
      render: (_, record) => {
        const vehicleType = VEHICLE_TYPES.find((t) => t.soGhe === record.soChoNgoi);
        const maxPassengers = getMaxPassengers(record.soChoNgoi || 0);
        return (
          <div>
            <Tag color="purple">{vehicleType?.ten || 'N/A'}</Tag>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              <Text type="secondary">{record.soChoNgoi} ghế / </Text>
              <Text strong style={{ color: '#1677ff' }}>
                {maxPassengers} khách tối đa
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (text) => <Tag color={getStatusColor(text)}>{text || '-'}</Tag>,
    },
    {
      title: (
        <span>
          <ToolOutlined /> Bảo dưỡng
        </span>
      ),
      key: 'maintenance',
      width: 180,
      render: (_, record) => {
        const daysLeft = record.soNgayConLaiBaoTri ?? 999;
        const isOverdue = daysLeft <= 0;
        const isNearDue = daysLeft > 0 && daysLeft <= 30;
        return (
          <div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Còn lại:{' '}
              </Text>
              <Tag color={getMaintenanceStatusColor(daysLeft)}>
                {isOverdue ? `Quá hạn ${Math.abs(daysLeft)} ngày` : `${daysLeft} ngày`}
              </Tag>
            </div>
            {record.ngayBaoTriTiepTheo && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                Tiếp theo: {formatDate(record.ngayBaoTriTiepTheo)}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: (
        <span>
          <SafetyCertificateOutlined /> Đăng kiểm
        </span>
      ),
      key: 'registration',
      width: 150,
      render: (_, record) => {
        const daysLeft = record.soNgayDenDangKiem ?? 999;
        const isOverdue = daysLeft <= 0;
        return (
          <div>
            <Tag color={getMaintenanceStatusColor(daysLeft)}>
              {isOverdue ? 'Quá hạn' : formatDate(record.hanDangKiem)}
            </Tag>
            {!isOverdue && record.hanDangKiem && (
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Còn {daysLeft} ngày
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Tổng KM',
      dataIndex: 'tongKmVanHanh',
      key: 'tongKmVanHanh',
      width: 110,
      align: 'right',
      render: (text) => <Text>{formatNumber(text)} km</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
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
          <Popconfirm
            title="Xóa xe"
            description="Bạn có chắc chắn muốn xóa xe này?"
            onConfirm={() => handleDelete(record.maXe)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<DeleteOutlined />} danger title="Xóa" />
          </Popconfirm>
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
    const total = vehiclesWithMaintenance.length;
    const active = vehiclesWithMaintenance.filter((v) => v.trangThai === 'Hoạt động').length;
    const needMaintenance = vehiclesWithMaintenance.filter(
      (v) => (v.soNgayConLaiBaoTri || 999) <= 30,
    ).length;
    const overdueReg = vehiclesWithMaintenance.filter(
      (v) => (v.soNgayDenDangKiem || 999) <= 0,
    ).length;
    return { total, active, needMaintenance, overdueReg };
  }, [vehiclesWithMaintenance]);

  // Get selected vehicle type info
  const selectedTypeInfo = VEHICLE_TYPES.find((t) => t.ma === selectedVehicleType);

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
            <CarOutlined /> Quản lý Xe khách
          </Title>
          <Text type="secondary">Quản lý danh sách xe với bảo dưỡng và đăng kiểm</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Thêm xe
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng số xe" value={stats.total} suffix="xe" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cần bảo dưỡng"
              value={stats.needMaintenance}
              valueStyle={{ color: stats.needMaintenance > 0 ? '#faad14' : undefined }}
              prefix={stats.needMaintenance > 0 ? <WarningOutlined /> : null}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Quá hạn đăng kiểm"
              value={stats.overdueReg}
              valueStyle={{ color: stats.overdueReg > 0 ? '#ff4d4f' : undefined }}
              prefix={stats.overdueReg > 0 ? <WarningOutlined /> : null}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {stats.needMaintenance > 0 && (
        <Alert
          message={`Có ${stats.needMaintenance} xe cần bảo dưỡng trong 30 ngày tới`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm theo tên, biển số..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 280 }}
          />
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Select
            placeholder="Trạng thái"
            value={tableState.filters.status || undefined}
            onChange={(value) => tableState.updateFilter('status', value || '')}
            style={{ width: 160 }}
            allowClear
          >
            {VEHICLE_STATUS.map((s) => (
              <Select.Option key={s.ma} value={s.ten}>
                {s.ten}
              </Select.Option>
            ))}
          </Select>
          <Select placeholder="Loại xe" style={{ width: 140 }} allowClear>
            {VEHICLE_TYPES.map((t) => (
              <Select.Option key={t.ma} value={t.ma}>
                {t.ten}
              </Select.Option>
            ))}
          </Select>
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
        <Table<VehicleWithMaintenance>
          columns={columns}
          dataSource={vehiclesWithMaintenance}
          rowKey="maXe"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: tableState.pageIndex,
            pageSize: tableState.pageSize,
            total: data?.pagination?.totalRecords || vehiclesWithMaintenance.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} xe`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingVehicle ? 'Sửa thông tin xe' : 'Thêm xe mới'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ trangThai: 'Hoạt động' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maXe"
                label="Mã xe"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã xe' },
                  { max: 10, message: 'Mã xe tối đa 10 ký tự' },
                ]}
              >
                <Input placeholder="VD: XE001" disabled={!!editingVehicle} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bienSo"
                label="Biển số"
                rules={[
                  { required: true, message: 'Vui lòng nhập biển số' },
                  {
                    pattern: /^\d{2}[A-Z]-\d{4,5}$/,
                    message: 'Biển số không hợp lệ (VD: 29A-12345)',
                  },
                ]}
              >
                <Input placeholder="VD: 29A-12345" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="tenXe"
            label="Tên xe"
            rules={[{ required: true, message: 'Vui lòng nhập tên xe' }]}
          >
            <Input placeholder="VD: Xe Limousine Hà Nội 01" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="loaiXe"
                label={
                  <span>
                    Loại xe{' '}
                    <Tooltip title="Số ghế được tự động xác định theo loại xe">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
              >
                <Select placeholder="Chọn loại xe" onChange={handleVehicleTypeChange}>
                  {VEHICLE_TYPES.map((t) => (
                    <Select.Option key={t.ma} value={t.ma}>
                      {t.ten} ({t.soGhe} ghế)
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hangSanXuat" label="Hãng sản xuất">
                <Select placeholder="Chọn hãng">
                  <Select.Option value="Hyundai">Hyundai</Select.Option>
                  <Select.Option value="Thaco">Thaco</Select.Option>
                  <Select.Option value="Daewoo">Daewoo</Select.Option>
                  <Select.Option value="Mercedes">Mercedes</Select.Option>
                  <Select.Option value="Toyota">Toyota</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="namSanXuat"
                label="Năm sản xuất"
                rules={[{ type: 'number', min: 2000, max: 2025, message: 'Năm không hợp lệ' }]}
              >
                <InputNumber
                  placeholder="VD: 2023"
                  style={{ width: '100%' }}
                  min={2000}
                  max={2025}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Hiển thị thông tin số ghế khi chọn loại xe */}
          {selectedTypeInfo && (
            <Alert
              message={
                <span>
                  <strong>{selectedTypeInfo.ten}</strong>: {selectedTypeInfo.soGhe} ghế,{' '}
                  <strong style={{ color: '#1677ff' }}>
                    {selectedTypeInfo.soKhachToiDa} khách tối đa
                  </strong>{' '}
                  (số ghế - 2 theo quy định)
                </span>
              }
              type="info"
              style={{ marginBottom: 16 }}
            />
          )}

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="ngayDangKiem" label="Hạn đăng kiểm">
                <DatePicker placeholder="Chọn ngày" style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="trangThai" label="Trạng thái">
                <Select>
                  {VEHICLE_STATUS.map((s) => (
                    <Select.Option key={s.ma} value={s.ten}>
                      {s.ten}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mucTieuHao"
                label="Mức tiêu hao (L/100km)"
                rules={[{ type: 'number', min: 5, max: 50, message: 'Mức tiêu hao 5-50 L/100km' }]}
              >
                <InputNumber
                  placeholder="VD: 15"
                  style={{ width: '100%' }}
                  min={5}
                  max={50}
                  addonAfter="L/100km"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseModal}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingVehicle ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title={`Chi tiết xe: ${selectedVehicle?.tenXe || ''}`}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        width={500}
      >
        {selectedVehicle && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Mã xe">{selectedVehicle.maXe}</Descriptions.Item>
              <Descriptions.Item label="Tên xe">{selectedVehicle.tenXe}</Descriptions.Item>
              <Descriptions.Item label="Biển số">
                <Tag color="blue">{selectedVehicle.bienSo}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Loại xe">
                {VEHICLE_TYPES.find((t) => t.soGhe === selectedVehicle.soChoNgoi)?.ten || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Số ghế">{selectedVehicle.soChoNgoi}</Descriptions.Item>
              <Descriptions.Item label="Số khách tối đa">
                <Text strong style={{ color: '#1677ff' }}>
                  {getMaxPassengers(selectedVehicle.soChoNgoi || 0)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Hãng SX">
                {selectedVehicle.hangSanXuat} ({selectedVehicle.namSanXuat})
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedVehicle.trangThai)}>
                  {selectedVehicle.trangThai}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng KM vận hành">
                {formatNumber(selectedVehicle.tongKmVanHanh)} km
              </Descriptions.Item>
              <Descriptions.Item label="Mức tiêu hao">
                {selectedVehicle.mucTieuHao} L/100km
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24 }}>
              <ToolOutlined /> Thông tin bảo dưỡng
            </Title>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Ngày bảo dưỡng gần nhất">
                {formatDate(selectedVehicle.ngayBaoTriCuoi)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bảo dưỡng tiếp theo">
                {formatDate(selectedVehicle.ngayBaoTriTiepTheo)}
              </Descriptions.Item>
              <Descriptions.Item label="Số ngày còn lại">
                <Tag color={getMaintenanceStatusColor(selectedVehicle.soNgayConLaiBaoTri || 999)}>
                  {selectedVehicle.soNgayConLaiBaoTri && selectedVehicle.soNgayConLaiBaoTri <= 0
                    ? `Quá hạn ${Math.abs(selectedVehicle.soNgayConLaiBaoTri)} ngày`
                    : `${selectedVehicle.soNgayConLaiBaoTri || 'N/A'} ngày`}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="KM từ bảo trì gần nhất">
                {formatNumber(selectedVehicle.kmTuBaoTri)} km
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24 }}>
              <SafetyCertificateOutlined /> Thông tin đăng kiểm
            </Title>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Hạn đăng kiểm">
                {formatDate(selectedVehicle.hanDangKiem)}
              </Descriptions.Item>
              <Descriptions.Item label="Số ngày đến hạn">
                <Tag color={getMaintenanceStatusColor(selectedVehicle.soNgayDenDangKiem || 999)}>
                  {selectedVehicle.soNgayDenDangKiem && selectedVehicle.soNgayDenDangKiem <= 0
                    ? 'Quá hạn'
                    : `${selectedVehicle.soNgayDenDangKiem || 'N/A'} ngày`}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default VehicleList;
