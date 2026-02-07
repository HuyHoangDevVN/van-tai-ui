/**
 * Trip List Page
 * Danh sách chuyến xe với tìm kiếm và phân trang
 */

import { useState } from 'react';
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
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  useTrips,
  useDeleteTrip,
  useCompleteTrip,
  useCancelTrip,
} from '@features/admin/hooks/useTrips';
import { useTableState } from '@features/admin/hooks/usePagination';
import { formatDateTime } from '@utils/format';
import type { TripSearchResult } from '@base/models/entities/trip';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface TripFilters {
  maTuyen: string;
  maXe: string;
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'Scheduled':
      return 'blue';
    case 'Completed':
      return 'green';
    case 'Cancelled':
      return 'red';
    case 'InProgress':
      return 'orange';
    default:
      return 'default';
  }
};

const getStatusText = (status: string | null) => {
  switch (status) {
    case 'Scheduled':
      return 'Đã lên lịch';
    case 'Completed':
      return 'Hoàn thành';
    case 'Cancelled':
      return 'Đã hủy';
    case 'InProgress':
      return 'Đang chạy';
    default:
      return status || '-';
  }
};

const TripList: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');

  const tableState = useTableState<TripFilters>({
    maTuyen: '',
    maXe: '',
  });

  const { data, isLoading, isError, refetch } = useTrips(tableState.queryParams);
  const deleteMutation = useDeleteTrip();
  const completeMutation = useCompleteTrip();
  const cancelMutation = useCancelTrip();

  const handleSearch = () => {
    tableState.setSearchText(searchInput);
  };

  const columns: ColumnsType<TripSearchResult> = [
    {
      title: 'Mã chuyến',
      dataIndex: 'maChuyen',
      key: 'maChuyen',
      width: 110,
      render: (text) => (
        <Text strong style={{ color: '#1677ff' }}>
          {text}
        </Text>
      ),
    },
    // {
    //   title: 'Tên chuyến',
    //   dataIndex: 'tenChuyen',
    //   key: 'tenChuyen',
    //   render: (text) => text || '-',
    // },
    {
      title: 'Xe',
      dataIndex: 'tenXe',
      key: 'tenXe',
      width: 150,
      render: (text, record) => (
        <div>
          <div>{text || record.maXe || '-'}</div>
          {record.bienSo && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.bienSo}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Tuyến đường',
      dataIndex: 'tenTuyen',
      key: 'tenTuyen',
      render: (text) => text || '-',
    },
    {
      title: 'Khởi hành',
      dataIndex: 'thoiGianKhoiHanh',
      key: 'thoiGianKhoiHanh',
      width: 140,
      render: (text) => formatDateTime(text),
    },
    // {
    //   title: 'Đến',
    //   dataIndex: 'thoiGianDen',
    //   key: 'thoiGianDen',
    //   width: 140,
    //   render: (text) => formatDateTime(text),
    // },
    {
      title: 'Vé bán',
      key: 'soVeDaBan',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Text>
          {record.soVeDaBan || 0}/{record.tongCho || 0}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 120,
      render: (text) => <Tag color={getStatusColor(text)}>{getStatusText(text)}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} title="Sửa" />
          {record.trangThai === 'Scheduled' && (
            <>
              <Popconfirm
                title="Hoàn thành chuyến"
                description="Xác nhận hoàn thành chuyến xe này?"
                onConfirm={() => completeMutation.mutateAsync(record.maChuyen)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                  title="Hoàn thành"
                />
              </Popconfirm>
              <Popconfirm
                title="Hủy chuyến"
                description="Bạn có chắc chắn muốn hủy chuyến xe này?"
                onConfirm={() => cancelMutation.mutateAsync(record.maChuyen)}
                okText="Hủy chuyến"
                cancelText="Không"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" icon={<CloseOutlined />} danger title="Hủy chuyến" />
              </Popconfirm>
            </>
          )}
          <Popconfirm
            title="Xóa chuyến"
            description="Bạn có chắc chắn muốn xóa chuyến xe này?"
            onConfirm={() => deleteMutation.mutateAsync(record.maChuyen)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<DeleteOutlined />} danger title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    if (pagination.current) {
      tableState.goToPage(pagination.current);
    }
    if (pagination.pageSize) {
      tableState.changePageSize(pagination.pageSize);
    }
  };

  if (isError) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="danger">Không thể tải dữ liệu. </Text>
            <Button type="link" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Quản lý Chuyến xe
          </Title>
          <Text type="secondary">Danh sách chuyến xe trong hệ thống</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm chuyến xe
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm theo tên chuyến..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
          />
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
          {tableState.hasActiveFilters && (
            <Button
              icon={<ClearOutlined />}
              onClick={() => {
                tableState.clearFilters();
                setSearchInput('');
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table<TripSearchResult>
          columns={columns}
          dataSource={data?.items || []}
          rowKey="maChuyen"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: data?.pagination?.pageIndex || 1,
            pageSize: data?.pagination?.pageSize || 20,
            total: data?.pagination?.totalRecords || 0,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
};

export default TripList;
