/**
 * Maintenance List Page
 * Quản lý bảo dưỡng và đăng kiểm xe
 *
 * Logic bảo dưỡng:
 * - Chu kỳ bảo dưỡng tối đa: 360 ngày
 * - Số ngày giảm: 1 ngày / 100km làm việc
 * - Km làm việc = km tuyến * hệ số đường khó
 */

import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Tag,
  Tabs,
  Statistic,
  Row,
  Col,
  Alert,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Space,
  message,
  Tooltip,
  Progress,
  Descriptions,
  Timeline,
  Empty,
} from 'antd';
import {
  ToolOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  PlusOutlined,
  HistoryOutlined,
  CarOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import maintenanceService from '@services/api/maintenance.service';
import { formatDate, formatNumber, formatCurrency } from '@utils/format';
import dayjs from 'dayjs';
import {
  mockMaintenanceStatus,
  mockMaintenanceHistory,
  MAINTENANCE_CYCLE_DAYS,
  KM_PER_DAY_REDUCTION,
  MAINTENANCE_TYPES,
  type MaintenanceStatusExtended,
} from '@mocks/maintenance.mock';
import type { CreateMaintenanceDto, Maintenance } from '@base/models/entities/maintenance';

const { Title, Text } = Typography;

// Get status icon and color
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Bình thường':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'Sắp đến hạn':
      return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    case 'Quá hạn':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Bình thường':
      return 'green';
    case 'Sắp đến hạn':
      return 'orange';
    case 'Quá hạn':
      return 'red';
    default:
      return 'default';
  }
};

// Calculate progress percentage
const calcProgress = (daysLeft: number): number => {
  if (daysLeft <= 0) return 100;
  return Math.max(0, Math.min(100, 100 - (daysLeft / MAINTENANCE_CYCLE_DAYS) * 100));
};

const MaintenanceList: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('status');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<MaintenanceStatusExtended | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch maintenance status (use mock if API not available)
  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['maintenance-status'],
    queryFn: async () => {
      try {
        const response = await maintenanceService.getStatus();
        if (response.success) {
          return response.data;
        }
        return mockMaintenanceStatus;
      } catch {
        return mockMaintenanceStatus;
      }
    },
  });

  // Fetch maintenance history
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['maintenance-history', selectedVehicle?.maXe],
    queryFn: async () => {
      if (!selectedVehicle?.maXe) return [];
      try {
        const response = await maintenanceService.getHistory(selectedVehicle.maXe);
        if (response.success) {
          return response.data;
        }
        return mockMaintenanceHistory.filter((h) => h.maXe === selectedVehicle.maXe);
      } catch {
        return mockMaintenanceHistory.filter((h) => h.maXe === selectedVehicle.maXe);
      }
    },
    enabled: !!selectedVehicle?.maXe,
  });

  // Create maintenance mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateMaintenanceDto) => maintenanceService.create(data),
    onSuccess: () => {
      message.success('Ghi nhận bảo dưỡng thành công');
      queryClient.invalidateQueries({ queryKey: ['maintenance-status'] });
      setIsAddModalOpen(false);
      form.resetFields();
    },
    onError: (error: Error) => {
      message.error(error.message || 'Có lỗi xảy ra');
    },
  });

  const maintenanceStatus = (statusData || mockMaintenanceStatus) as MaintenanceStatusExtended[];

  // Statistics
  const stats = useMemo(() => {
    const total = maintenanceStatus.length;
    const normal = maintenanceStatus.filter((v) => v.trangThaiBaoTri === 'Bình thường').length;
    const nearDue = maintenanceStatus.filter((v) => v.trangThaiBaoTri === 'Sắp đến hạn').length;
    const overdue = maintenanceStatus.filter((v) => v.trangThaiBaoTri === 'Quá hạn').length;
    const overdueRegistration = maintenanceStatus.filter(
      (v) => (v.soNgayDenDangKiem || 999) <= 0,
    ).length;
    return { total, normal, nearDue, overdue, overdueRegistration };
  }, [maintenanceStatus]);

  // Overdue vehicles list
  const overdueVehicles = useMemo(() => {
    return maintenanceStatus.filter((v) => v.trangThaiBaoTri === 'Quá hạn');
  }, [maintenanceStatus]);

  const handleAddMaintenance = (vehicle: MaintenanceStatusExtended) => {
    setSelectedVehicle(vehicle);
    form.setFieldsValue({
      maXe: vehicle.maXe,
      soKm: vehicle.tongKmVanHanh,
      ngay: dayjs(),
    });
    setIsAddModalOpen(true);
  };

  const handleViewHistory = (vehicle: MaintenanceStatusExtended) => {
    setSelectedVehicle(vehicle);
    setIsHistoryModalOpen(true);
  };

  const handleSubmitMaintenance = async (values: any) => {
    const data: CreateMaintenanceDto = {
      maBaoTri: `BT${Date.now()}`,
      maXe: values.maXe,
      donVi: values.donVi,
      chiPhi: values.chiPhi,
      ngay: values.ngay?.format('YYYY-MM-DD'),
      soKm: values.soKm,
    };
    await createMutation.mutateAsync(data);
  };

  // Main status columns
  const statusColumns: ColumnsType<MaintenanceStatusExtended> = [
    {
      title: 'Xe',
      key: 'vehicle',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CarOutlined style={{ color: '#1677ff' }} />
            <Text strong>{record.tenXe || record.maXe}</Text>
          </div>
          <Tag color="blue" style={{ marginTop: 4 }}>
            {record.bienSo}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Trạng thái xe',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 120,
      render: (text) => {
        const color = text === 'Hoạt động' ? 'green' : text === 'Bảo trì' ? 'orange' : 'red';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: (
        <span>
          <ToolOutlined /> Bảo dưỡng{' '}
          <Tooltip
            title={`Chu kỳ: ${MAINTENANCE_CYCLE_DAYS} ngày, giảm 1 ngày mỗi ${KM_PER_DAY_REDUCTION}km`}
          >
            <InfoCircleOutlined />
          </Tooltip>
        </span>
      ),
      key: 'maintenance',
      width: 280,
      render: (_, record) => {
        const progress = calcProgress(record.soNgayConLai);
        const isOverdue = record.soNgayConLai <= 0;
        return (
          <div>
            <div style={{ marginBottom: 8 }}>
              {getStatusIcon(record.trangThaiBaoTri ?? '')}
              <Tag color={getStatusColor(record.trangThaiBaoTri ?? '')} style={{ marginLeft: 8 }}>
                {record.trangThaiBaoTri}
              </Tag>
            </div>
            <Progress
              percent={progress}
              size="small"
              status={isOverdue ? 'exception' : progress > 80 ? 'active' : 'normal'}
              format={() =>
                isOverdue
                  ? `Quá ${Math.abs(record.soNgayConLai)} ngày`
                  : `Còn ${record.soNgayConLai} ngày`
              }
            />
            <div style={{ fontSize: 12, marginTop: 4 }}>
              <Text type="secondary">Tiếp theo: {formatDate(record.ngayBaoTriTiepTheo)}</Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'KM vận hành',
      key: 'km',
      width: 150,
      render: (_, record) => (
        <div>
          <Text strong>{formatNumber(record.tongKmVanHanh)} km</Text>
          <div style={{ fontSize: 12 }}>
            <Text type="secondary">Từ bảo trì: {formatNumber(record.kmTuBaoTri)} km</Text>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span>
          <SafetyCertificateOutlined /> Đăng kiểm
        </span>
      ),
      key: 'registration',
      width: 180,
      render: (_, record) => {
        const isOverdue = record.soNgayDenDangKiem <= 0;
        const isNearDue = record.soNgayDenDangKiem > 0 && record.soNgayDenDangKiem <= 30;
        return (
          <div>
            <Tag color={isOverdue ? 'red' : isNearDue ? 'orange' : 'green'}>
              {formatDate(record.hanDangKiem)}
            </Tag>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {isOverdue ? (
                <Text type="danger">Quá hạn {Math.abs(record.soNgayDenDangKiem)} ngày</Text>
              ) : (
                <Text type="secondary">Còn {record.soNgayDenDangKiem} ngày</Text>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Bảo trì gần nhất',
      dataIndex: 'ngayBaoTriCuoi',
      key: 'ngayBaoTriCuoi',
      width: 130,
      render: (text) => formatDate(text),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddMaintenance(record)}
          >
            Bảo dưỡng
          </Button>
          <Button size="small" icon={<HistoryOutlined />} onClick={() => handleViewHistory(record)}>
            Lịch sử
          </Button>
        </Space>
      ),
    },
  ];

  // Overdue vehicles columns (simplified)
  const overdueColumns: ColumnsType<MaintenanceStatusExtended> = [
    {
      title: 'Xe',
      key: 'vehicle',
      render: (_, record) => (
        <div>
          <Text strong>{record.tenXe}</Text>
          <div>
            <Tag color="blue">{record.bienSo}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Tình trạng',
      key: 'status',
      render: (_, record) => (
        <div>
          <Tag color="red">Quá hạn {Math.abs(record.soNgayConLai)} ngày</Tag>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Ngày bảo trì gần nhất: {formatDate(record.ngayBaoTriCuoi)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'KM từ bảo trì',
      dataIndex: 'kmTuBaoTri',
      key: 'kmTuBaoTri',
      render: (text) => `${formatNumber(text)} km`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<ToolOutlined />}
          onClick={() => handleAddMaintenance(record)}
        >
          Bảo dưỡng ngay
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'status',
      label: (
        <span>
          <CarOutlined /> Trạng thái bảo dưỡng
        </span>
      ),
      children: (
        <Table<MaintenanceStatusExtended>
          columns={statusColumns}
          dataSource={maintenanceStatus}
          rowKey="maXe"
          loading={isLoadingStatus}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      ),
    },
    {
      key: 'overdue',
      label: (
        <span>
          <WarningOutlined /> Xe quá hạn ({stats.overdue})
        </span>
      ),
      children:
        overdueVehicles.length > 0 ? (
          <Table<MaintenanceStatusExtended>
            columns={overdueColumns}
            dataSource={overdueVehicles}
            rowKey="maXe"
            pagination={false}
          />
        ) : (
          <Empty description="Không có xe quá hạn bảo dưỡng" />
        ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <SafetyCertificateOutlined /> Bảo dưỡng & Đăng kiểm
        </Title>
        <Text type="secondary">
          Quản lý lịch bảo dưỡng và đăng kiểm xe. Chu kỳ bảo dưỡng: {MAINTENANCE_CYCLE_DAYS} ngày,
          giảm 1 ngày mỗi {KM_PER_DAY_REDUCTION}km vận hành.
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={5}>
          <Card>
            <Statistic title="Tổng số xe" value={stats.total} />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Bình thường"
              value={stats.normal}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Sắp đến hạn"
              value={stats.nearDue}
              valueStyle={{ color: '#faad14' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Quá hạn bảo dưỡng"
              value={stats.overdue}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Quá hạn đăng kiểm"
              value={stats.overdueRegistration}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {stats.overdue > 0 && (
        <Alert
          message={
            <span>
              <strong>Cảnh báo:</strong> Có {stats.overdue} xe quá hạn bảo dưỡng cần xử lý ngay!
            </span>
          }
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {stats.nearDue > 0 && (
        <Alert
          message={`Có ${stats.nearDue} xe sắp đến hạn bảo dưỡng trong 30 ngày tới`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Info Card */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          <InfoCircleOutlined /> Quy tắc tính ngày bảo dưỡng
        </Title>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Chu kỳ bảo dưỡng">
            {MAINTENANCE_CYCLE_DAYS} ngày
          </Descriptions.Item>
          <Descriptions.Item label="Giảm ngày theo KM">
            1 ngày / {KM_PER_DAY_REDUCTION} km vận hành
          </Descriptions.Item>
          <Descriptions.Item label="Công thức KM thực tế" span={2}>
            <code>KM thực tế = KM tuyến × Hệ số đường khó</code>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Main Table */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* Add Maintenance Modal */}
      <Modal
        title={
          <span>
            <ToolOutlined /> Ghi nhận bảo dưỡng - {selectedVehicle?.tenXe}
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitMaintenance}>
          <Form.Item name="maXe" label="Mã xe">
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="ngay"
            label="Ngày bảo dưỡng"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="loaiBaoTri"
            label="Loại bảo dưỡng"
            rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
          >
            <Select placeholder="Chọn loại bảo dưỡng">
              {MAINTENANCE_TYPES.map((t) => (
                <Select.Option key={t.ma} value={t.ma}>
                  {t.ten}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="donVi"
            label="Đơn vị bảo dưỡng"
            rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
          >
            <Input placeholder="VD: Garage Thành Công" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="soKm"
                label="Số KM hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập số KM' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="km"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="chiPhi"
                label="Chi phí"
                rules={[{ required: true, message: 'Vui lòng nhập chi phí' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="VND"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="ghiChu" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Mô tả công việc bảo dưỡng..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setIsAddModalOpen(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                Lưu bảo dưỡng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* History Modal */}
      <Modal
        title={
          <span>
            <HistoryOutlined /> Lịch sử bảo dưỡng - {selectedVehicle?.tenXe}
          </span>
        }
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={<Button onClick={() => setIsHistoryModalOpen(false)}>Đóng</Button>}
        width={600}
      >
        {historyData && historyData.length > 0 ? (
          <Timeline mode="left">
            {historyData.map((item: Maintenance) => (
              <Timeline.Item key={item.maBaoTri} label={formatDate(item.ngay)} color="blue">
                <Card size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Đơn vị">{item.donVi}</Descriptions.Item>
                    <Descriptions.Item label="Số KM">
                      {formatNumber(item.soKm)} km
                    </Descriptions.Item>
                    <Descriptions.Item label="Chi phí">
                      {formatCurrency(item.chiPhi)}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <Empty description="Chưa có lịch sử bảo dưỡng" />
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceList;
