import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Alert, Card } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { oauth as oauthService } from '../../services/oauth';
import { validateState } from '../../config/oauth';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/login/actions';
import { saveProfile } from '../../data/database';
import { validateOAuthAccount } from '../../utils/jiraOAuthApi';
import * as worklogActions from '../../store/worklog/actions';
import dates from '../../utils/dates';

const OAuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth errors
        if (errorParam) {
          throw new Error(errorDescription || `OAuth error: ${errorParam}`);
        }

        // Validate required parameters
        if (!code) {
          throw new Error('Authorization code not received');
        }

        // Validate state parameter (CSRF protection)
        const expectedState = sessionStorage.getItem('oauth_state');
        if (!validateState(state, expectedState)) {
          throw new Error('Invalid state parameter. Possible CSRF attack.');
        }

        console.log('📝 Processing OAuth callback...');
        console.log('Code received:', code ? 'Yes' : 'No');
        console.log('State valid:', state === expectedState);

        // Exchange code for tokens
        const tokenResponse = await oauthService.exchangeCodeForToken(code);
        
        if (tokenResponse.success) {
          console.log('✅ OAuth authentication completed successfully');
          setSuccess(true);
          
          // Fetch current user profile via OAuth and hydrate Redux store
          try {
            const profileRes = await validateOAuthAccount();
            const user = profileRes?.payload || profileRes;
            if (user) {
              // Persist and dispatch to Redux
              await saveProfile(user);
              dispatch(loginSuccess(user));
              
              // Trigger initial worklog fetch (same behavior as token auth)
              const range = { startDate: dates.add(new Date(), -30, 'day'), endDate: new Date() };
              dispatch(worklogActions.worklogRequest(range));
            }
          } catch (e) {
            console.warn('Failed to fetch OAuth user profile:', e);
          }
          
          // Clear the state from session storage
          sessionStorage.removeItem('oauth_state');
          
          // Redirect immediately to dashboard
          navigate('/', { replace: true });
          
        } else {
          throw new Error('Token exchange was not successful');
        }

      } catch (err) {
        console.error('❌ OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            size="large"
          />
          <div style={{ marginTop: 16 }}>
            <h3>Completing Authentication...</h3>
            <p>Please wait while we securely connect to your Jira account.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
          <div style={{ marginTop: 16 }}>
            <h3>Authentication Failed</h3>
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon={false}
              style={{ marginTop: 16, textAlign: 'left' }}
            />
            <div style={{ marginTop: 16 }}>
              <a 
                href="/"
                style={{ color: '#1890ff', textDecoration: 'underline' }}
              >
                Return to Login
              </a>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          <div style={{ marginTop: 16 }}>
            <h3>Authentication Successful!</h3>
            <p>You are now connected to Jira. Redirecting to the app...</p>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
