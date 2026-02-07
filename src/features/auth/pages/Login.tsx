/**
 * Login Page - Minimalist Design
 * Đăng nhập cho cả Customer và Admin
 */

import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@contexts/AuthContext';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const [form] = Form.useForm();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormValues) => {
    setError(null);
    try {
      await login(values.email, values.password);

      // Lấy user sau khi login để check role
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          navigate({ to: '/admin' });
        } else {
          navigate({ to: '/search' });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2 !text-gray-900">
            Đăng nhập
          </Title>
          <Text className="text-gray-500">Hệ thống đặt vé xe khách</Text>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-lg border border-gray-200">
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="mb-6"
              closable
              onClose={() => setError(null)}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<span className="text-gray-700 font-medium">Email</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="email@example.com"
                size="large"
                className="!rounded-md"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-gray-700 font-medium">Mật khẩu</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="••••••••"
                size="large"
                className="!rounded-md"
              />
            </Form.Item>

            <Form.Item className="!mb-4">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                className="!rounded-md !bg-gray-900 hover:!bg-gray-800 !border-0 !h-11 !font-medium"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-gray-100">
            <Text className="text-gray-500">
              Chưa có tài khoản?{' '}
              <Link to="/auth/register" className="text-gray-900 font-medium hover:underline">
                Đăng ký ngay
              </Link>
            </Text>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <Text className="text-sm text-gray-600">
            <strong>Demo:</strong>
            <br />
            Admin: admin@example.com / admin123
            <br />
            Customer: any@email.com / 123456
          </Text>
        </div>
      </div>
    </div>
  );
};
