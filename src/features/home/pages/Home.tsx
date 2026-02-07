/**
 * Home Page - Landing page
 * Trang chủ với hero section và CTA đến tìm kiếm chuyến xe
 */

import React from 'react';
import { Typography, Button, Space, Card, Row, Col } from 'antd';
import {
  SearchOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { Link } from '@tanstack/react-router';

const { Title, Text, Paragraph } = Typography;

const Home: React.FC = () => {
  const features = [
    {
      icon: <SearchOutlined style={{ fontSize: 32, color: '#1a1a1a' }} />,
      title: 'Tìm kiếm dễ dàng',
      description: 'Tìm chuyến xe phù hợp chỉ với vài thao tác đơn giản',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 32, color: '#1a1a1a' }} />,
      title: 'An toàn & Tin cậy',
      description: 'Đội ngũ tài xế chuyên nghiệp, xe chất lượng cao',
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 32, color: '#1a1a1a' }} />,
      title: 'Đúng giờ',
      description: 'Cam kết khởi hành đúng lịch trình đã đặt',
    },
    {
      icon: <CustomerServiceOutlined style={{ fontSize: 32, color: '#1a1a1a' }} />,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ hỗ trợ khách hàng luôn sẵn sàng',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-100 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Title level={1} className="!text-4xl md:!text-5xl !font-bold !mb-4">
            Đặt vé xe khách
            <br />
            <span className="text-gray-500">Nhanh chóng & Tiện lợi</span>
          </Title>
          <Paragraph className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Hệ thống đặt vé xe khách đường dài trực tuyến. Tìm chuyến xe, chọn ghế và đặt vé chỉ
            trong vài phút.
          </Paragraph>
          <Space size="middle">
            <Link to="/search">
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                className="!bg-gray-900 hover:!bg-gray-800 !border-0 !rounded-md !h-12 !px-8 !font-medium"
              >
                Tìm chuyến xe
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="large" className="!rounded-md !h-12 !px-8">
                Đăng ký tài khoản
              </Button>
            </Link>
          </Space>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <Title level={2} className="text-center !mb-12">
            Tại sao chọn chúng tôi?
          </Title>
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="text-center h-full border-gray-200 hover:border-gray-400 transition-colors">
                  <div className="mb-4">{feature.icon}</div>
                  <Title level={5} className="!mb-2">
                    {feature.title}
                  </Title>
                  <Text className="text-gray-500">{feature.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Title level={2} className="!text-white !mb-4">
            Sẵn sàng cho chuyến đi?
          </Title>
          <Paragraph className="text-gray-400 mb-8">
            Đặt vé ngay hôm nay và trải nghiệm dịch vụ vận tải hành khách chất lượng cao.
          </Paragraph>
          <Link to="/search">
            <Button
              size="large"
              className="!bg-white !text-gray-900 hover:!bg-gray-100 !border-0 !rounded-md !h-12 !px-8 !font-medium"
            >
              Đặt vé ngay
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
