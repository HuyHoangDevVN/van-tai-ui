/**
 * Admin - Ticket Management Page
 * Quản lý danh sách vé đã đặt
 */

import React, { useState } from 'react';
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
} from 'antd';
import {
  EyeOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import ticketService from '@services/api/ticket.service';
import { formatDateTime, formatCurrency } from '@utils/format';
import type { TicketSearchResult, TicketSearchParams } from '@base/models/entities/ticket';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { confirm } = Modal;

const TicketManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<TicketSearchResult | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
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

  const tickets = ticketsData?.data?.items ?? [];
  const totalRecords = ticketsData?.data?.totalRecords ?? 0;

  const handleViewDetail = (ticket: TicketSearchResult) => {
    setSelectedTicket(ticket);
    setDetailModalOpen(true);
  };

  const handleCancelTicket = (ticket: TicketSearchResult) => {
    confirm({
      title: 'Xác nhận hủy vé',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn hủy vé #${ticket.stt}?`,
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

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Đã thanh toán':
        return 'green';
      case 'Chưa thanh toán':
        return 'orange';
      case 'Đã hủy':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<TicketSearchResult> = [
    {
      title: 'Mã vé',
      dataIndex: 'stt',
      key: 'stt',
      width: 80,
      render: (stt) => <Text strong>#{stt}</Text>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <Text strong>{record.tenKhach || 'N/A'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.dienThoai || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tuyến đường',
      dataIndex: 'tenTuyen',
      key: 'tenTuyen',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Khởi hành',
      dataIndex: 'thoiGianKhoiHanh',
      key: 'thoiGianKhoiHanh',
      render: (text) => (text ? formatDateTime(text) : 'N/A'),
    },
    {
      title: 'Ghế',
      dataIndex: 'viTri',
      key: 'viTri',
      width: 80,
      render: (text) => <Tag>{text || 'N/A'}</Tag>,
    },
    {
      title: 'Giá vé',
      dataIndex: 'giaVe',
      key: 'giaVe',
      render: (value) => formatCurrency(value || 150000),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThaiTT',
      key: 'trangThaiTT',
      render: (status) => <Tag color={getStatusColor(status)}>{status || 'N/A'}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
          {record.trangThaiTT !== 'Đã hủy' && (
            <Button
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelTicket(record)}
              loading={cancelMutation.isPending}
            >
              Hủy
            </Button>
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
            Quản lý vé
          </Title>
          <Text type="secondary">Danh sách vé đã đặt trong hệ thống</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm theo tên/SĐT"
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch('keyword', e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleSearch('trangThaiTT', value)}
              options={[
                { value: 'Đã thanh toán', label: 'Đã thanh toán' },
                { value: 'Chưa thanh toán', label: 'Chưa thanh toán' },
                { value: 'Đã hủy', label: 'Đã hủy' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Mã chuyến"
              allowClear
              onChange={(e) => handleSearch('maChuyen', e.target.value)}
            />
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
            current: searchParams.pageIndex,
            pageSize: searchParams.pageSize,
            total: totalRecords,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} vé`,
            onChange: (page, pageSize) =>
              setSearchParams((prev) => ({
                ...prev,
                pageIndex: page,
                pageSize,
              })),
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết vé #${selectedTicket?.stt}`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedTicket && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Mã vé" span={1}>
              #{selectedTicket.stt}
            </Descriptions.Item>
            <Descriptions.Item label="Mã chuyến" span={1}>
              {selectedTicket.maChuyen || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng" span={1}>
              {selectedTicket.tenKhach || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Điện thoại" span={1}>
              {selectedTicket.dienThoai || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Tuyến đường" span={2}>
              {selectedTicket.tenTuyen || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian khởi hành" span={2}>
              {selectedTicket.thoiGianKhoiHanh
                ? formatDateTime(selectedTicket.thoiGianKhoiHanh)
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí ghế" span={1}>
              {selectedTicket.viTri || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Giá vé" span={1}>
              {formatCurrency(selectedTicket.giaVe || 150000)}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức TT" span={1}>
              {selectedTicket.phuongThucTT || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag color={getStatusColor(selectedTicket.trangThaiTT)}>
                {selectedTicket.trangThaiTT || 'N/A'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian đặt" span={2}>
              {selectedTicket.thoiGianDat ? formatDateTime(selectedTicket.thoiGianDat) : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TicketManagement;
