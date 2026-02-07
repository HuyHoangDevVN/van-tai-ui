/**
 * Vehicle List Page
 * Danh sách xe với tìm kiếm và phân trang
 */

import { useState } from 'react';
import { Card, Table, Button, Input, Select, Space, Tag, Typography, Popconfirm } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useVehicles, useDeleteVehicle } from '@features/admin/hooks/useVehicles';
import { useTableState } from '@features/admin/hooks/usePagination';
import { formatDate, formatNumber } from '@utils/format';
import type { VehicleSearchResult } from '@base/models/entities/vehicle';

const { Title, Text } = Typography;

interface VehicleFilters {
  status: string;
  hangSanXuat: string;
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'Hoạt động':
      return 'green';
    case 'Bảo trì':
      return 'orange';
    case 'Ngừng hoạt động':
      return 'red';
    default:
      return 'default';
  }
};

const VehicleList: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');

  const tableState = useTableState<VehicleFilters>({
    status: '',
    hangSanXuat: '',
  });

  const { data, isLoading, isError, refetch } = useVehicles(tableState.queryParams);
  const deleteMutation = useDeleteVehicle();

  const handleSearch = () => {
    tableState.setSearchText(searchInput);
  };

  const handleDelete = async (maXe: string) => {
    await deleteMutation.mutateAsync(maXe);
  };

  const columns: ColumnsType<VehicleSearchResult> = [
    {
      title: 'Mã xe',
      dataIndex: 'maXe',
      key: 'maXe',
      width: 100,
      render: (text) => (
        <Text strong style={{ color: '#1677ff' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Tên xe',
      dataIndex: 'tenXe',
      key: 'tenXe',
      render: (text) => text || '-',
    },
    {
      title: 'Biển số',
      dataIndex: 'bienSo',
      key: 'bienSo',
      width: 120,
      render: (text) => <Tag>{text || '-'}</Tag>,
    },
    {
      title: 'Hãng SX',
      dataIndex: 'hangSanXuat',
      key: 'hangSanXuat',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: 'Năm SX',
      dataIndex: 'namSanXuat',
      key: 'namSanXuat',
      width: 90,
      align: 'center',
      render: (text) => text || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (text) => <Tag color={getStatusColor(text)}>{text || '-'}</Tag>,
    },
    {
      title: 'Tổng KM',
      dataIndex: 'tongKmVanHanh',
      key: 'tongKmVanHanh',
      width: 110,
      align: 'right',
      render: (text) => formatNumber(text),
    },
    {
      title: 'Ngày đăng kiểm',
      dataIndex: 'ngayDangKiem',
      key: 'ngayDangKiem',
      width: 130,
      render: (text) => formatDate(text),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} title="Sửa" />
          <Popconfirm
            title="Xóa xe"
            description="Bạn có chắc chắn muốn xóa xe này?"
            onConfirm={() => handleDelete(record.maXe)}
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
            Quản lý Xe
          </Title>
          <Text type="secondary">Danh sách xe trong hệ thống</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm xe
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm theo tên, biển số..."
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 280 }}
          />
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Select
            placeholder="Trạng thái"
            value={tableState.filters.status || undefined}
            onChange={(value) => tableState.updateFilter('status', value || '')}
            style={{ width: 160 }}
            allowClear
          >
            <Select.Option value="Hoạt động">Hoạt động</Select.Option>
            <Select.Option value="Bảo trì">Bảo trì</Select.Option>
            <Select.Option value="Ngừng hoạt động">Ngừng hoạt động</Select.Option>
          </Select>
          <Select
            placeholder="Hãng sản xuất"
            value={tableState.filters.hangSanXuat || undefined}
            onChange={(value) => tableState.updateFilter('hangSanXuat', value || '')}
            style={{ width: 140 }}
            allowClear
          >
            <Select.Option value="Toyota">Toyota</Select.Option>
            <Select.Option value="Hyundai">Hyundai</Select.Option>
            <Select.Option value="Thaco">Thaco</Select.Option>
          </Select>
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
        <Table<VehicleSearchResult>
          columns={columns}
          dataSource={data?.items || []}
          rowKey="maXe"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: data?.pagination?.pageIndex || 1,
            pageSize: data?.pagination?.pageSize || 20,
            total: data?.pagination?.totalRecords || 0,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default VehicleList;
