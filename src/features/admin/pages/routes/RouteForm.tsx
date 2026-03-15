/**
 * Route Form Component
 * Form thêm/sửa tuyến đường
 */

import { useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Card,
  Typography,
  Row,
  Col,
  Tooltip,
} from 'antd';
import { InfoCircleOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import routeService from '@services/api/route.service';
import { ROUTE_COMPLEXITY } from '@mocks/routes.mock';
import type { CreateRouteDto, UpdateRouteDto } from '@base/models/entities/route';

const { Title, Text } = Typography;

interface RouteFormProps {
  mode: 'create' | 'edit';
}

const RouteForm: React.FC<RouteFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const { maTuyen } = useParams({ strict: false }) as { maTuyen?: string };

  // Fetch route data for edit mode
  const { data: routeData, isLoading: isLoadingRoute } = useQuery({
    queryKey: ['route', maTuyen],
    queryFn: () => routeService.getById(maTuyen!),
    enabled: mode === 'edit' && !!maTuyen,
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (routeData?.data) {
      form.setFieldsValue(routeData.data);
    }
  }, [routeData, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateRouteDto) => routeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      navigate({ to: '/admin/routes' });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateRouteDto) => routeService.update(maTuyen!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', maTuyen] });
      navigate({ to: '/admin/routes' });
    },
  });

  const handleSubmit = async (values: any) => {
    if (mode === 'edit') {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          {mode === 'edit' ? 'Sửa tuyến đường' : 'Thêm tuyến đường mới'}
        </Title>
        <Text type="secondary">
          {mode === 'edit'
            ? `Chỉnh sửa thông tin tuyến đường ${maTuyen}`
            : 'Nhập thông tin tuyến đường mới'}
        </Text>
      </div>

      <Card loading={isLoadingRoute}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ maDoPhucTap: '1' }}
          style={{ maxWidth: 800 }}
        >
          <Form.Item
            name="maTuyen"
            label="Mã tuyến"
            rules={[
              { required: true, message: 'Vui lòng nhập mã tuyến' },
              { max: 10, message: 'Mã tuyến tối đa 10 ký tự' },
              { pattern: /^[A-Z0-9]+$/, message: 'Mã tuyến chỉ chứa chữ hoa và số' },
            ]}
          >
            <Input
              placeholder="VD: TU001"
              disabled={mode === 'edit'}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>

          <Form.Item
            name="tenTuyen"
            label="Tên tuyến"
            rules={[{ required: true, message: 'Vui lòng nhập tên tuyến' }]}
          >
            <Input placeholder="VD: Hà Nội - Hồ Chí Minh" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="diemDi"
                label="Điểm đầu"
                rules={[{ required: true, message: 'Vui lòng nhập điểm đầu' }]}
              >
                <Input placeholder="VD: Hà Nội" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="diemDen"
                label="Điểm cuối"
                rules={[{ required: true, message: 'Vui lòng nhập điểm cuối' }]}
              >
                <Input placeholder="VD: Hồ Chí Minh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="khoangCach"
                label="Khoảng cách (km)"
                rules={[
                  { required: true, message: 'Vui lòng nhập khoảng cách' },
                  { type: 'number', min: 1, message: 'Khoảng cách phải lớn hơn 0' },
                ]}
              >
                <InputNumber
                  placeholder="VD: 1700"
                  style={{ width: '100%' }}
                  min={1}
                  max={5000}
                  addonAfter="km"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maDoPhucTap"
                label={
                  <span>
                    Độ phức tạp{' '}
                    <Tooltip title="Hệ số đường khó ảnh hưởng đến tính lương tài xế và chu kỳ bảo dưỡng xe">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn độ phức tạp' }]}
              >
                <Select
                  options={ROUTE_COMPLEXITY.map((c) => ({
                    value: c.ma,
                    label: `${c.ten} (x${c.heSo}) - ${c.moTa}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={isLoading} icon={<SaveOutlined />}>
                {mode === 'edit' ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => navigate({ to: '/admin/routes' })} icon={<CloseOutlined />}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RouteForm;
