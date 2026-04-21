import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  CheckCircleOutlined,
  HistoryOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import maintenanceService from '@services/api/maintenance.service';
import type {
  CreateMaintenanceDto,
  Maintenance,
  MaintenanceAlert,
  MaintenanceStatus,
} from '@base/models/entities/maintenance';
import { formatCurrency, formatDate, formatNumber } from '@utils/format';

const { Title, Text } = Typography;

const MaintenanceList: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'status' | 'alerts'>('status');
  const [selectedVehicle, setSelectedVehicle] = useState<MaintenanceStatus | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [form] = Form.useForm<CreateMaintenanceDto>();

  const { data: statusResponse, isLoading: isStatusLoading, error: statusError } = useQuery({
    queryKey: ['maintenance-status'],
    queryFn: () => maintenanceService.getStatus(),
  });

  const { data: alertResponse, isLoading: isAlertLoading, error: alertError } = useQuery({
    queryKey: ['maintenance-alerts'],
    queryFn: () => maintenanceService.getAlerts({ status: 'pending' }),
  });

  const { data: historyResponse, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['maintenance-history', selectedVehicle?.maXe],
    queryFn: () => maintenanceService.getHistory(selectedVehicle!.maXe),
    enabled: isHistoryModalOpen && !!selectedVehicle?.maXe,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateMaintenanceDto) => maintenanceService.create(payload),
    onSuccess: (response) => {
      if (!response.success) {
        message.error(response.message || 'Không thể ghi nhận bảo dưỡng.');
        return;
      }

      message.success('Đã ghi nhận bảo dưỡng.');
      setIsCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['maintenance-status'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-alerts'] });
    },
    onError: (error: Error) => message.error(error.message),
  });

  const resolveAlertMutation = useMutation({
    mutationFn: (id: number) => maintenanceService.resolveAlert(id, 'admin-ui'),
    onSuccess: (response) => {
      if (!response.success) {
        message.error(response.message || 'Không thể cập nhật cảnh báo.');
        return;
      }

      message.success('Đã đánh dấu cảnh báo là đã xử lý.');
      queryClient.invalidateQueries({ queryKey: ['maintenance-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-status'] });
    },
    onError: (error: Error) => message.error(error.message),
  });

  const scanMutation = useMutation({
    mutationFn: () => maintenanceService.scanAlerts(),
    onSuccess: (response) => {
      if (!response.success) {
        message.error(response.message || 'Quét cảnh báo thất bại.');
        return;
      }

      message.success(
        `Đã quét ${response.data.totalEvaluated} xe, còn ${response.data.activeAlerts} cảnh báo đang mở.`,
      );
      queryClient.invalidateQueries({ queryKey: ['maintenance-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-status'] });
    },
    onError: (error: Error) => message.error(error.message),
  });

  const statusData = statusResponse?.data ?? [];
  const alertData = alertResponse?.data ?? [];
  const historyData = historyResponse?.data ?? [];

  const stats = useMemo(() => {
    const overdueMaintenance = statusData.filter((item) => item.trangThaiBaoTri === 'Quá hạn').length;
    const dueSoonMaintenance = statusData.filter((item) => item.trangThaiBaoTri === 'Sắp đến hạn').length;
    const overdueInspection = statusData.filter((item) => item.trangThaiDangKiem === 'Quá hạn').length;

    return {
      total: statusData.length,
      overdueMaintenance,
      dueSoonMaintenance,
      overdueInspection,
      activeAlerts: alertData.length,
    };
  }, [alertData.length, statusData]);

  const openCreateModal = (vehicle: MaintenanceStatus) => {
    setSelectedVehicle(vehicle);
    form.setFieldsValue({
      maXe: vehicle.maXe,
      ngay: dayjs().format('YYYY-MM-DD'),
      soKm: vehicle.tongKmVanHanh ?? 0,
    });
    setIsCreateModalOpen(true);
  };

  const openHistoryModal = (vehicle: MaintenanceStatus) => {
    setSelectedVehicle(vehicle);
    setIsHistoryModalOpen(true);
  };

  const statusColumns: ColumnsType<MaintenanceStatus> = [
    {
      title: 'Xe',
      key: 'vehicle',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.tenXe || record.maXe}</Text>
          <Text type="secondary">{record.bienSo || record.maXe}</Text>
        </Space>
      ),
    },
    {
      title: 'Bảo dưỡng',
      key: 'maintenance',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.trangThaiBaoTri === 'Quá hạn' ? 'red' : record.trangThaiBaoTri === 'Sắp đến hạn' ? 'orange' : 'green'}>
            {record.trangThaiBaoTri || 'Chưa rõ'}
          </Tag>
          <Text type="secondary">
            Đến hạn: {formatDate(record.ngayBaoTriTiepTheo)} ({record.soNgayConLai ?? '-'} ngày)
          </Text>
        </Space>
      ),
    },
    {
      title: 'Đăng kiểm',
      key: 'inspection',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.trangThaiDangKiem === 'Quá hạn' ? 'red' : record.trangThaiDangKiem === 'Sắp đến hạn' ? 'orange' : 'green'}>
            {record.trangThaiDangKiem || 'Chưa rõ'}
          </Tag>
          <Text type="secondary">
            Hạn: {formatDate(record.ngayDangKiem)} ({record.soNgayDenDangKiem ?? '-'} ngày)
          </Text>
        </Space>
      ),
    },
    {
      title: 'KM vận hành',
      dataIndex: 'tongKmVanHanh',
      key: 'tongKmVanHanh',
      align: 'right',
      render: (value) => `${formatNumber(value)} km`,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<ToolOutlined />} onClick={() => openCreateModal(record)}>
            Ghi nhận bảo dưỡng
          </Button>
          <Button icon={<HistoryOutlined />} onClick={() => openHistoryModal(record)}>
            Lịch sử
          </Button>
        </Space>
      ),
    },
  ];

  const alertColumns: ColumnsType<MaintenanceAlert> = [
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (value) => (
        <Tag color={value === 'critical' ? 'red' : 'orange'}>
          {value === 'critical' ? 'Quá hạn' : 'Sắp đến hạn'}
        </Tag>
      ),
    },
    {
      title: 'Xe',
      key: 'vehicle',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.tenXe || record.maXe}</Text>
          <Text type="secondary">{record.bienSo || record.maXe}</Text>
        </Space>
      ),
    },
    {
      title: 'Cảnh báo',
      key: 'content',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.title}</Text>
          <Text type="secondary">{record.messageSnapshot}</Text>
        </Space>
      ),
    },
    {
      title: 'Đến hạn',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (value) => formatDate(value),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Button
          icon={<CheckCircleOutlined />}
          loading={resolveAlertMutation.isPending}
          onClick={() =>
            Modal.confirm({
              title: 'Đánh dấu đã xử lý',
              content: 'Cảnh báo này sẽ được chuyển sang trạng thái đã xử lý.',
              okText: 'Xác nhận',
              cancelText: 'Hủy',
              onOk: async () => resolveAlertMutation.mutateAsync(record.id),
            })
          }
        >
          Đã xử lý
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'status',
      label: 'Trạng thái bảo dưỡng',
      children: statusError ? (
        <Alert type="error" showIcon message="Không tải được trạng thái bảo dưỡng" description={(statusError as Error).message} />
      ) : (
        <Table
          rowKey="maXe"
          loading={isStatusLoading}
          columns={statusColumns}
          dataSource={statusData}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: <Empty description="Chưa có dữ liệu bảo dưỡng." /> }}
          scroll={{ x: 960 }}
        />
      ),
    },
    {
      key: 'alerts',
      label: `Cảnh báo đang mở (${stats.activeAlerts})`,
      children: alertError ? (
        <Alert type="error" showIcon message="Không tải được cảnh báo" description={(alertError as Error).message} />
      ) : (
        <Table
          rowKey="id"
          loading={isAlertLoading}
          columns={alertColumns}
          dataSource={alertData}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: <Empty description="Không có cảnh báo đang mở." /> }}
          scroll={{ x: 900 }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          <SafetyCertificateOutlined /> Bảo dưỡng & Đăng kiểm
        </Title>
        <Text type="secondary">
          Theo dõi trạng thái bảo dưỡng, đăng kiểm và cảnh báo vận hành theo dữ liệu thật.
        </Text>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8} xl={5}>
          <Card>
            <Statistic title="Tổng xe" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} md={8} xl={5}>
          <Card>
            <Statistic title="Quá hạn bảo dưỡng" value={stats.overdueMaintenance} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col xs={24} md={8} xl={5}>
          <Card>
            <Statistic title="Sắp đến hạn" value={stats.dueSoonMaintenance} valueStyle={{ color: '#d48806' }} />
          </Card>
        </Col>
        <Col xs={24} md={8} xl={5}>
          <Card>
            <Statistic title="Quá hạn đăng kiểm" value={stats.overdueInspection} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col xs={24} md={8} xl={4}>
          <Card>
            <Statistic title="Cảnh báo mở" value={stats.activeAlerts} valueStyle={{ color: stats.activeAlerts > 0 ? '#d48806' : '#389e0d' }} />
          </Card>
        </Col>
      </Row>

      {stats.activeAlerts > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message={`Có ${stats.activeAlerts} cảnh báo cần xử lý.`}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => queryClient.invalidateQueries({ queryKey: ['maintenance-status'] })}>
              Làm mới
            </Button>
            <Button type="primary" loading={scanMutation.isPending} onClick={() => scanMutation.mutate()}>
              Quét cảnh báo
            </Button>
          </Space>
        }
      >
        <SegmentedLikeTabs activeTab={activeTab} onChange={setActiveTab} />
        <div style={{ marginTop: 16 }}>{tabItems.find((item) => item.key === activeTab)?.children}</div>
      </Card>

      <Modal
        title={`Ghi nhận bảo dưỡng - ${selectedVehicle?.tenXe || selectedVehicle?.maXe || ''}`}
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) =>
            createMutation.mutate({
              ...values,
              maBaoTri: `BT${Date.now()}`,
              ngay: values.ngay ? dayjs(values.ngay).format('YYYY-MM-DD') : undefined,
            })
          }
        >
          <Form.Item name="maXe" label="Mã xe" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="ngay" label="Ngày bảo dưỡng" rules={[{ required: true, message: 'Chọn ngày bảo dưỡng.' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="donVi" label="Đơn vị bảo dưỡng" rules={[{ required: true, message: 'Nhập đơn vị bảo dưỡng.' }]}>
            <Input placeholder="Ví dụ: Garage Thành Công" />
          </Form.Item>
          <Form.Item name="soKm" label="Số km hiện tại" rules={[{ required: true, message: 'Nhập số km hiện tại.' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="chiPhi" label="Chi phí" rules={[{ required: true, message: 'Nhập chi phí.' }]}>
            <InputNumber style={{ width: '100%' }} min={0} addonAfter="VND" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Lịch sử bảo dưỡng - ${selectedVehicle?.tenXe || selectedVehicle?.maXe || ''}`}
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={null}
      >
        {isHistoryLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>Đang tải...</div>
        ) : historyData.length === 0 ? (
          <Empty description="Chưa có lịch sử bảo dưỡng." />
        ) : (
          <Table<Maintenance>
            rowKey="maBaoTri"
            dataSource={historyData}
            pagination={false}
            columns={[
              { title: 'Mã', dataIndex: 'maBaoTri', key: 'maBaoTri', width: 120 },
              { title: 'Ngày', dataIndex: 'ngay', key: 'ngay', render: (value) => formatDate(value) },
              { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi' },
              {
                title: 'Số km',
                dataIndex: 'soKm',
                key: 'soKm',
                align: 'right',
                render: (value) => formatNumber(value),
              },
              {
                title: 'Chi phí',
                dataIndex: 'chiPhi',
                key: 'chiPhi',
                align: 'right',
                render: (value) => formatCurrency(value ?? 0),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

const SegmentedLikeTabs: React.FC<{
  activeTab: 'status' | 'alerts';
  onChange: (value: 'status' | 'alerts') => void;
}> = ({ activeTab, onChange }) => {
  return (
    <Space>
      <Button type={activeTab === 'status' ? 'primary' : 'default'} onClick={() => onChange('status')}>
        Trạng thái bảo dưỡng
      </Button>
      <Button type={activeTab === 'alerts' ? 'primary' : 'default'} onClick={() => onChange('alerts')}>
        Cảnh báo
      </Button>
    </Space>
  );
};

export default MaintenanceList;
