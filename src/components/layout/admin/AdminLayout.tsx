import { Outlet } from '@tanstack/react-router';
import { Layout, Drawer, Button, Grid } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import HeaderAdmin from '@components/headers/admin/HeaderAdmin';
import { SidebarAdmin } from '@components/sidebars/admin/SidebarAdmin';
import { useState, useEffect } from 'react';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const screens = useBreakpoint();

  // Auto collapse on tablet, hide on mobile
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  useEffect(() => {
    if (isTablet) {
      setCollapsed(true);
    } else if (!isMobile) {
      setCollapsed(false);
    }
  }, [isMobile, isTablet]);

  // Close drawer when screen size changes to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileDrawerOpen(false);
    }
  }, [isMobile]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={220}
          collapsedWidth={80}
          style={{
            background: '#001529',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            overflow: 'auto',
          }}
          trigger={null}
        >
          <SidebarAdmin collapsed={collapsed} />
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        width={260}
        styles={{
          body: { padding: 0, background: '#001529' },
          header: { display: 'none' },
        }}
      >
        <SidebarAdmin collapsed={false} onMenuClick={() => setMobileDrawerOpen(false)} />
      </Drawer>

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 220,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header
          style={{
            background: '#fff',
            boxShadow: '0 2px 8px #f0f1f2',
            padding: isMobile ? '0 12px' : '0 24px',
            display: 'flex',
            alignItems: 'center',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 99,
            gap: 12,
          }}
        >
          {/* Mobile menu button */}
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              style={{ fontSize: 18 }}
            />
          )}
          {/* Desktop collapse button */}
          {!isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18 }}
            />
          )}
          <HeaderAdmin />
        </Header>
        <Content
          style={{
            margin: isMobile ? '12px 8px' : isTablet ? '16px 12px' : '24px',
            background: '#fff',
            borderRadius: 8,
            minHeight: 360,
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            padding: isMobile ? 12 : 16,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
