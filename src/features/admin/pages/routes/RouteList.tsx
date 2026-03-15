/**
 * Route List Page
 * Quản lý danh sách tuyến đường
 */

import { useState, useMemo, useCallback } from 'react';
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
  message,
  Tooltip,
  Statistic,
  Row,
  Col,
  Grid,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ClearOutlined,
  NodeIndexOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import routeService from '@services/api/route.service';
import { formatNumber, formatCurrency } from '@utils/format';
import type {
  RouteSearchResult,
  CreateRouteDto,
  UpdateRouteDto,
} from '@base/models/entities/route';
import { ROUTE_COMPLEXITY, mockRoutes } from '@mocks/routes.mock';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Sử dụng API thật nếu có, fallback mock data
const USE_MOCK = false; // Đổi thành true để dùng mock data

const getComplexityColor = (ma: string | null) => {
  switch (ma) {
    case '1':
      return 'green';
    case '2':
      return 'orange';
    case '3':
      return 'red';
    default:
      return 'default';
  }
};

const RouteList: React.FC = () => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const [searchInput, setSearchInput] = useState('');
  const [filterComplexity, setFilterComplexity] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteSearchResult | null>(null);
  const [form] = Form.useForm();

  // Fetch routes
  const {
    data: routesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['routes', searchInput, filterComplexity],
    queryFn: async () => {
      if (USE_MOCK) {
        // Filter mock data
        let filtered = [...mockRoutes];
        if (searchInput) {
          const search = searchInput.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.tenTuyen?.toLowerCase().includes(search) ||
              r.diemDi?.toLowerCase().includes(search) ||
              r.diemDen?.toLowerCase().includes(search),
          );
        }
        if (filterComplexity) {
          filtered = filtered.filter((r) => r.maDoPhucTap === filterComplexity);
        }
        return { data: filtered };
      }
      return routeService.search({
        keyword: searchInput,
        pageIndex: 1,
        pageSize: 100,
      });
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateRouteDto) => routeService.create(data),
    onSuccess: () => {
      message.success('Thêm tuyến đường thành công');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      message.error(error.message || 'Thêm tuyến đường thất bại');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ maTuyen, data }: { maTuyen: string; data: UpdateRouteDto }) =>
      routeService.update(maTuyen, data),
    onSuccess: () => {
      message.success('Cập nhật tuyến đường thành công');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      message.error(error.message || 'Cập nhật tuyến đường thất bại');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (maTuyen: string) => routeService.remove(maTuyen),
    onSuccess: () => {
      message.success('Xóa tuyến đường thành công');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Xóa tuyến đường thất bại');
    },
  });

  const routes = USE_MOCK
    ? (routesData?.data as RouteSearchResult[]) || []
    : (routesData as any)?.data?.items || (routesData as any)?.data || [];

  const handleOpenModal = (route?: RouteSearchResult) => {
    if (route) {
      setEditingRoute(route);
      form.setFieldsValue({
        maTuyen: route.maTuyen,
        tenTuyen: route.tenTuyen,
        diemDi: route.diemDi,
        diemDen: route.diemDen,
        khoangCach: route.khoangCach,
        maDoPhucTap: route.maDoPhucTap,
      });
    } else {
      setEditingRoute(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoute(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    if (editingRoute) {
      await updateMutation.mutateAsync({
        maTuyen: editingRoute.maTuyen,
        data: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDelete = async (maTuyen: string) => {
    await deleteMutation.mutateAsync(maTuyen);
  };

  const columns: ColumnsType<RouteSearchResult> = useMemo(
    () => [
      {
        title: 'Mã tuyến',
        dataIndex: 'maTuyen',
        key: 'maTuyen',
        width: 110,
        render: (text) => (
          <Text strong style={{ color: '#1677ff' }}>
            {text}
          </Text>
        ),
      },
      {
        title: 'Tên tuyến',
        dataIndex: 'tenTuyen',
        key: 'tenTuyen',
        render: (text, record) => (
          <div>
            <div className="font-medium">{text || '-'}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {/* <NodeIndexOutlined /> {record.diemDi} → {record.diemDen} */}
            </Text>
          </div>
        ),
      },
      {
        title: 'Điểm đầu',
        dataIndex: 'diemDi',
        key: 'diemDi',
        width: 130,
        render: (text) => <Tag color="blue">{text || '-'}</Tag>,
      },
      {
        title: 'Điểm cuối',
        dataIndex: 'diemDen',
        key: 'diemDen',
        width: 130,
        render: (text) => <Tag color="green">{text || '-'}</Tag>,
      },
      {
        title: 'Khoảng cách',
        dataIndex: 'khoangCach',
        key: 'khoangCach',
        width: 120,
        align: 'right',
        render: (text) => (
          <Text strong>
            {formatNumber(text)} <span style={{ fontWeight: 'normal' }}>km</span>
          </Text>
        ),
      },
      {
        title: (
          <span>
            Độ phức tạp{' '}
            <Tooltip title="Hệ số đường khó: 1 = Đơn giản (x1.0), 2 = Trung bình (x1.3), 3 = Phức tạp (x1.6)">
              <InfoCircleOutlined />
            </Tooltip>
          </span>
        ),
        dataIndex: 'maDoPhucTap',
        key: 'maDoPhucTap',
        width: 140,
        align: 'center',
        render: (text, _record) => {
          const complexity = ROUTE_COMPLEXITY.find((c) => c.ma === text);
          return (
            <Tooltip title={complexity?.moTa}>
              <Tag color={getComplexityColor(text)}>
                {complexity?.ten || text || '-'} (x{complexity?.heSo || 1})
              </Tag>
            </Tooltip>
          );
        },
      },
      {
        title: 'Số chuyến',
        dataIndex: 'totalTrips',
        key: 'totalTrips',
        width: 100,
        align: 'center',
        render: (text) => formatNumber(text) || '0',
      },
      {
        title: 'Doanh thu',
        dataIndex: 'totalRevenue',
        key: 'totalRevenue',
        width: 150,
        align: 'right',
        render: (text) => <Text style={{ color: '#52c41a' }}>{formatCurrency(text) || '-'}</Text>,
      },
      {
        title: 'Thao tác',
        key: 'action',
        width: 120,
        align: 'center',
        render: (_, record) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
              title="Sửa"
            />
            <Popconfirm
              title="Xóa tuyến đường"
              description="Bạn có chắc chắn muốn xóa tuyến đường này?"
              onConfirm={() => handleDelete(record.maTuyen)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" icon={<DeleteOutlined />} danger title="Xóa" />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [],
  );

  // Statistics
  const stats = useMemo(() => {
    const totalRoutes = routes.length;
    const totalKm = routes.reduce(
      (sum: number, r: RouteSearchResult) => sum + (r.khoangCach || 0),
      0,
    );
    const totalRevenue = routes.reduce(
      (sum: number, r: RouteSearchResult) => sum + (r.totalRevenue || 0),
      0,
    );
    const avgKm = totalRoutes > 0 ? totalKm / totalRoutes : 0;
    return { totalRoutes, totalKm, totalRevenue, avgKm };
  }, [routes]);

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      {/* Page Header */}
      <div
        style={{
          marginBottom: isMobile ? 16 : 24,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          gap: 12,
        }}
      >
        <div>
          <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
            Quản lý Tuyến đường
          </Title>
          <Text type="secondary">Quản lý các tuyến đường vận tải</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
          block={isMobile}
        >
          Thêm tuyến
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic title="Tổng số tuyến" value={stats.totalRoutes} suffix="tuyến" />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic title="Tổng km" value={stats.totalKm} suffix="km" precision={0} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic title="TB km/tuyến" value={stats.avgKm} suffix="km" precision={0} />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size={isMobile ? 'small' : 'default'}>
            <Statistic title="Tổng doanh thu" value={stats.totalRevenue} prefix="₫" precision={0} />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }} size={isMobile ? 'small' : 'default'}>
        <Space wrap style={{ width: '100%' }} direction={isMobile ? 'vertical' : 'horizontal'}>
          <Input
            placeholder="Tìm kiếm theo tên, điểm đi/đến..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ width: isMobile ? '100%' : 300 }}
            allowClear
          />
          <Select
            placeholder="Độ phức tạp"
            value={filterComplexity || undefined}
            onChange={setFilterComplexity}
            style={{ width: isMobile ? '100%' : 160 }}
            allowClear
            options={[
              { value: '', label: 'Tất cả' },
              ...ROUTE_COMPLEXITY.map((c) => ({
                value: c.ma,
                label: `${c.ten} (x${c.heSo})`,
              })),
            ]}
          />
          <Button
            icon={<ClearOutlined />}
            onClick={() => {
              setSearchInput('');
              setFilterComplexity('');
            }}
            block={isMobile}
          >
            Xóa lọc
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Card size={isMobile ? 'small' : 'default'}>
        <div className="responsive-table-wrapper">
          <Table<RouteSearchResult>
            columns={columns}
            dataSource={routes}
            rowKey="maTuyen"
            loading={isLoading}
            scroll={{ x: 'max-content' }}
            size={isMobile ? 'small' : 'middle'}
            pagination={{
              pageSize: isMobile ? 5 : 10,
              showSizeChanger: !isMobile,
              showTotal: isMobile ? undefined : (total) => `Tổng ${total} tuyến`,
              size: isMobile ? 'small' : 'default',
            }}
          />
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRoute ? 'Sửa tuyến đường' : 'Thêm tuyến đường mới'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={isMobile ? '100%' : 600}
        style={{ top: isMobile ? 20 : undefined }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ maDoPhucTap: '1' }}
        >
          <Form.Item
            name="maTuyen"
            label="Mã tuyến"
            rules={[
              { required: true, message: 'Vui lòng nhập mã tuyến' },
              { max: 10, message: 'Mã tuyến tối đa 10 ký tự' },
            ]}
          >
            <Input placeholder="VD: TU001" disabled={!!editingRoute} />
          </Form.Item>

          <Form.Item
            name="tenTuyen"
            label="Tên tuyến"
            rules={[{ required: true, message: 'Vui lòng nhập tên tuyến' }]}
          >
            <Input placeholder="VD: Hà Nội - Hồ Chí Minh" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="diemDi"
                label="Điểm đầu"
                rules={[{ required: true, message: 'Vui lòng nhập điểm đầu' }]}
              >
                <Input placeholder="VD: Hà Nội" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="diemDen"
                label="Điểm cuối"
                rules={[{ required: true, message: 'Vui lòng nhập điểm cuối' }]}
              >
                <Input placeholder="VD: Hồ Chí Minh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="khoangCach"
                label="Khoảng cách (km)"
                rules={[
                  { required: true, message: 'Vui lòng nhập khoảng cách' },
                  { type: 'number', min: 1, message: 'Khoảng cách phải > 0' },
                ]}
              >
                <InputNumber
                  placeholder="VD: 1700"
                  style={{ width: '100%' }}
                  min={1}
                  max={5000}
                  addonAfter="km"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="maDoPhucTap"
                label={
                  <span>
                    Độ phức tạp{' '}
                    <Tooltip title="Hệ số đường khó ảnh hưởng đến lương tài xế và chu kỳ bảo dưỡng">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn độ phức tạp' }]}
              >
                <Select
                  options={ROUTE_COMPLEXITY.map((c) => ({
                    value: c.ma,
                    label: `${c.ten} (x${c.heSo}) - ${c.moTa}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space
              style={{
                width: '100%',
                justifyContent: isMobile ? 'stretch' : 'flex-end',
                flexDirection: isMobile ? 'column-reverse' : 'row',
              }}
            >
              <Button onClick={handleCloseModal} block={isMobile}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                block={isMobile}
              >
                {editingRoute ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RouteList;
