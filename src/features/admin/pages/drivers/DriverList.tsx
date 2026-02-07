/**
 * Driver List Page
 * Danh sách tài xế với tìm kiếm và phân trang
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
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
  Skeleton,
  Empty,
  Drawer,
  Descriptions,
  Avatar,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClearOutlined,
  UserOutlined,
  IdcardOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from '@tanstack/react-router';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useDrivers, useDeleteDriver, useDriver, useDebounce } from '@features/admin/hooks';
import { useTableState } from '@features/admin/hooks/usePagination';
import { formatDate } from '@utils/format';
import type { DriverSearchResult } from '@base/models/entities/driver';

const { Title, Text } = Typography;

interface DriverFilters {
  gioiTinh: string;
  queQuan: string;
}

// Skeleton rows for loading state
const SkeletonRow = () => (
  <div className="flex items-center gap-4 py-3 px-4 border-b border-gray-100">
    <Skeleton.Avatar active size="small" />
    <div className="flex-1 grid grid-cols-7 gap-4">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Skeleton.Input key={i} active size="small" style={{ width: '100%' }} />
      ))}
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white rounded-lg">
    <div className="flex items-center gap-4 py-3 px-4 bg-gray-50 border-b">
      {['Mã tài xế', 'Tên tài xế', 'Giới tính', 'Ngày sinh', 'Quê quán', 'CCCD', 'Thao tác'].map(
        (header) => (
          <div key={header} className="flex-1 font-medium text-gray-600 text-sm">
            {header}
          </div>
        ),
      )}
    </div>
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
);

const DriverList: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);

  const tableState = useTableState<DriverFilters>({
    gioiTinh: '',
    queQuan: '',
  });

  // Update search when debounced value changes
  useEffect(() => {
    tableState.setSearchText(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading, isError, refetch } = useDrivers(tableState.queryParams);
  const deleteMutation = useDeleteDriver();
  const { data: driverDetail, isLoading: isDetailLoading } = useDriver(selectedDriver || undefined);

  const handleDelete = useCallback(
    async (maTaiXe: string) => {
      await deleteMutation.mutateAsync(maTaiXe);
    },
    [deleteMutation],
  );

  const columns: ColumnsType<DriverSearchResult> = useMemo(
    () => [
      {
        title: 'Mã tài xế',
        dataIndex: 'maTaiXe',
        key: 'maTaiXe',
        width: 120,
        render: (text) => (
          <Text strong className="text-blue-600">
            {text}
          </Text>
        ),
      },
      {
        title: 'Tên tài xế',
        dataIndex: 'tenTaiXe',
        key: 'tenTaiXe',
        render: (text) => (
          <div className="flex items-center gap-2">
            <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
            <span className="font-medium">{text || '-'}</span>
          </div>
        ),
      },
      {
        title: 'Giới tính',
        dataIndex: 'gioiTinh',
        key: 'gioiTinh',
        width: 100,
        render: (text) => (
          <Tag color={text === 'Nam' ? 'blue' : 'magenta'} className="!m-0">
            {text || '-'}
          </Tag>
        ),
      },
      {
        title: 'Ngày sinh',
        dataIndex: 'ngaySinh',
        key: 'ngaySinh',
        width: 120,
        render: (text) => <span className="text-gray-600">{formatDate(text)}</span>,
      },
      {
        title: 'Quê quán',
        dataIndex: 'queQuan',
        key: 'queQuan',
        render: (text) => text || <span className="text-gray-400">-</span>,
      },
      {
        title: 'CCCD',
        dataIndex: 'soCccd',
        key: 'soCccd',
        width: 140,
        render: (text) =>
          text ? (
            <span className="font-mono text-sm">{text}</span>
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
      {
        title: 'Thao tác',
        key: 'action',
        width: 140,
        align: 'center',
        render: (_, record) => (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelectedDriver(record.maTaiXe)}
              title="Xem nhanh"
            />
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate({ to: `/admin/drivers/${record.maTaiXe}/edit` })}
              title="Sửa"
            />
            <Popconfirm
              title="Xóa tài xế"
              description="Bạn có chắc chắn muốn xóa tài xế này?"
              onConfirm={() => handleDelete(record.maTaiXe)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" size="small" icon={<DeleteOutlined />} danger title="Xóa" />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [navigate, handleDelete],
  );

  const handleTableChange = useCallback(
    (pagination: TablePaginationConfig) => {
      if (pagination.current) {
        tableState.goToPage(pagination.current);
      }
      if (pagination.pageSize) {
        tableState.changePageSize(pagination.pageSize);
      }
    },
    [tableState],
  );

  if (isError) {
    return (
      <div className="p-6">
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-gray-500">Không thể tải dữ liệu tài xế</span>}
          >
            <Button type="primary" onClick={() => refetch()}>
              Thử lại
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const isEmpty = !isLoading && (!data?.items || data.items.length === 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Title level={2} className="!mb-1">
            Quản lý Tài xế
          </Title>
          <Text type="secondary">
            {data?.pagination?.totalRecords
              ? `${data.pagination.totalRecords} tài xế trong hệ thống`
              : 'Danh sách tất cả tài xế'}
          </Text>
        </div>
        <Link to="/admin/drivers/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm tài xế
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="!mb-4">
        <Space wrap>
          <Input
            placeholder="Tìm theo tên, CCCD..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            placeholder="Giới tính"
            value={tableState.filters.gioiTinh || undefined}
            onChange={(value) => tableState.updateFilter('gioiTinh', value || '')}
            style={{ width: 120 }}
            allowClear
            options={[
              { value: 'Nam', label: 'Nam' },
              { value: 'Nữ', label: 'Nữ' },
            ]}
          />
          {tableState.hasActiveFilters && (
            <Button
              icon={<ClearOutlined />}
              onClick={() => {
                tableState.clearFilters();
                setSearchInput('');
              }}
            >
              Xóa lọc
            </Button>
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton />
        ) : isEmpty ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchInput || tableState.hasActiveFilters
                ? 'Không tìm thấy tài xế phù hợp'
                : 'Chưa có tài xế nào'
            }
          >
            {!searchInput && !tableState.hasActiveFilters && (
              <Link to="/admin/drivers/new">
                <Button type="primary" icon={<PlusOutlined />}>
                  Thêm tài xế đầu tiên
                </Button>
              </Link>
            )}
          </Empty>
        ) : (
          <Table<DriverSearchResult>
            columns={columns}
            dataSource={data?.items || []}
            rowKey="maTaiXe"
            onChange={handleTableChange}
            pagination={{
              current: data?.pagination?.pageIndex || 1,
              pageSize: data?.pagination?.pageSize || 20,
              total: data?.pagination?.totalRecords || 0,
              showSizeChanger: true,
              showTotal: (total, range) => (
                <span className="text-gray-500">
                  {range[0]}-{range[1]} / {total}
                </span>
              ),
            }}
            size="middle"
          />
        )}
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <Avatar size={40} icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
            <div>
              <div className="font-semibold">{driverDetail?.tenTaiXe || 'Tài xế'}</div>
              <div className="text-sm text-gray-500 font-normal">{selectedDriver}</div>
            </div>
          </div>
        }
        open={!!selectedDriver}
        onClose={() => setSelectedDriver(null)}
        width={400}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedDriver(null);
                navigate({ to: `/admin/drivers/${selectedDriver}/edit` });
              }}
            >
              Chỉnh sửa
            </Button>
          </Space>
        }
      >
        {isDetailLoading ? (
          <div className="space-y-4">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : driverDetail ? (
          <div className="space-y-6">
            <Descriptions column={1} size="small">
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-2">
                    <IdcardOutlined /> CCCD
                  </span>
                }
              >
                <span className="font-mono">{driverDetail.soCccd || '-'}</span>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-2">
                    <UserOutlined /> Giới tính
                  </span>
                }
              >
                <Tag color={driverDetail.gioiTinh === 'Nam' ? 'blue' : 'magenta'}>
                  {driverDetail.gioiTinh || '-'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-2">
                    <CalendarOutlined /> Ngày sinh
                  </span>
                }
              >
                {formatDate(driverDetail.ngaySinh)}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-2">
                    <EnvironmentOutlined /> Quê quán
                  </span>
                }
              >
                {driverDetail.queQuan || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <Text type="secondary" className="text-sm">
                Hệ số lương
              </Text>
              <div className="text-2xl font-semibold text-blue-600">
                {driverDetail.heSoLuong || '-'}
              </div>
            </div>
          </div>
        ) : (
          <Empty description="Không tìm thấy thông tin" />
        )}
      </Drawer>
    </div>
  );
};

export default DriverList;
