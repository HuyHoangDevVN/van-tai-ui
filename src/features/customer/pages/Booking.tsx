/**
 * Booking Page - Minimalist Design
 * Trang đặt vé cho khách hàng
 */

import React, { useState } from 'react';
import {
  Typography,
  Card,
  Form,
  Input,
  Button,
  Spin,
  Alert,
  Result,
  Divider,
  Space,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearch, useNavigate } from '@tanstack/react-router';
import tripService from '@services/api/trip.service';
import ticketService from '@services/api/ticket.service';
import { formatDateTime, formatCurrency } from '@utils/format';
import { useAuth } from '@contexts/AuthContext';

const { Title, Text } = Typography;

interface BookingFormValues {
  tenKhach: string;
  dienThoai: string;
}

const Booking: React.FC = () => {
  const searchParams = useSearch({ from: '/booking' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);

  const tripId = searchParams.tripId as string;
  const seatId = searchParams.seatId as string;
  const viTri = searchParams.viTri as string;

  // Lấy thông tin chuyến xe
  const { data: tripData, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripService.getById(tripId),
    enabled: !!tripId,
  });

  // Mutation đặt vé
  const bookMutation = useMutation({
    mutationFn: ticketService.book.bind(ticketService),
    onSuccess: (response) => {
      setTicketId((response as { data: number }).data);
      setBookingSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      message.success('Đặt vé thành công!');
    },
    onError: (error: Error) => {
      message.error(error.message || 'Đặt vé thất bại');
    },
  });

  const trip = tripData?.data;

  // Redirect nếu không đăng nhập
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/auth/login' });
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill form với thông tin user
  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        tenKhach: user.name,
        dienThoai: user.phone || '',
      });
    }
  }, [user, form]);

  const handleSubmit = async (_values: BookingFormValues) => {
    if (!user?.maKhach || !tripId) return;

    bookMutation.mutate({
      maKhach: user.maKhach,
      maChuyen: tripId,
      phuongThucTT: 'Tiền mặt',
      viTri: viTri,
      maGhe: parseInt(seatId),
    });
  };

  if (tripLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!tripId || !seatId || !viTri) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Alert
          message="Thiếu thông tin đặt vé"
          description="Vui lòng chọn chuyến xe và ghế trước khi đặt vé."
          type="error"
          showIcon
        />
        <Link to="/search" className="mt-4 inline-block">
          <Button icon={<ArrowLeftOutlined />}>Quay lại tìm kiếm</Button>
        </Link>
      </div>
    );
  }

  // Success state
  if (bookingSuccess) {
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-128px)] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <Result
            icon={<CheckCircleOutlined className="text-green-500" />}
            title="Đặt vé thành công!"
            subTitle={`Mã vé của bạn: #${ticketId}`}
            extra={[
              <Link key="tickets" to="/my-tickets">
                <Button type="primary" className="!bg-gray-900 hover:!bg-gray-800 !border-0">
                  Xem vé của tôi
                </Button>
              </Link>,
              <Link key="search" to="/search">
                <Button>Đặt vé khác</Button>
              </Link>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          to={`/trip/${tripId}`}
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftOutlined />
          Quay lại chọn ghế
        </Link>

        <Title level={3} className="!mb-6">
          Xác nhận đặt vé
        </Title>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Booking Form */}
          <div className="md:col-span-3">
            <Card title="Thông tin hành khách">
              <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
                <Form.Item
                  name="tenKhach"
                  label={<span className="font-medium">Họ và tên</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Nguyễn Văn A"
                    size="large"
                    className="!rounded-md"
                  />
                </Form.Item>

                <Form.Item
                  name="dienThoai"
                  label={<span className="font-medium">Số điện thoại</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="0901234567"
                    size="large"
                    className="!rounded-md"
                  />
                </Form.Item>

                <Divider />

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={bookMutation.isPending}
                  className="!bg-gray-900 hover:!bg-gray-800 !border-0 !rounded-md !h-12 !font-medium"
                >
                  Xác nhận đặt vé
                </Button>
              </Form>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="md:col-span-2">
            <Card title="Chi tiết đặt vé" className="sticky top-24">
              <Space direction="vertical" size="small" className="w-full">
                <div className="flex justify-between">
                  <Text className="text-gray-500">Chuyến xe:</Text>
                  <Text strong>{trip?.tenChuyen || tripId}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-gray-500">Khởi hành:</Text>
                  <Text>
                    {trip?.thoiGianKhoiHanh ? formatDateTime(trip.thoiGianKhoiHanh) : 'N/A'}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-gray-500">Ghế:</Text>
                  <Text strong>{viTri}</Text>
                </div>
              </Space>

              <Divider className="!my-4" />

              <div className="flex justify-between">
                <Text strong>Tổng cộng:</Text>
                <Text strong className="text-xl text-gray-900">
                  {formatCurrency(150000)}
                </Text>
              </div>

              <Text className="text-gray-400 text-sm block mt-4">* Thanh toán khi lên xe</Text>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
