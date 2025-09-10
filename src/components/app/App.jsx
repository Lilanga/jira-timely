import React, { useEffect, useState, useCallback } from "react";
import CustomTitleBar from "../titlebar/CustomTitleBar";
import Header from "../header/Header";
import ErrorBoundary from "../common/ErrorBoundary";
import defaultIcon from "../../img/jira_sm.png"
import { Layout } from "antd";
import Loader from "../../containers/Loader";
import Routes from "../../Routes";
import "./App.scss";
import { getCredentials } from "../../data/database";

export const App = ({ userDetails, isLoggedIn, isLoading, signInRequest, logoutRequest }) => {
  // Removed unused isAuthenticating state to fix ESLint warning
  
  const { Content } = Layout;

  const handleLogout = useCallback(() => {
    if (logoutRequest) {
      logoutRequest();
    }
  }, [logoutRequest]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const credentials = await getCredentials();

        if (credentials && signInRequest) {
          signInRequest(credentials);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();
  }, [signInRequest]);

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
      {isLoggedIn && (
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
            <Routes childProps={{ userDetails, isLoggedIn, isLoading }} />
          </ErrorBoundary>
          <Loader />
        </Content>
      </Layout>
    </Layout>
  );
};
