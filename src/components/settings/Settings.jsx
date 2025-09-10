import React from 'react';
import { Card, Form, Input, Button, Switch, Select, Row, Col, Typography, Divider } from 'antd';
import { SettingOutlined, UserOutlined, BellOutlined, SecurityScanOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings = ({ userDetails = {} }) => {
  const [form] = Form.useForm();

  const handleSave = (values) => {
    console.log('Settings saved:', values);
    // Here you would typically save to your backend or local storage
  };

  return (
    <div style={{ padding: '24px', paddingTop: '120px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card className="settings-container">
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>
            <SettingOutlined style={{ marginRight: '8px', color: '#2090ea' }} />
            Settings
          </Title>
          <Text type="secondary">Manage your preferences and application settings</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            notifications: true,
            autoLogTime: false,
            defaultDuration: 1,
            timeFormat: '24h',
            weekStart: 'monday'
          }}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={12}>
              <Card size="small" title={
                <span>
                  <UserOutlined style={{ marginRight: '8px' }} />
                  Profile Settings
                </span>
              }>
                <Form.Item label="Display Name" name="displayName">
                  <Input 
                    placeholder={userDetails?.displayName || "Enter your display name"}
                    disabled
                  />
                </Form.Item>
                
                <Form.Item label="Email" name="email">
                  <Input 
                    placeholder={userDetails?.emailAddress || "Enter your email"}
                    disabled
                  />
                </Form.Item>
                
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Profile information is synced from JIRA and cannot be modified here.
                </Text>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card size="small" title={
                <span>
                  <BellOutlined style={{ marginRight: '8px' }} />
                  Notifications
                </span>
              }>
                <Form.Item 
                  label="Desktop Notifications" 
                  name="notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item 
                  label="Auto-log time reminder" 
                  name="autoLogTime"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Enable notifications to get reminders about time tracking.
                </Text>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[24, 0]}>
            <Col xs={24} lg={12}>
              <Card size="small" title="Time Tracking Preferences">
                <Form.Item label="Default Duration (hours)" name="defaultDuration">
                  <Select>
                    <Option value={0.25}>15 minutes</Option>
                    <Option value={0.5}>30 minutes</Option>
                    <Option value={1}>1 hour</Option>
                    <Option value={2}>2 hours</Option>
                    <Option value={4}>4 hours</Option>
                    <Option value={8}>8 hours</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Time Format" name="timeFormat">
                  <Select>
                    <Option value="12h">12 Hour (AM/PM)</Option>
                    <Option value="24h">24 Hour</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Week Starts On" name="weekStart">
                  <Select>
                    <Option value="sunday">Sunday</Option>
                    <Option value="monday">Monday</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card size="small" title={
                <span>
                  <SecurityScanOutlined style={{ marginRight: '8px' }} />
                  Privacy & Security
                </span>
              }>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>JIRA Connection</Text>
                  <br />
                  <Text type="secondary">
                    Connected to: {userDetails?.emailAddress ? userDetails.emailAddress.split('@')[1] : 'Not connected'}
                  </Text>
                </div>
                
                <Button type="default" danger size="small">
                  Disconnect JIRA Account
                </Button>
                
                <Divider type="horizontal" style={{ margin: '16px 0' }} />
                
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Your JIRA credentials are stored locally and encrypted for security.
                </Text>
              </Card>
            </Col>
          </Row>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" size="large">
              Save Settings
            </Button>
            <Button style={{ marginLeft: '12px' }} size="large">
              Reset to Default
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;