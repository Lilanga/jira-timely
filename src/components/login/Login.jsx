import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Typography } from "antd";
import { Navigate } from "react-router-dom";
import { UserOutlined, LockOutlined, CloudServerOutlined } from '@ant-design/icons';
import "./Login.scss";

export const Login = ({ isLoggedIn, loginRequest }) => {
  const [form] = Form.useForm();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      form.resetFields();
      setShouldRedirect(true);
    }
  }, [isLoggedIn, form]);

  const onFinish = (values) => {
    loginRequest?.(values);
  };

  if (shouldRedirect) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="Login" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <Card style={{ width: 420 }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Sign in to Jira Timely
        </Typography.Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ url: '', email: '', password: '' }}
        >
          <Form.Item
            label="Jira Cloud Domain"
            name="url"
            rules={[{ required: true, message: 'Please enter your Jira domain' }]}
            extra="Example: your-domain.atlassian.net (without https://)"
          >
            <Input size="large" placeholder="your-domain.atlassian.net" prefix={<CloudServerOutlined />} />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input size="large" placeholder="your-email@company.com" prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            label="API Token"
            name="password"
            rules={[{ required: true, message: 'Please enter your API token' }]}
            extra="Generate a token in your Atlassian account settings under Security → API Tokens"
          >
            <Input.Password size="large" placeholder="Your Jira API Token" prefix={<LockOutlined />} />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

