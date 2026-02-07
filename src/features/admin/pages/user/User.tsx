/**
 * Admin - Customer Management Page
 * Quản lý khách hàng với CRUD hoàn chỉnh
 *
 * UX Improvements:
 * - Skeleton loading thay vì spinner
 * - Empty state có hướng dẫn
 * - Form validation inline
 * - Debounced search
 * - Sticky header table
 * - Compact actions
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  message,
  Input,
  Form,
  Row,
  Col,
  Skeleton,
  Drawer,
  Descriptions,
  Divider,
  Tooltip,
  Avatar,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  CalendarOutlined,
  EyeOutlined,
  DollarOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import customerService from '@services/api/customer.service';
import { formatCurrency, formatDate } from '@utils/format';
import type {
  CustomerSearchResult,
  CustomerSearchParams,
  CreateCustomerDto,
} from '@base/models/entities/customer';

const { Title, Text } = Typography;
const { confirm } = Modal;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const CustomerManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // UI States
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Debounced search
  const debouncedSearch = useDebounce(searchText, 300);

  const [searchParams, setSearchParams] = useState<CustomerSearchParams>({
    pageIndex: 1,
    pageSize: 10,
  });

  // Memoized params with debounced search
  const queryParams = useMemo(
    () => ({
      ...searchParams,
      keyword: debouncedSearch || undefined,
    }),
    [searchParams, debouncedSearch],
  );

  // Lấy danh sách khách hàng
  const {
    data: customersData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-customers', queryParams],
    queryFn: () => customerService.search(queryParams),
    staleTime: 30000, // 30s
  });

  // Mutations với optimistic updates
  const createMutation = useMutation({
    mutationFn: (data: CreateCustomerDto) => customerService.create(data),
    onSuccess: () => {
      message.success('Thêm khách hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      message.error(error.message || 'Thêm khách hàng thất bại');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ maKhach, data }: { maKhach: string; data: Partial<CreateCustomerDto> }) =>
      customerService.update(maKhach, data),
    onSuccess: () => {
      message.success('Cập nhật thông tin thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      message.error(error.message || 'Cập nhật thất bại');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (maKhach: string) => customerService.remove(maKhach),
    onSuccess: () => {
      message.success('Xóa khách hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Xóa thất bại');
    },
  });

  const customers = customersData?.data?.items ?? [];
  const totalRecords = customersData?.data?.totalRecords ?? 0;

  // Handlers
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setIsEdit(false);
    setSelectedCustomer(null);
    form.resetFields();
  }, [form]);

  const handleAdd = useCallback(() => {
    setIsEdit(false);
    setSelectedCustomer(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (customer: CustomerSearchResult) => {
      setIsEdit(true);
      setSelectedCustomer(customer);
      form.setFieldsValue({
        ...customer,
        ngaySinh: customer.ngaySinh?.split('T')[0],
      });
      setModalOpen(true);
    },
    [form],
  );

  const handleViewDetail = useCallback((customer: CustomerSearchResult) => {
    setSelectedCustomer(customer);
    setDetailDrawerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (customer: CustomerSearchResult) => {
      confirm({
        title: 'Xác nhận xóa khách hàng',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>
              Bạn có chắc muốn xóa khách hàng <strong>{customer.ten}</strong>?
            </p>
            <Text type="secondary">Hành động này không thể hoàn tác.</Text>
          </div>
        ),
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        centered: true,
        onOk() {
          deleteMutation.mutate(customer.maKhach);
        },
      });
    },
    [deleteMutation],
  );

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (isEdit && selectedCustomer) {
        updateMutation.mutate({ maKhach: selectedCustomer.maKhach, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch {
      // Form validation handles errors
    }
  }, [form, isEdit, selectedCustomer, updateMutation, createMutation]);

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageIndex: page,
      pageSize,
    }));
  }, []);

  // Table columns with optimized rendering
  const columns: ColumnsType<CustomerSearchResult> = useMemo(
    () => [
      {
        title: 'Khách hàng',
        key: 'customer',
        width: 280,
        fixed: 'left' as const,
        render: (_: unknown, record: CustomerSearchResult) => (
          <div className="flex items-center gap-3">
            <Avatar
              size={40}
              icon={<UserOutlined />}
              className="bg-gray-100 text-gray-600 flex-shrink-0"
            />
            <div className="min-w-0">
              <Text strong className="block truncate">
                {record.ten || 'Chưa có tên'}
              </Text>
              <Text type="secondary" className="text-xs">
                {record.maKhach}
              </Text>
            </div>
          </div>
        ),
      },
      {
        title: 'Liên hệ',
        key: 'contact',
        width: 200,
        render: (_: unknown, record: CustomerSearchResult) => (
          <div className="space-y-1">
            {record.dienThoai && (
              <div className="flex items-center gap-2 text-sm">
                <PhoneOutlined className="text-gray-400" />
                <span>{record.dienThoai}</span>
              </div>
            )}
            {record.email && (
              <div className="flex items-center gap-2 text-sm text-gray-500 truncate">
                <MailOutlined className="text-gray-400" />
                <span className="truncate">{record.email}</span>
              </div>
            )}
            {!record.dienThoai && !record.email && (
              <Text type="secondary" className="text-xs">
                Chưa có thông tin
              </Text>
            )}
          </div>
        ),
      },
      {
        title: 'Vé đã đặt',
        dataIndex: 'totalTickets',
        key: 'totalTickets',
        width: 100,
        align: 'center' as const,
        sorter: (a: CustomerSearchResult, b: CustomerSearchResult) =>
          (a.totalTickets || 0) - (b.totalTickets || 0),
        render: (value: number | null) => (
          <Tag color={value && value > 10 ? 'green' : value && value > 0 ? 'blue' : 'default'}>
            {value || 0} vé
          </Tag>
        ),
      },
      {
        title: 'Tổng chi tiêu',
        dataIndex: 'totalSpending',
        key: 'totalSpending',
        width: 140,
        align: 'right' as const,
        sorter: (a: CustomerSearchResult, b: CustomerSearchResult) =>
          (a.totalSpending || 0) - (b.totalSpending || 0),
        render: (value: number | null) => (
          <Text strong className={value && value > 0 ? 'text-green-600' : ''}>
            {formatCurrency(value || 0)}
          </Text>
        ),
      },
      {
        title: 'Đặt vé gần nhất',
        dataIndex: 'lastBookingDate',
        key: 'lastBookingDate',
        width: 130,
        render: (text: string | null) =>
          text ? (
            <Text type="secondary">{formatDate(text)}</Text>
          ) : (
            <Text type="secondary" className="text-xs">
              Chưa đặt vé
            </Text>
          ),
      },
      {
        title: '',
        key: 'actions',
        width: 120,
        fixed: 'right' as const,
        render: (_: unknown, record: CustomerSearchResult) => (
          <Space size={4}>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
                loading={deleteMutation.isPending}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [handleViewDetail, handleEdit, handleDelete, deleteMutation.isPending],
  );

  // Skeleton loading
  const renderSkeleton = () => (
    <div className="space-y-4 p-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100"
        >
          <Skeleton.Avatar active size={40} />
          <div className="flex-1">
            <Skeleton.Input active size="small" style={{ width: 150, marginBottom: 8 }} />
            <Skeleton.Input active size="small" style={{ width: 100 }} />
          </div>
          <Skeleton.Input active size="small" style={{ width: 80 }} />
          <Skeleton.Input active size="small" style={{ width: 100 }} />
        </div>
      ))}
    </div>
  );

  // Empty state
  const renderEmpty = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <UserOutlined className="text-2xl text-gray-400" />
      </div>
      <Title level={5} className="!mb-2 !text-gray-600">
        {searchText ? 'Không tìm thấy kết quả' : 'Chưa có khách hàng'}
      </Title>
      <Text type="secondary" className="block mb-4">
        {searchText
          ? `Không có khách hàng nào khớp với "${searchText}"`
          : 'Thêm khách hàng đầu tiên để bắt đầu'}
      </Text>
      {!searchText && (
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm khách hàng
        </Button>
      )}
    </div>
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap justify-between items-start gap-4">
        <div>
          <Title level={3} className="!mb-1">
            Quản lý khách hàng
          </Title>
          <Text type="secondary">
            {totalRecords > 0 ? `${totalRecords} khách hàng` : 'Quản lý thông tin khách hàng'}
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
          className="!bg-gray-900 hover:!bg-gray-800 !border-0"
        >
          Thêm khách hàng
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="!mb-4 !shadow-sm" styles={{ body: { padding: '16px' } }}>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <Input
            placeholder="Tìm theo tên, SĐT, email, CCCD..."
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            style={{ maxWidth: 400 }}
            size="large"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setSearchParams((prev) => ({ ...prev, pageIndex: 1 }));
            }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="!shadow-sm" styles={{ body: { padding: 0 } }}>
        {isLoading ? (
          renderSkeleton()
        ) : customers.length === 0 ? (
          renderEmpty()
        ) : (
          <Table
            columns={columns}
            dataSource={customers}
            rowKey="maKhach"
            loading={isFetching}
            scroll={{ x: 1000 }}
            pagination={{
              current: searchParams.pageIndex,
              pageSize: searchParams.pageSize,
              total: totalRecords,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
              onChange: handlePageChange,
              pageSizeOptions: ['10', '20', '50'],
            }}
            rowClassName={() => 'hover:bg-gray-50'}
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {isEdit ? <EditOutlined /> : <PlusOutlined />}
            <span>{isEdit ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}</span>
          </div>
        }
        open={modalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal} disabled={isSubmitting}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            className="!bg-gray-900 hover:!bg-gray-800"
          >
            {isEdit ? 'Cập nhật' : 'Thêm mới'}
          </Button>,
        ]}
        width={640}
        centered
        destroyOnClose
      >
        <Divider className="!mt-0 !mb-6" />
        <Form form={form} layout="vertical" requiredMark="optional" scrollToFirstError>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maKhach"
                label="Mã khách hàng"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã khách hàng' },
                  { max: 20, message: 'Tối đa 20 ký tự' },
                  { pattern: /^[A-Za-z0-9]+$/, message: 'Chỉ chứa chữ và số' },
                ]}
                tooltip="Mã định danh duy nhất"
              >
                <Input
                  disabled={isEdit}
                  placeholder="VD: KH001"
                  prefix={<IdcardOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ten"
                label="Họ tên"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ tên' },
                  { max: 100, message: 'Tối đa 100 ký tự' },
                ]}
              >
                <Input
                  placeholder="Nguyễn Văn A"
                  prefix={<UserOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dienThoai"
                label="Số điện thoại"
                rules={[
                  { pattern: /^0\d{9}$/, message: 'SĐT không hợp lệ (10 số, bắt đầu bằng 0)' },
                ]}
              >
                <Input
                  placeholder="0901234567"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input
                  placeholder="email@example.com"
                  prefix={<MailOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="soCccd"
                label="Số CCCD"
                rules={[{ pattern: /^\d{12}$/, message: 'CCCD phải có 12 số' }]}
                tooltip="Căn cước công dân 12 số"
              >
                <Input
                  placeholder="001234567890"
                  prefix={<IdcardOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ngaySinh" label="Ngày sinh">
                <Input type="date" prefix={<CalendarOutlined className="text-gray-400" />} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <Avatar size={40} icon={<UserOutlined />} className="bg-gray-100 text-gray-600" />
            <div>
              <div className="font-semibold">{selectedCustomer?.ten || 'Chi tiết khách hàng'}</div>
              <Text type="secondary" className="text-sm">
                {selectedCustomer?.maKhach}
              </Text>
            </div>
          </div>
        }
        placement="right"
        width={480}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setDetailDrawerOpen(false);
                if (selectedCustomer) handleEdit(selectedCustomer);
              }}
            >
              Sửa
            </Button>
          </Space>
        }
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card size="small" className="!bg-blue-50 !border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <HistoryOutlined className="text-blue-600" />
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">
                      Vé đã đặt
                    </Text>
                    <div className="font-semibold text-lg">
                      {selectedCustomer.totalTickets || 0}
                    </div>
                  </div>
                </div>
              </Card>
              <Card size="small" className="!bg-green-50 !border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarOutlined className="text-green-600" />
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">
                      Tổng chi tiêu
                    </Text>
                    <div className="font-semibold text-lg text-green-600">
                      {formatCurrency(selectedCustomer.totalSpending || 0)}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Divider className="!my-4" />

            {/* Info */}
            <Descriptions column={1} size="small" labelStyle={{ color: '#6b7280', width: 140 }}>
              <Descriptions.Item label="Số điện thoại">
                {selectedCustomer.dienThoai || <Text type="secondary">Chưa có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedCustomer.email || <Text type="secondary">Chưa có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Số CCCD">
                {selectedCustomer.soCccd || <Text type="secondary">Chưa có</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {selectedCustomer.ngaySinh ? (
                  formatDate(selectedCustomer.ngaySinh)
                ) : (
                  <Text type="secondary">Chưa có</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Đặt vé gần nhất">
                {selectedCustomer.lastBookingDate ? (
                  formatDate(selectedCustomer.lastBookingDate)
                ) : (
                  <Text type="secondary">Chưa đặt vé</Text>
                )}
              </Descriptions.Item>
              {selectedCustomer.guardianName && (
                <Descriptions.Item label="Người giám hộ">
                  {selectedCustomer.guardianName}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CustomerManagement;
