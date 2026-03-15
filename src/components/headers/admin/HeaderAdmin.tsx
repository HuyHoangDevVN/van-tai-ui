import { Avatar, Typography, Grid } from 'antd';

const { useBreakpoint } = Grid;

const HeaderAdmin = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8 }}>
      <Typography.Title
        level={isMobile ? 5 : 4}
        style={{
          margin: 0,
          flex: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {isMobile ? 'Admin' : 'Admin Panel'}
      </Typography.Title>
      <Avatar style={{ backgroundColor: '#1890ff', flexShrink: 0 }}>A</Avatar>
    </div>
  );
};

export default HeaderAdmin;
