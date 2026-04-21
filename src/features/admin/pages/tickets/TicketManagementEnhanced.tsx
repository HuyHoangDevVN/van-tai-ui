/**
 * Enhanced Ticket Management Page
 * Quản lý vé với đầy đủ ràng buộc
 *
 * Ràng buộc:
 * - Mã vé format: VE-{Mã chuyến}-{Số thứ tự}
 * - Số vé bán không vượt quá số ghế (số ghế - 2)
 * - Giá vé = khoảng cách × giá cơ bản × hệ số mùa
 */

import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Descriptions,
  message,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Form,
  Alert,
  Tooltip,
  Divider,
  InputNumber,
  Badge,
  Progress,
} from 'antd';
import {
  EyeOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  CreditCardOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import ticketService from '@services/api/ticket.service';
import { formatDateTime, formatCurrency, formatNumber } from '@utils/format';
import type { TicketSearchResult, TicketSearchParams } from '@base/models/entities/ticket';
import {
  mockTickets,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  type TicketDetail,
  generateTicketCode,
} from '@mocks/tickets.mock';
import { mockTrips, type TripDetail } from '@mocks/trips.mock';
import { calculateTicketPrice, PRICE_SEASON } from '@mocks/routes.mock';
import { getMaxPassengers } from '@mocks/vehicles.mock';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { confirm } = Modal;

const TicketManagementEnhanced: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTripForBooking, setSelectedTripForBooking] = useState<string>('');
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState<TicketSearchParams>({
    pageIndex: 1,
    pageSize: 10,
  });

  // Lấy danh sách vé
  const {
    data: ticketsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin-tickets', searchParams],
    queryFn: () => ticketService.search(searchParams),
  });

  const tickets: TicketDetail[] = useMemo(() => {
    return ticketsData?.data?.items?.length ? (ticketsData.data.items as TicketDetail[]) : [];
  }, [ticketsData]);

  // Statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const paid = tickets.filter((t) => t.trangThaiTT === 'Đã thanh toán').length;
    const unpaid = tickets.filter((t) => t.trangThaiTT === 'Chưa thanh toán').length;
    const cancelled = tickets.filter((t) => t.trangThaiTT === 'Đã hủy').length;
    const totalRevenue = tickets
      .filter((t) => t.trangThaiTT === 'Đã thanh toán')
      .reduce((sum, t) => sum + (t.giaVe || 0), 0);
    return { total, paid, unpaid, cancelled, totalRevenue };
  }, [tickets]);

  // Trips with availability
  const availableTrips = useMemo(() => {
    return mockTrips
      .filter((t) => t.trangThai === 'Scheduled')
      .map((trip) => {
        const soldTickets = mockTickets.filter(
          (t) => t.maChuyen === trip.maChuyen && t.trangThaiTT !== 'Đã hủy',
        ).length;
        const maxSeats = trip.tongCho || 40;
        return {
          ...trip,
          soldTickets,
          availableSeats: maxSeats - soldTickets,
          isFull: soldTickets >= maxSeats,
        };
      });
  }, []);

  // Selected trip info
  const selectedTripInfo = useMemo(() => {
    return availableTrips.find((t) => t.maChuyen === selectedTripForBooking);
  }, [selectedTripForBooking, availableTrips]);

  // Mutation hủy vé
  const cancelMutation = useMutation({
    mutationFn: (stt: number) => ticketService.cancel(stt),
    onSuccess: () => {
      message.success('Hủy vé thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Hủy vé thất bại');
    },
  });

  const handleViewDetail = (ticket: TicketDetail) => {
    setSelectedTicket(ticket);
    setDetailModalOpen(true);
  };

  const handleCancelTicket = (ticket: TicketDetail) => {
    confirm({
      title: 'Xác nhận hủy vé',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn hủy vé ${ticket.maVe || '#' + ticket.stt}?`,
      okText: 'Hủy vé',
      okType: 'danger',
      cancelText: 'Không',
      onOk() {
        cancelMutation.mutate(ticket.stt);
      },
    });
  };

  const handleSearch = (key: string, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [key]: value || undefined,
      pageIndex: 1,
    }));
  };

  const handleOpenBooking = () => {
    form.resetFields();
    setSelectedTripForBooking('');
    setIsBookingModalOpen(true);
  };

  const handleBookTicket = async (_values: any) => {
    // Validate: check if trip is full
    if (selectedTripInfo?.isFull) {
      message.error('Chuyến xe đã đầy, không thể đặt thêm vé');
      return;
    }

    try {
      // Generate ticket code
      const ticketCode = generateTicketCode(
        selectedTripInfo?.maChuyen || 'N/A',
        selectedTripInfo?.maTuyen || 'N/A',
        selectedTripInfo?.maXe || 'N/A',
        mockTickets.length + 1,
      );
      message.success(`Đặt vé thành công! Mã vé: ${ticketCode}`);
      setIsBookingModalOpen(false);
      refetch();
    } catch (error: any) {
      message.error(error.message || 'Đặt vé thất bại');
    }
  };

  const getStatusColor = (status: string | null) => {
    const statusObj = PAYMENT_STATUS.find((s) => s.ma === status);
    return statusObj?.color || 'default';
  };

  const columns: ColumnsType<TicketDetail> = [
    {
      title: 'Mã vé',
      key: 'maVe',
      width: 130,
      fixed: 'left',
      render: (_, record) => (
        <Text strong style={{ color: '#1677ff', fontFamily: 'monospace' }}>
          {record.maVe || `VE-${record.maChuyen}-${String(record.stt).padStart(3, '0')}`}
        </Text>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <UserOutlined /> {record.tenKhach || 'N/A'}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <PhoneOutlined /> {record.dienThoai || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Chuyến',
      key: 'trip',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.maChuyen}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <EnvironmentOutlined /> {record.tenTuyen || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Khởi hành',
      dataIndex: 'thoiGianKhoiHanh',
      key: 'thoiGianKhoiHanh',
      width: 140,
      render: (text) => (text ? formatDateTime(text) : 'N/A'),
    },
    {
      title: <Tooltip title="Vị trí ghế trên xe">Ghế</Tooltip>,
      dataIndex: 'viTri',
      key: 'viTri',
      width: 70,
      align: 'center',
      render: (text) => <Badge count={text || '-'} style={{ backgroundColor: '#1677ff' }} />,
    },
    {
      title: 'Giá vé',
      dataIndex: 'giaVe',
      key: 'giaVe',
      width: 120,
      render: (value) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(value || 0)}
        </Text>
      ),
    },
    {
      title: 'Phương thức TT',
      dataIndex: 'phuongThucTT',
      key: 'phuongThucTT',
      width: 130,
      render: (value) => {
        const method = PAYMENT_METHODS.find((m) => m.ma === value);
        return method ? <Tag icon={<CreditCardOutlined />}>{method.ten}</Tag> : <Tag>N/A</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThaiTT',
      key: 'trangThaiTT',
      width: 130,
      render: (status) => <Tag color={getStatusColor(status)}>{status || 'N/A'}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
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
          {record.trangThaiTT !== 'Đã hủy' && (
            <Button
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelTicket(record)}
              loading={cancelMutation.isPending}
              title="Hủy vé"
            />
          )}
        </Space>
      ),
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
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <CreditCardOutlined /> Quản lý Vé
          </Title>
          <Text type="secondary">Quản lý vé với ràng buộc số ghế và thanh toán</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={5}>
          <Card>
            <Statistic title="Tổng số vé" value={stats.total} />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic title="Đã thanh toán" value={stats.paid} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="Chưa thanh toán"
              value={stats.unpaid}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic title="Đã hủy" value={stats.cancelled} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      {/* Info */}
      <Alert
        message={
          <span>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            <strong>Quy tắc đặt vé:</strong> Mã vé = VE-{'{Mã chuyến}'}-{'{Số thứ tự}'} | Số vé tối
            đa = Số ghế xe - 2 (dành cho tài xế)
          </span>
        }
        type="info"
        style={{ marginBottom: 16 }}
      />
      <Alert
        message="Đặt vé trực tiếp từ màn admin đã được tắt trong production-lite vì flow hiện tại chưa có contract khách hàng đầy đủ ở backend."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm theo tên/SĐT/Mã vé"
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch('keyword', e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch('trangThaiTT', value)}
            >
              {PAYMENT_STATUS.map((s) => (
                <Select.Option key={s.ma} value={s.ma}>
                  {s.ten}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Phương thức TT"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch('phuongThucTT', value)}
            >
              {PAYMENT_METHODS.map((m) => (
                <Select.Option key={m.ma} value={m.ma}>
                  {m.ten}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Chuyến xe"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch('maChuyen', value)}
            >
              {mockTrips.map((t) => (
                <Select.Option key={t.maChuyen} value={t.maChuyen}>
                  {t.maChuyen} - {t.tenTuyen}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="stt"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} vé`,
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết vé: ${selectedTicket?.maVe || '#' + selectedTicket?.stt}`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={550}
      >
        {selectedTicket && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã vé">
              <Text strong copyable>
                {selectedTicket.maVe ||
                  `VE-${selectedTicket.maChuyen}-${String(selectedTicket.stt).padStart(3, '0')}`}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{selectedTicket.tenKhach}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selectedTicket.dienThoai}</Descriptions.Item>
            <Descriptions.Item label="Chuyến">{selectedTicket.maChuyen}</Descriptions.Item>
            <Descriptions.Item label="Tuyến đường">{selectedTicket.tenTuyen}</Descriptions.Item>
            <Descriptions.Item label="Khởi hành">
              {formatDateTime(selectedTicket.thoiGianKhoiHanh)}
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí ghế">
              <Badge count={selectedTicket.viTri || '-'} style={{ backgroundColor: '#1677ff' }} />
            </Descriptions.Item>
            <Descriptions.Item label="Giá vé">
              <Text strong style={{ color: '#52c41a' }}>
                {formatCurrency(selectedTicket.giaVe)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {PAYMENT_METHODS.find((m) => m.ma === selectedTicket.phuongThucTT)?.ten || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedTicket.trangThaiTT)}>
                {selectedTicket.trangThaiTT}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Booking Modal */}
      <Modal
        title="Đặt vé mới"
        open={isBookingModalOpen}
        onCancel={() => setIsBookingModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleBookTicket}>
          <Divider orientation="left">Thông tin chuyến</Divider>

          <Form.Item
            name="maChuyen"
            label="Chọn chuyến xe"
            rules={[{ required: true, message: 'Vui lòng chọn chuyến' }]}
          >
            <Select placeholder="Chọn chuyến xe" onChange={setSelectedTripForBooking}>
              {availableTrips.map((trip) => (
                <Select.Option key={trip.maChuyen} value={trip.maChuyen} disabled={trip.isFull}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      {trip.maChuyen} - {trip.tenTuyen}
                    </span>
                    <span>
                      {trip.isFull ? (
                        <Tag color="red">Hết chỗ</Tag>
                      ) : (
                        <Tag color="green">Còn {trip.availableSeats} chỗ</Tag>
                      )}
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedTripInfo && (
            <Alert
              message={
                <div>
                  <div>
                    <strong>Thông tin chuyến:</strong> {selectedTripInfo.tenTuyen}
                  </div>
                  <div>Khởi hành: {formatDateTime(selectedTripInfo.thoiGianKhoiHanh)}</div>
                  <div>
                    <Progress
                      percent={Math.round(
                        (selectedTripInfo.soldTickets / (selectedTripInfo.tongCho || 40)) * 100,
                      )}
                      size="small"
                      format={() =>
                        `${selectedTripInfo.soldTickets}/${selectedTripInfo.tongCho || 40}`
                      }
                    />
                  </div>
                </div>
              }
              type="info"
              style={{ marginBottom: 16 }}
            />
          )}

          <Divider orientation="left">Thông tin khách hàng</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tenKhach"
                label="Họ tên khách"
                rules={[{ required: true, message: 'Nhập tên khách' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dienThoai"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Nhập số điện thoại' },
                  { pattern: /^0\d{9}$/, message: 'Số điện thoại không hợp lệ' },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="0912345678" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="viTri"
                label="Số ghế (1-38 khả dụng)"
                rules={[
                  { required: true, message: 'Chọn số ghế' },
                  {
                    type: 'number',
                    max: selectedTripInfo?.tongCho || 40,
                    message: `Ghế tối đa là ${selectedTripInfo?.tongCho || 40}`,
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={selectedTripInfo?.tongCho || 40}
                  style={{ width: '100%' }}
                  placeholder="Nhập số ghế"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phuongThucTT"
                label="Phương thức thanh toán"
                rules={[{ required: true, message: 'Chọn phương thức thanh toán' }]}
              >
                <Select placeholder="Chọn phương thức">
                  {PAYMENT_METHODS.map((m) => (
                    <Select.Option key={m.ma} value={m.ma}>
                      {m.ten}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="ghiChu" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsBookingModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" disabled={selectedTripInfo?.isFull}>
                Đặt vé
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TicketManagementEnhanced;
