/**
 * Customer Layout - Minimalist Design
 * Layout cho các trang của khách hàng
 */

import React from 'react';
import { Layout, Typography, Button, Dropdown, Avatar, Space } from 'antd';
import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { UserOutlined, LogoutOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '@contexts/AuthContext';
import type { MenuProps } from 'antd';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const CustomerLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/auth/login' });
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'tickets',
      label: <Link to="/my-tickets">Vé của tôi</Link>,
      icon: <HistoryOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header className="bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between h-16 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">VX</span>
            </div>
            <Text strong className="text-lg hidden sm:block">
              Vé Xe Online
            </Text>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/search"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <SearchOutlined />
              Tìm chuyến
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-tickets"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <HistoryOutlined />
                Vé của tôi
              </Link>
            )}
          </nav>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Space className="cursor-pointer">
                <Avatar size="small" icon={<UserOutlined />} className="bg-gray-600" />
                <span className="hidden sm:inline text-gray-700">{user?.name}</span>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Link to="/auth/login">
                <Button type="text" className="text-gray-600">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button
                  type="primary"
                  className="!bg-gray-900 hover:!bg-gray-800 !border-0 !rounded-md"
                >
                  Đăng ký
                </Button>
              </Link>
            </Space>
          )}
        </div>
      </Header>

      {/* Content */}
      <Content className="flex-1">
        <Outlet />
      </Content>

      {/* Footer */}
      <Footer className="bg-white border-t border-gray-200 text-center py-4">
        <Text className="text-gray-500">
          © {new Date().getFullYear()} Vé Xe Online. Hệ thống đặt vé xe khách.
        </Text>
      </Footer>
    </Layout>
  );
};

export default CustomerLayout;
