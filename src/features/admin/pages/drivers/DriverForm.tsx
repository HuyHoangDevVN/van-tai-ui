/**
 * Driver Form Page
 * Form tạo mới / chỉnh sửa tài xế
 */

import { useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Typography,
  Spin,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useDriver, useCreateDriver, useUpdateDriver } from '@features/admin/hooks/useDrivers';
import type { CreateDriverDto } from '@base/models/entities/driver';

const { Title, Text } = Typography;

const DriverForm: React.FC = () => {
  const params = useParams({ strict: false });
  const maTaiXe = params.maTaiXe as string | undefined;
  const isEditing = !!maTaiXe;
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data: driver, isLoading } = useDriver(maTaiXe);
  const createMutation = useCreateDriver();
  const updateMutation = useUpdateDriver();

  useEffect(() => {
    if (driver && isEditing) {
      form.setFieldsValue({
        ...driver,
        ngaySinh: driver.ngaySinh ? dayjs(driver.ngaySinh) : undefined,
        ngayKyHopDong: driver.ngayKyHopDong ? dayjs(driver.ngayKyHopDong) : undefined,
      });
    }
  }, [driver, isEditing, form]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    const data: CreateDriverDto = {
      maTaiXe: values.maTaiXe as string,
      tenTaiXe: values.tenTaiXe as string,
      ngaySinh: values.ngaySinh ? (values.ngaySinh as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
      gioiTinh: values.gioiTinh as string,
      queQuan: values.queQuan as string,
      tonGiao: values.tonGiao as string,
      soCccd: values.soCccd as string,
      ngayKyHopDong: values.ngayKyHopDong
        ? (values.ngayKyHopDong as dayjs.Dayjs).format('YYYY-MM-DD')
        : undefined,
      tuoi: values.tuoi as number,
      heSoLuong: values.heSoLuong as number,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ maTaiXe: maTaiXe!, data });
    } else {
      await createMutation.mutateAsync(data);
    }

    navigate({ to: '/admin/drivers' });
  };

  if (isLoading && isEditing) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
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
              {isEditing ? 'Chỉnh sửa tài xế' : 'Thêm tài xế mới'}
            </Title>
            {isEditing && <Text type="secondary">Mã: {maTaiXe}</Text>}
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 800 }}>
          <Form.Item
            label="Mã tài xế"
            name="maTaiXe"
            rules={[
              { required: true, message: 'Vui lòng nhập mã tài xế' },
              { max: 20, message: 'Mã tài xế tối đa 20 ký tự' },
            ]}
          >
            <Input placeholder="Nhập mã tài xế" disabled={isEditing} />
          </Form.Item>

          <Form.Item
            label="Tên tài xế"
            name="tenTaiXe"
            rules={[{ max: 100, message: 'Tên tối đa 100 ký tự' }]}
          >
            <Input placeholder="Nhập tên tài xế" />
          </Form.Item>

          <Form.Item label="Giới tính" name="gioiTinh">
            <Select placeholder="Chọn giới tính" allowClear>
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ngày sinh" name="ngaySinh">
            <DatePicker
              placeholder="Chọn ngày sinh"
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Tuổi"
            name="tuoi"
            rules={[{ type: 'number', min: 0, max: 200, message: 'Tuổi từ 0-200' }]}
          >
            <InputNumber placeholder="Nhập tuổi" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Quê quán"
            name="queQuan"
            rules={[{ max: 100, message: 'Quê quán tối đa 100 ký tự' }]}
          >
            <Input placeholder="Nhập quê quán" />
          </Form.Item>

          <Form.Item label="Tôn giáo" name="tonGiao">
            <Input placeholder="Nhập tôn giáo" />
          </Form.Item>

          <Form.Item
            label="Số CCCD"
            name="soCccd"
            rules={[{ max: 20, message: 'CCCD tối đa 20 ký tự' }]}
          >
            <Input placeholder="Nhập số CCCD" />
          </Form.Item>

          <Form.Item label="Ngày ký hợp đồng" name="ngayKyHopDong">
            <DatePicker
              placeholder="Chọn ngày ký hợp đồng"
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Hệ số lương"
            name="heSoLuong"
            rules={[{ type: 'number', min: 0, max: 100, message: 'Hệ số từ 0-100' }]}
          >
            <InputNumber placeholder="Nhập hệ số lương" style={{ width: '100%' }} step={0.1} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => navigate({ to: '/admin/drivers' })}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DriverForm;
