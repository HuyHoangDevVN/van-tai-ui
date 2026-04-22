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
  Segmented,
  Space,
  Spin,
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

type MaintenanceTab = 'status' | 'alerts';

const normalizeStatus = (value?: string | null) =>
  value?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const getStatusColor = (value?: string | null) => {
  const normalized = normalizeStatus(value);
  if (normalized?.includes('qua han')) return 'red';
  if (normalized?.includes('sap den han')) return 'orange';
  return 'green';
};

const MaintenanceList: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MaintenanceTab>('status');
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
        message.error(response.message || 'Khong the ghi nhan bao duong.');
        return;
      }

      message.success('Da ghi nhan bao duong.');
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
        message.error(response.message || 'Khong the cap nhat canh bao.');
        return;
      }

      message.success('Da danh dau canh bao la da xu ly.');
      queryClient.invalidateQueries({ queryKey: ['maintenance-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-status'] });
    },
    onError: (error: Error) => message.error(error.message),
  });

  const scanMutation = useMutation({
    mutationFn: () => maintenanceService.scanAlerts(),
    onSuccess: (response) => {
      if (!response.success) {
        message.error(response.message || 'Quet canh bao that bai.');
        return;
      }

      message.success(
        `Da quet ${response.data.totalEvaluated} xe, con ${response.data.activeAlerts} canh bao dang mo.`,
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
    const overdueMaintenance = statusData.filter((item) =>
      normalizeStatus(item.trangThaiBaoTri)?.includes('qua han'),
    ).length;
    const dueSoonMaintenance = statusData.filter((item) =>
      normalizeStatus(item.trangThaiBaoTri)?.includes('sap den han'),
    ).length;
    const overdueInspection = statusData.filter((item) =>
      normalizeStatus(item.trangThaiDangKiem)?.includes('qua han'),
    ).length;

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
      title: 'Bao duong',
      key: 'maintenance',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Tag className="admin-inline-tag" color={getStatusColor(record.trangThaiBaoTri)}>
            {record.trangThaiBaoTri || 'Chua ro'}
          </Tag>
          <Text type="secondary" className="maintenance-status-text">
            Den han: {formatDate(record.ngayBaoTriTiepTheo)} ({record.soNgayConLai ?? '-'} ngay)
          </Text>
        </Space>
      ),
    },
    {
      title: 'Dang kiem',
      key: 'inspection',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Tag className="admin-inline-tag" color={getStatusColor(record.trangThaiDangKiem)}>
            {record.trangThaiDangKiem || 'Chua ro'}
          </Tag>
          <Text type="secondary" className="maintenance-status-text">
            Han: {formatDate(record.ngayDangKiem)} ({record.soNgayDenDangKiem ?? '-'} ngay)
          </Text>
        </Space>
      ),
    },
    {
      title: 'KM van hanh',
      dataIndex: 'tongKmVanHanh',
      key: 'tongKmVanHanh',
      align: 'right',
      render: (value) => `${formatNumber(value)} km`,
    },
    {
      title: 'Thao tac',
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          <Button type="primary" icon={<ToolOutlined />} onClick={() => openCreateModal(record)}>
            Ghi nhan bao duong
          </Button>
          <Button icon={<HistoryOutlined />} onClick={() => openHistoryModal(record)}>
            Lich su
          </Button>
        </Space>
      ),
    },
  ];

  const alertColumns: ColumnsType<MaintenanceAlert> = [
    {
      title: 'Muc do',
      dataIndex: 'severity',
      key: 'severity',
      width: 140,
      render: (value) => (
        <Tag className="admin-inline-tag" color={value === 'critical' ? 'red' : 'orange'}>
          {value === 'critical' ? 'Qua han' : 'Sap den han'}
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
      title: 'Canh bao',
      key: 'content',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Text strong>{record.title}</Text>
          <Text type="secondary">{record.messageSnapshot}</Text>
        </Space>
      ),
    },
    {
      title: 'Den han',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (value) => formatDate(value),
    },
    {
      title: 'Thao tac',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Button
          icon={<CheckCircleOutlined />}
          loading={resolveAlertMutation.isPending}
          onClick={() =>
            Modal.confirm({
              title: 'Danh dau da xu ly',
              content: 'Canh bao nay se duoc chuyen sang trang thai da xu ly.',
              okText: 'Xac nhan',
              cancelText: 'Huy',
              onOk: async () => resolveAlertMutation.mutateAsync(record.id),
            })
          }
        >
          Da xu ly
        </Button>
      ),
    },
  ];

  const renderActiveTable = () => {
    if (activeTab === 'status') {
      if (statusError) {
        return (
          <Alert
            type="error"
            showIcon
            message="Khong tai duoc trang thai bao duong"
            description={(statusError as Error).message}
          />
        );
      }

      return (
        <Table
          rowKey="maXe"
          loading={isStatusLoading}
          columns={statusColumns}
          dataSource={statusData}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: <Empty description="Chua co du lieu bao duong." /> }}
          scroll={{ x: 960 }}
        />
      );
    }

    if (alertError) {
      return (
        <Alert
          type="error"
          showIcon
          message="Khong tai duoc canh bao"
          description={(alertError as Error).message}
        />
      );
    }

    return (
      <Table
        rowKey="id"
        loading={isAlertLoading}
        columns={alertColumns}
        dataSource={alertData}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        locale={{ emptyText: <Empty description="Khong co canh bao dang mo." /> }}
        scroll={{ x: 960 }}
      />
    );
  };

  return (
    <div className="admin-page">
      <section className="admin-page-hero">
        <div className="admin-page-hero__meta">
          <span className="admin-page-hero__eyebrow">
            <SafetyCertificateOutlined />
            Theo doi bao duong
          </span>
          <Title level={2} className="admin-page-hero__title">
            Bao duong va dang kiem
          </Title>
          <Text type="secondary" className="admin-page-hero__description">
            Tap trung trang thai xe, canh bao den han va lich su bao duong tren mot man hinh.
            Giao dien uu tien thao tac nhanh cho nguoi van hanh va giu nguyen luong nghiep vu hien
            tai.
          </Text>
        </div>

        <div className="admin-page-hero__aside">
          <span className="admin-page-hero__aside-label">Canh bao dang mo</span>
          <p className="admin-page-hero__aside-value">{formatNumber(stats.activeAlerts)}</p>
          <Text type="secondary">Can uu tien xe qua han va sap den han.</Text>
        </div>
      </section>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={5}>
          <Card className="admin-surface-card admin-stat-card" bordered={false}>
            <Statistic title="Tong xe" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card className="admin-surface-card admin-stat-card" bordered={false}>
            <Statistic
              title="Qua han bao duong"
              value={stats.overdueMaintenance}
              valueStyle={{ color: '#dc2626' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card className="admin-surface-card admin-stat-card" bordered={false}>
            <Statistic
              title="Sap den han"
              value={stats.dueSoonMaintenance}
              valueStyle={{ color: '#d97706' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card className="admin-surface-card admin-stat-card" bordered={false}>
            <Statistic
              title="Qua han dang kiem"
              value={stats.overdueInspection}
              valueStyle={{ color: '#dc2626' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card className="admin-surface-card admin-stat-card" bordered={false}>
            <Statistic
              title="Canh bao mo"
              value={stats.activeAlerts}
              valueStyle={{ color: stats.activeAlerts > 0 ? '#d97706' : '#15803d' }}
            />
          </Card>
        </Col>
      </Row>

      {stats.activeAlerts > 0 && (
        <Alert
          className="maintenance-alert-banner"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message={`Co ${stats.activeAlerts} canh bao can xu ly.`}
        />
      )}

      <Card className="admin-surface-card admin-filter-card" bordered={false}>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <div className="admin-section-heading">
            <div>
              <Title level={4} className="admin-section-heading__title">
                Khu vuc van hanh
              </Title>
              <Text type="secondary" className="admin-section-heading__description">
                Chuyen giua danh sach trang thai xe va danh sach canh bao dang mo.
              </Text>
            </div>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['maintenance-status'] });
                  queryClient.invalidateQueries({ queryKey: ['maintenance-alerts'] });
                }}
              >
                Lam moi
              </Button>
              <Button type="primary" loading={scanMutation.isPending} onClick={() => scanMutation.mutate()}>
                Quet canh bao
              </Button>
            </Space>
          </div>

          <Segmented<MaintenanceTab>
            className="maintenance-tab-control"
            block
            value={activeTab}
            onChange={(value) => setActiveTab(value)}
            options={[
              { label: 'Trang thai bao duong', value: 'status' },
              { label: `Canh bao dang mo (${stats.activeAlerts})`, value: 'alerts' },
            ]}
          />
        </Space>
      </Card>

      <Card className="admin-surface-card admin-table-card" bordered={false}>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <div className="admin-section-heading">
            <div>
              <Title level={4} className="admin-section-heading__title">
                {activeTab === 'status' ? 'Trang thai bao duong theo xe' : 'Danh sach canh bao'}
              </Title>
              <Text type="secondary" className="admin-section-heading__description">
                {activeTab === 'status'
                  ? 'Theo doi han bao duong, han dang kiem va thao tac ghi nhan bao duong cho tung xe.'
                  : 'Danh sach alert duoc sinh tu job kiem tra va co the danh dau da xu ly tu giao dien quan tri.'}
              </Text>
            </div>
            <div className="admin-subtle-panel">
              <Text type="secondary">
                {activeTab === 'status'
                  ? `Tong xe dang theo doi: ${formatNumber(statusData.length)}`
                  : `So canh bao dang mo: ${formatNumber(alertData.length)}`}
              </Text>
            </div>
          </div>

          {renderActiveTable()}
        </Space>
      </Card>

      <Modal
        title={`Ghi nhan bao duong - ${selectedVehicle?.tenXe || selectedVehicle?.maXe || ''}`}
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        okText="Luu"
        cancelText="Huy"
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
          <Form.Item name="maXe" label="Ma xe" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="ngay"
            label="Ngay bao duong"
            rules={[{ required: true, message: 'Chon ngay bao duong.' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="donVi"
            label="Don vi bao duong"
            rules={[{ required: true, message: 'Nhap don vi bao duong.' }]}
          >
            <Input placeholder="Vi du: Garage Thanh Cong" />
          </Form.Item>
          <Form.Item
            name="soKm"
            label="So km hien tai"
            rules={[{ required: true, message: 'Nhap so km hien tai.' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="chiPhi" label="Chi phi" rules={[{ required: true, message: 'Nhap chi phi.' }]}>
            <InputNumber style={{ width: '100%' }} min={0} addonAfter="VND" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Lich su bao duong - ${selectedVehicle?.tenXe || selectedVehicle?.maXe || ''}`}
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={null}
      >
        {isHistoryLoading ? (
          <div className="admin-data-state">
            <Spin />
          </div>
        ) : historyData.length === 0 ? (
          <Empty description="Chua co lich su bao duong." />
        ) : (
          <Table<Maintenance>
            rowKey="maBaoTri"
            dataSource={historyData}
            pagination={false}
            scroll={{ x: 720 }}
            columns={[
              { title: 'Ma', dataIndex: 'maBaoTri', key: 'maBaoTri', width: 120 },
              { title: 'Ngay', dataIndex: 'ngay', key: 'ngay', render: (value) => formatDate(value) },
              { title: 'Don vi', dataIndex: 'donVi', key: 'donVi' },
              {
                title: 'So km',
                dataIndex: 'soKm',
                key: 'soKm',
                align: 'right',
                render: (value) => formatNumber(value),
              },
              {
                title: 'Chi phi',
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

export default MaintenanceList;
