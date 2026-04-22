import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import ErrorBoundary from '@components/common/ErrorBoundary';
import { router } from '@routes/routes';
import { queryClient } from '@base/config/queryClient';
import { AuthProvider } from '@contexts/AuthContext';

const adminTheme = {
  token: {
    colorPrimary: '#2563eb',
    colorSuccess: '#15803d',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorInfo: '#2563eb',
    colorBgLayout: '#f3f6fb',
    colorBgContainer: '#ffffff',
    colorBorderSecondary: '#dbe4f0',
    colorTextSecondary: '#5b6472',
    borderRadius: 14,
    borderRadiusLG: 18,
    fontFamily: "'Segoe UI', 'Inter', sans-serif",
    boxShadowSecondary: '0 18px 40px rgba(15, 23, 42, 0.08)',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#0f172a',
      bodyBg: '#f3f6fb',
      triggerBg: '#0f172a',
    },
    Card: {
      borderRadiusLG: 18,
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#1f2937',
      rowHoverBg: '#f8fbff',
      borderColor: '#e2e8f0',
    },
    Segmented: {
      trackBg: '#eff3f8',
      itemSelectedBg: '#ffffff',
    },
  },
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider locale={viVN} theme={adminTheme}>
            <RouterProvider router={router} />
          </ConfigProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
