/**
 * Driver Detail Page
 * Xem chi tiết thông tin tài xế
 */

import { Card, Descriptions, Button, Space, Typography, Spin, Tag, Divider } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { useDriver } from '@features/admin/hooks/useDrivers';
import { formatDate } from '@utils/format';

const { Title, Text } = Typography;

const DriverDetail: React.FC = () => {
  const { maTaiXe } = useParams({ from: '/admin/drivers/$maTaiXe' });
  const navigate = useNavigate();
  const { data: driver, isLoading, isError } = useDriver(maTaiXe);

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !driver) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="danger">Không tìm thấy tài xế với mã {maTaiXe}</Text>
            <br />
            <Link to="/admin/drivers">
              <Button type="link">Quay lại danh sách</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate({ to: '/admin/drivers' })}>
            Quay lại
          </Button>
        </Space>
      </div>

      <Card
        title={
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Thông tin tài xế
            </Title>
            <Text type="secondary">Mã: {driver.maTaiXe}</Text>
          </div>
        }
        extra={
          <Link to={`/admin/drivers/${maTaiXe}/edit`}>
            <Button type="primary" icon={<EditOutlined />}>
              Chỉnh sửa
            </Button>
          </Link>
        }
      >
        <Descriptions bordered column={{ xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
          <Descriptions.Item label="Mã tài xế">{driver.maTaiXe}</Descriptions.Item>
          <Descriptions.Item label="Tên tài xế">
            <Text strong>{driver.tenTaiXe || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {driver.gioiTinh ? (
              <Tag color={driver.gioiTinh === 'Nam' ? 'blue' : 'pink'}>{driver.gioiTinh}</Tag>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">{formatDate(driver.ngaySinh)}</Descriptions.Item>
          <Descriptions.Item label="Tuổi">{driver.tuoi || '-'}</Descriptions.Item>
          <Descriptions.Item label="Quê quán">{driver.queQuan || '-'}</Descriptions.Item>
          <Descriptions.Item label="Tôn giáo">{driver.tonGiao || '-'}</Descriptions.Item>
          <Descriptions.Item label="Số CCCD">{driver.soCccd || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ngày ký hợp đồng">
            {formatDate(driver.ngayKyHopDong)}
          </Descriptions.Item>
          <Descriptions.Item label="Hệ số lương">
            <Text strong style={{ color: '#52c41a' }}>
              {driver.heSoLuong || '-'}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default DriverDetail;
