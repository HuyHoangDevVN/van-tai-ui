/**
 * Trip Detail Page - Minimalist Design
 * Trang chi tiết chuyến xe + chọn ghế
 */

import React, { useState } from 'react';
import { Typography, Card, Button, Spin, Alert, Tag, Divider, Space } from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import tripService from '@services/api/trip.service';
import ticketService from '@services/api/ticket.service';
import { formatDateTime, formatCurrency } from '@utils/format';
import { useAuth } from '@contexts/AuthContext';

const { Title, Text } = Typography;

interface SeatInfo {
  id: number;
  viTri: string;
  isBooked: boolean;
}

const TripDetail: React.FC = () => {
  const { tripId } = useParams({ from: '/trip/$tripId' });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedSeat, setSelectedSeat] = useState<SeatInfo | null>(null);

  // Lấy thông tin chuyến xe
  const {
    data: tripData,
    isLoading: tripLoading,
    error: tripError,
  } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripService.getById(tripId),
    enabled: !!tripId,
  });

  // Lấy danh sách vé đã đặt của chuyến
  const { data: ticketsData } = useQuery({
    queryKey: ['tickets', 'trip', tripId],
    queryFn: () => ticketService.getByTrip(tripId),
    enabled: !!tripId,
  });

  const trip = tripData?.data;
  const bookedTickets = ticketsData?.data ?? [];

  // Generate seats (mock - normally from backend)
  const totalSeats = 45; // Default bus seats
  const seats: SeatInfo[] = Array.from({ length: totalSeats }, (_, i) => {
    const row = Math.floor(i / 4) + 1;
    const col = String.fromCharCode(65 + (i % 4)); // A, B, C, D
    const viTri = `${col}${row}`;
    const isBooked = bookedTickets.some((t) => t.viTri === viTri);
    return { id: i + 1, viTri, isBooked };
  });

  const handleSelectSeat = (seat: SeatInfo) => {
    if (seat.isBooked) return;
    setSelectedSeat(selectedSeat?.id === seat.id ? null : seat);
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate({ to: '/auth/login' });
      return;
    }
    if (selectedSeat) {
      navigate({
        to: '/booking',
        search: { tripId, seatId: selectedSeat.id.toString(), viTri: selectedSeat.viTri },
      });
    }
  };

  if (tripLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (tripError || !trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert
          message="Không tìm thấy chuyến xe"
          description="Chuyến xe bạn tìm kiếm không tồn tại hoặc đã bị xóa."
          type="error"
          showIcon
        />
        <Link to="/search" className="mt-4 inline-block">
          <Button icon={<ArrowLeftOutlined />}>Quay lại tìm kiếm</Button>
        </Link>
      </div>
    );
  }

  const isBookable = trip.trangThai === 'Scheduled';

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          to="/search"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftOutlined />
          Quay lại
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trip Info */}
          <div className="lg:col-span-2">
            <Card title="Thông tin chuyến xe" className="mb-6">
              <div className="space-y-4">
                <div>
                  <Title level={4} className="!mb-2">
                    {trip.tenChuyen || 'N/A'}
                  </Title>
                  <Tag color={trip.trangThai === 'Scheduled' ? 'blue' : 'default'}>
                    {trip.trangThai === 'Scheduled' ? 'Sắp khởi hành' : trip.trangThai}
                  </Tag>
                </div>

                <Divider className="!my-4" />

                <Space direction="vertical" size="middle" className="w-full">
                  <div className="flex items-center gap-3">
                    <EnvironmentOutlined className="text-gray-400" />
                    <div>
                      <Text className="text-gray-500 text-sm block">Tuyến đường</Text>
                      <Text strong>{trip.maTuyen || 'N/A'}</Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ClockCircleOutlined className="text-gray-400" />
                    <div>
                      <Text className="text-gray-500 text-sm block">Khởi hành</Text>
                      <Text strong>
                        {trip.thoiGianKhoiHanh ? formatDateTime(trip.thoiGianKhoiHanh) : 'N/A'}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ClockCircleOutlined className="text-gray-400" />
                    <div>
                      <Text className="text-gray-500 text-sm block">Dự kiến đến</Text>
                      <Text strong>
                        {trip.thoiGianDen ? formatDateTime(trip.thoiGianDen) : 'N/A'}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CarOutlined className="text-gray-400" />
                    <div>
                      <Text className="text-gray-500 text-sm block">Xe</Text>
                      <Text strong>{trip.maXe || 'N/A'}</Text>
                    </div>
                  </div>
                </Space>
              </div>
            </Card>

            {/* Seat Selection */}
            {isBookable && (
              <Card title="Chọn ghế">
                <div className="mb-4 flex items-center gap-6">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></span>
                    <Text className="text-sm">Còn trống</Text>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-gray-400 rounded"></span>
                    <Text className="text-sm">Đã đặt</Text>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-gray-900 rounded"></span>
                    <Text className="text-sm">Đang chọn</Text>
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                  {seats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSelectSeat(seat)}
                      disabled={seat.isBooked}
                      className={`
                        w-10 h-10 rounded flex items-center justify-center text-sm font-medium
                        transition-colors
                        ${
                          seat.isBooked
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : selectedSeat?.id === seat.id
                              ? 'bg-gray-900 text-white'
                              : 'bg-white border-2 border-gray-300 hover:border-gray-900'
                        }
                      `}
                    >
                      {seat.viTri}
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <Title level={5} className="!mb-4">
                Thông tin đặt vé
              </Title>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <Text className="text-gray-500">Ghế đã chọn:</Text>
                  <Text strong>{selectedSeat?.viTri || 'Chưa chọn'}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-gray-500">Giá vé:</Text>
                  <Text strong>{formatCurrency(150000)}</Text>
                </div>
              </div>

              <Divider className="!my-4" />

              <div className="flex justify-between mb-6">
                <Text strong>Tổng cộng:</Text>
                <Text strong className="text-xl text-gray-900">
                  {selectedSeat ? formatCurrency(150000) : formatCurrency(0)}
                </Text>
              </div>

              <Button
                type="primary"
                size="large"
                block
                disabled={!selectedSeat || !isBookable}
                onClick={handleBooking}
                className="!bg-gray-900 hover:!bg-gray-800 !border-0 !rounded-md disabled:!bg-gray-300"
              >
                {!isAuthenticated ? 'Đăng nhập để đặt vé' : 'Tiếp tục đặt vé'}
              </Button>

              {!isBookable && (
                <Alert
                  message="Chuyến xe không thể đặt vé"
                  type="warning"
                  showIcon
                  className="mt-4"
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
