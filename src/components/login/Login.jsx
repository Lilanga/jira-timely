import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Typography, Divider, Alert } from "antd";
import { Navigate } from "react-router-dom";
import { UserOutlined, LockOutlined, CloudServerOutlined, SafetyOutlined } from '@ant-design/icons';
import { generateAuthUrl, generateRandomState, isElectron } from '../../config/oauth';
import { oauthService } from '../../services/oauthService';
import { desktopOAuthService } from '../../services/desktopOAuthService';
import "./Login.scss";

export const Login = ({ isLoggedIn, loginRequest }) => {
  const [form] = Form.useForm();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isOAuthAvailable, setIsOAuthAvailable] = useState(true);
  const [oauthError, setOAuthError] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated via OAuth
    const checkOAuthService = isElectron() ? desktopOAuthService : oauthService;
    
    if (checkOAuthService.isAuthenticated()) {
      setShouldRedirect(true);
    } else if (isLoggedIn) {
      form.resetFields();
      setShouldRedirect(true);
    }
  }, [isLoggedIn, form]);

  const onFinish = (values) => {
    loginRequest?.(values);
  };

  const handleOAuthLogin = async () => {
    try {
      console.log('🔐 Starting OAuth flow...');
      
      if (isElectron()) {
        // Desktop OAuth flow
        console.log('Using desktop OAuth flow...');
        await desktopOAuthService.initiateOAuthFlow();
        console.log('✅ Desktop OAuth completed successfully');
        setShouldRedirect(true);
      } else {
        // Web OAuth flow (fallback)
        console.log('Using web OAuth flow...');
        const state = generateRandomState();
        sessionStorage.setItem('oauth_state', state);
        
        const authUrl = generateAuthUrl(state);
        window.location.href = authUrl;
      }
      
    } catch (error) {
      console.error('❌ OAuth flow failed:', error);
      setIsOAuthAvailable(false);
      setOAuthError(error?.message || 'OAuth failed');
    }
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

        {/* OAuth 2.0 Login (Recommended) */}
        {isOAuthAvailable && (
          <>
            <Alert
              message="Recommended: OAuth 2.0"
              description="More secure authentication with full worklog permissions"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<SafetyOutlined />}
              onClick={handleOAuthLogin}
              style={{ marginBottom: 24 }}
            >
              Sign in with Atlassian OAuth
            </Button>
            
            <Divider>Or use API Token</Divider>
          </>
        )}

        {/* Traditional API Token Login */}
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

          <Button type="default" htmlType="submit" size="large" block>
            Login with API Token
          </Button>
        </Form>

        {!isOAuthAvailable && (
          <Alert
            message="OAuth Not Available"
              description={
              <div>
                <div style={{ marginBottom: 8 }}>{oauthError || 'OAuth configuration is missing.'}</div>
                <div>
                  Tip: Ensure your Atlassian app is configured for OAuth 2.0 (3LO) with PKCE (or confidential client with client secret in Electron main), and that
                  the callback URL exactly matches <code>http://localhost:8080/callback</code>.
                </div>
              </div>
            }
            type="warning"
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    </div>
  );
};

export default Login;
