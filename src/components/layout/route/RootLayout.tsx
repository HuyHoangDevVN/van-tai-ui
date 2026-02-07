import { Outlet } from '@tanstack/react-router';

export const RootLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default RootLayout;
