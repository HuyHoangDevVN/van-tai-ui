/**
 * Search Trips Page - Minimalist Design
 * Trang tìm kiếm chuyến xe cho khách hàng
 */

import React, { useState } from 'react';
import { Typography, Form, Select, DatePicker, Button, Card, Empty, Spin, Tag, Space } from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import tripService from '@services/api/trip.service';
import routeService from '@services/api/route.service';
import { formatCurrency, formatDateTime } from '@utils/format';
import type { TripSearchResult, TripSearchParams } from '@base/models/entities/trip';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SearchTrips: React.FC = () => {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState<TripSearchParams>({});
  const [hasSearched, setHasSearched] = useState(false);

  // Lấy danh sách tuyến đường để làm options
  const { data: routesData } = useQuery({
    queryKey: ['routes'],
    queryFn: () => routeService.getAll(),
  });

  // Tìm kiếm chuyến xe
  const {
    data: tripsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['trips', 'search', searchParams],
    queryFn: () => tripService.search(searchParams),
    enabled: hasSearched,
  });

  const routes = routesData?.data ?? [];
  const trips = tripsData?.data?.items ?? [];

  // Extract unique điểm đi, điểm đến
  const diemDiOptions = [...new Set(routes.map((r) => r.diemDi).filter(Boolean))];
  const diemDenOptions = [...new Set(routes.map((r) => r.diemDen).filter(Boolean))];

  const handleSearch = (values: { diemDi?: string; diemDen?: string; ngayDi?: dayjs.Dayjs }) => {
    const params: TripSearchParams = {
      pageSize: 20,
    };

    // Find tuyến đường matching điểm đi đến
    if (values.diemDi || values.diemDen) {
      const matchingRoutes = routes.filter(
        (r) =>
          (!values.diemDi || r.diemDi === values.diemDi) &&
          (!values.diemDen || r.diemDen === values.diemDen),
      );
      if (matchingRoutes.length > 0) {
        params.maTuyen = matchingRoutes[0].maTuyen;
      }
    }

    if (values.ngayDi) {
      params.fromDate = values.ngayDi.startOf('day').format('YYYY-MM-DD');
      params.toDate = values.ngayDi.endOf('day').format('YYYY-MM-DD');
    }

    setSearchParams(params);
    setHasSearched(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Scheduled':
        return 'blue';
      case 'Running':
        return 'green';
      case 'Completed':
        return 'default';
      case 'Cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'Scheduled':
        return 'Sắp khởi hành';
      case 'Running':
        return 'Đang chạy';
      case 'Completed':
        return 'Đã hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status || 'N/A';
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)]">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Title level={2} className="!mb-2 text-center">
            Tìm chuyến xe
          </Title>
          <Text className="text-gray-500 block text-center mb-6">
            Nhập thông tin để tìm chuyến xe phù hợp
          </Text>

          {/* Search Form */}
          <Form form={form} layout="vertical" onFinish={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Form.Item name="diemDi" label="Điểm đi" className="!mb-0">
                <Select
                  placeholder="Chọn điểm đi"
                  allowClear
                  showSearch
                  size="large"
                  className="w-full"
                  options={diemDiOptions.map((d) => ({ value: d, label: d }))}
                />
              </Form.Item>

              <Form.Item name="diemDen" label="Điểm đến" className="!mb-0">
                <Select
                  placeholder="Chọn điểm đến"
                  allowClear
                  showSearch
                  size="large"
                  className="w-full"
                  options={diemDenOptions.map((d) => ({ value: d, label: d }))}
                />
              </Form.Item>

              <Form.Item name="ngayDi" label="Ngày đi" className="!mb-0">
                <DatePicker
                  placeholder="Chọn ngày"
                  size="large"
                  className="w-full"
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              <Form.Item label=" " className="!mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SearchOutlined />}
                  className="w-full !bg-gray-900 hover:!bg-gray-800 !border-0 !rounded-md !h-10"
                  loading={isFetching}
                >
                  Tìm kiếm
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {!hasSearched ? (
          <div className="text-center py-12">
            <SearchOutlined className="text-4xl text-gray-300 mb-4" />
            <Text className="text-gray-400 block">
              Nhập điều kiện tìm kiếm để xem các chuyến xe
            </Text>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <Spin size="large" />
            <Text className="text-gray-400 block mt-4">Đang tìm kiếm...</Text>
          </div>
        ) : trips.length === 0 ? (
          <Empty description="Không tìm thấy chuyến xe phù hợp" className="py-12" />
        ) : (
          <div className="space-y-4">
            <Text className="text-gray-500">
              Tìm thấy <strong>{trips.length}</strong> chuyến xe
            </Text>

            {trips.map((trip: TripSearchResult) => (
              <TripCard key={trip.maChuyen} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Trip Card Component
interface TripCardProps {
  trip: TripSearchResult;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const availableSeats = (trip.tongCho ?? 0) - (trip.soVeDaBan ?? 0);
  const isBookable = trip.trangThai === 'Scheduled' && availableSeats > 0;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Scheduled':
        return 'blue';
      case 'Running':
        return 'green';
      case 'Completed':
        return 'default';
      case 'Cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'Scheduled':
        return 'Sắp khởi hành';
      case 'Running':
        return 'Đang chạy';
      case 'Completed':
        return 'Đã hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status || 'N/A';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow" bodyStyle={{ padding: '16px 20px' }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Trip Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Text strong className="text-lg">
              {trip.tenChuyen || trip.tenTuyen || 'N/A'}
            </Text>
            <Tag color={getStatusColor(trip.trangThai)}>{getStatusText(trip.trangThai)}</Tag>
          </div>

          <Space size="large" wrap className="text-gray-500">
            <span className="flex items-center gap-1">
              <EnvironmentOutlined />
              {trip.tenTuyen || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <ClockCircleOutlined />
              {trip.thoiGianKhoiHanh ? formatDateTime(trip.thoiGianKhoiHanh) : 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <TeamOutlined />
              Còn {availableSeats}/{trip.tongCho ?? 0} chỗ
            </span>
          </Space>

          <div className="mt-2 text-sm text-gray-400">
            Xe: {trip.tenXe || 'N/A'} - Biển số: {trip.bienSo || 'N/A'}
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col items-end gap-2">
          <Text strong className="text-xl text-gray-900">
            {formatCurrency(150000)}
          </Text>
          <Link to={`/trip/${trip.maChuyen}`}>
            <Button
              type="primary"
              disabled={!isBookable}
              className="!bg-gray-900 hover:!bg-gray-800 !border-0 !rounded-md disabled:!bg-gray-300"
            >
              {isBookable ? 'Đặt vé' : 'Hết chỗ'}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default SearchTrips;
