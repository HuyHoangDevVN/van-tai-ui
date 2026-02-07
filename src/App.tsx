import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import ErrorBoundary from '@components/common/ErrorBoundary';
import { router } from '@routes/routes';
import { queryClient } from '@base/config/queryClient';
import { AuthProvider } from '@contexts/AuthContext';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider locale={viVN}>
            <RouterProvider router={router} />
          </ConfigProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
