/**
 * Register Page - Minimalist Design
 * Đăng ký tài khoản cho Customer
 */

import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@contexts/AuthContext';

const { Title, Text } = Typography;

interface RegisterFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const Register: React.FC = () => {
  const [form] = Form.useForm();
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: RegisterFormValues) => {
    setError(null);
    try {
      await register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      navigate({ to: '/search' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2 !text-gray-900">
            Đăng ký tài khoản
          </Title>
          <Text className="text-gray-500">Tạo tài khoản để đặt vé xe</Text>
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
              name="name"
              label={<span className="text-gray-700 font-medium">Họ và tên</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập họ tên' },
                { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Nguyễn Văn A"
                size="large"
                className="!rounded-md"
              />
            </Form.Item>

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
              name="phone"
              label={<span className="text-gray-700 font-medium">Số điện thoại</span>}
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

            <Form.Item
              name="password"
              label={<span className="text-gray-700 font-medium">Mật khẩu</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="••••••••"
                size="large"
                className="!rounded-md"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<span className="text-gray-700 font-medium">Xác nhận mật khẩu</span>}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu không khớp'));
                  },
                }),
              ]}
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
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-gray-100">
            <Text className="text-gray-500">
              Đã có tài khoản?{' '}
              <Link to="/auth/login" className="text-gray-900 font-medium hover:underline">
                Đăng nhập
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};
