/**
 * My Tickets Page - Minimalist Design
 * Trang vé của tôi cho khách hàng
 */

import React, { useState } from 'react';
import {
  Typography,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Descriptions,
  Empty,
  message,
} from 'antd';
import { EyeOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import ticketService from '@services/api/ticket.service';
import { formatDateTime, formatCurrency } from '@utils/format';
import { useAuth } from '@contexts/AuthContext';
import type { TicketSearchResult } from '@base/models/entities/ticket';

const { Title, Text } = Typography;
const { confirm } = Modal;

const MyTickets: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<TicketSearchResult | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Lấy danh sách vé của user
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['tickets', 'my', user?.maKhach],
    queryFn: () =>
      ticketService.search({
        maKhach: user?.maKhach,
        pageSize: 100,
      }),
    enabled: !!user?.maKhach,
  });

  // Mutation hủy vé
  const cancelMutation = useMutation({
    mutationFn: (stt: number) => ticketService.cancel(stt),
    onSuccess: () => {
      message.success('Hủy vé thành công');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Hủy vé thất bại');
    },
  });

  const tickets = ticketsData?.data?.items ?? [];

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
      render: (stt) => <Text strong>#{stt}</Text>,
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
    <div className="bg-gray-50 min-h-[calc(100vh-128px)]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Title level={3} className="!mb-6">
          Vé của tôi
        </Title>

        <Card>
          {tickets.length === 0 && !isLoading ? (
            <Empty description="Bạn chưa có vé nào" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button
                type="primary"
                href="/search"
                className="!bg-gray-900 hover:!bg-gray-800 !border-0"
              >
                Đặt vé ngay
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={tickets}
              rowKey="stt"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Tổng ${total} vé`,
              }}
            />
          )}
        </Card>
      </div>

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
      >
        {selectedTicket && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã vé">#{selectedTicket.stt}</Descriptions.Item>
            <Descriptions.Item label="Tuyến đường">
              {selectedTicket.tenTuyen || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian khởi hành">
              {selectedTicket.thoiGianKhoiHanh
                ? formatDateTime(selectedTicket.thoiGianKhoiHanh)
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí ghế">
              {selectedTicket.viTri || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Giá vé">
              {formatCurrency(selectedTicket.giaVe || 150000)}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức TT">
              {selectedTicket.phuongThucTT || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian đặt">
              {selectedTicket.thoiGianDat ? formatDateTime(selectedTicket.thoiGianDat) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedTicket.trangThaiTT)}>
                {selectedTicket.trangThaiTT || 'N/A'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MyTickets;
