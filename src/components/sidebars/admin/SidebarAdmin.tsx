import { Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  CarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ToolOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useMemo } from 'react';

interface SidebarAdminProps {
  collapsed: boolean;
  onMenuClick?: () => void;
}

export const SidebarAdmin = ({ collapsed, onMenuClick }: SidebarAdminProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentSelectedKey = () => {
    const path = location.pathname;

    // Van Tai System routes
    if (path.includes('/drivers')) return ['drivers'];
    if (path.includes('/vehicles')) return ['vehicles'];
    if (path.includes('/routes')) return ['routes'];
    if (path.includes('/trips')) return ['trips'];
    if (path.includes('/tickets')) return ['tickets'];
    if (path.includes('/reports')) return ['reports'];
    if (path.includes('/maintenance')) return ['maintenance'];
    if (path.includes('/users')) return ['users'];

    // Dashboard
    if (path.includes('/dashboard')) return ['dashboard'];

    // Settings
    if (path.includes('/settings')) return ['settings'];

    return ['dashboard'];
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    const routeMap: Record<string, string> = {
      // Dashboard
      dashboard: '/admin/dashboard',

      // Van Tai System routes
      vehicles: '/admin/vehicles',
      drivers: '/admin/drivers',
      routes: '/admin/routes',
      trips: '/admin/trips',
      tickets: '/admin/tickets',
      reports: '/admin/reports',
      maintenance: '/admin/maintenance',
      users: '/admin/users',

      // Settings
      settings: '/admin/settings',
    };

    if (routeMap[key]) {
      navigate({ to: routeMap[key] });
      // Close mobile drawer if callback provided
      onMenuClick?.();
    }
  };

  const menuItems = useMemo(
    () => [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'danh-muc-group',
        type: 'group' as const,
        label: collapsed ? null : 'Danh mục',
        children: [
          {
            key: 'vehicles',
            icon: <CarOutlined />,
            label: 'Xe khách',
          },
          {
            key: 'drivers',
            icon: <TeamOutlined />,
            label: 'Tài xế',
          },
          {
            key: 'routes',
            icon: <NodeIndexOutlined />,
            label: 'Tuyến đường',
          },
        ],
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'van-tai-group',
        type: 'group' as const,
        label: collapsed ? null : 'Vận hành',
        children: [
          {
            key: 'trips',
            icon: <EnvironmentOutlined />,
            label: 'Chuyến xe',
          },
          {
            key: 'tickets',
            icon: <FileTextOutlined />,
            label: 'Vé',
          },
        ],
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'reports-group',
        type: 'group' as const,
        label: collapsed ? null : 'Báo cáo & Bảo trì',
        children: [
          {
            key: 'reports',
            icon: <BarChartOutlined />,
            label: 'Báo cáo thống kê',
          },
          {
            key: 'maintenance',
            icon: <SafetyCertificateOutlined />,
            label: 'Bảo dưỡng & Đăng kiểm',
          },
        ],
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'system-group',
        type: 'group' as const,
        label: collapsed ? null : 'Hệ thống',
        children: [
          {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Khách hàng',
          },
        ],
      },
    ],
    [collapsed],
  );

  return (
    <div style={{ height: '100%', background: '#001529', color: '#fff' }}>
      <div
        style={{
          padding: '16px',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: collapsed ? 16 : 18,
          color: '#fff',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {collapsed ? 'VT' : 'Vận Tải'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getCurrentSelectedKey()}
        onClick={handleMenuClick}
        items={menuItems}
        style={{ border: 'none', background: '#001529' }}
      />
    </div>
  );
};
