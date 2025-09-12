import React, { useEffect, useCallback } from "react";
import CustomTitleBar from "../titlebar/CustomTitleBar";
import Header from "../header/Header";
import ErrorBoundary from "../common/ErrorBoundary";
import defaultIcon from "../../img/jira_sm.png"
import { Layout } from "antd";
import Loader from "../../containers/Loader";
import Routes from "../../Routes";
import "./App.scss";
import { getCredentials } from "../../data/database";
import { oauth as oauthService } from "../../services/oauth";
import { useDispatch } from 'react-redux';
import { loginSuccess, restoreSession } from '../../store/login/actions';
import { validateOAuthAccount } from '../../utils/jiraOAuthApi';
import { saveProfile } from '../../data/database';

export const App = ({ userDetails, isLoggedIn, isLoading, signInRequest, logoutRequest }) => {
  // Removed unused isAuthenticating state to fix ESLint warning
  
  const { Content } = Layout;
  const dispatch = useDispatch();

  const handleLogout = useCallback(() => {
    if (logoutRequest) {
      logoutRequest();
    }
  }, [logoutRequest]);

  useEffect(() => {
    // Prevent running if already logged in or loading
    if (isLoggedIn || isLoading) {
      return;
    }

    const initializeAuth = async () => {
      try {
        const credentials = await getCredentials();

        if (credentials) {
          // For cached credentials, use restoreSession to avoid API validation loop
          // The stored credentials are already validated
          dispatch(restoreSession(credentials));
        } else if (oauthService.isAuthenticated() && (!userDetails || Object.keys(userDetails || {}).length === 0)) {
          // Hydrate Redux with OAuth profile on app start
          try {
            const profileRes = await validateOAuthAccount();
            const user = profileRes?.payload || profileRes;
            if (user) {
              await saveProfile(user);
              dispatch(loginSuccess(user));
            }
          } catch (e) {
            // ignore, header/routes will still work off OAuth tokens
            console.warn('OAuth profile validation failed:', e.message);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();
  }, [signInRequest, dispatch, isLoggedIn, isLoading]); // Removed userDetails dependency

  return (
    <Layout className="layout">
      <CustomTitleBar
        icon={defaultIcon}
        app="Jira Timely"
        theme={{
          barTheme: 'dark',
          barBackgroundColor: '#2090ea',
          menuHighlightColor: '#2090ea',
          barShowBorder: true,
          barBorderBottom: '1px solid #1a70b7',
        }}
      />
      {(isLoggedIn || oauthService.isAuthenticated()) && (
        <ErrorBoundary>
          <Header 
            userDetails={userDetails}
            onLogout={handleLogout}
          />
        </ErrorBoundary>
      )}
      <Layout>
        <Content style={{ padding: 0 }}>
          <ErrorBoundary>
            <Routes childProps={{ userDetails, isLoggedIn: isLoggedIn || oauthService.isAuthenticated(), isLoading }} />
          </ErrorBoundary>
          <Loader />
        </Content>
      </Layout>
    </Layout>
  );
};
