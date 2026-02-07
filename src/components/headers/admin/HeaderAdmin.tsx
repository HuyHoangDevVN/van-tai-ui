import { Avatar, Typography } from 'antd';

const HeaderAdmin = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Typography.Title level={4} style={{ margin: 0, flex: 1 }}>
        Admin Panel
      </Typography.Title>
      <Avatar style={{ backgroundColor: '#1890ff' }}>A</Avatar>
    </div>
  );
};

export default HeaderAdmin;
