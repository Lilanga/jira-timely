import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Empty } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const TimelySimple = ({ 
  worklogs = [], 
  assignedIssues = [],
  userDetails = {}, 
  worklogRequest, 
  assignedIssuesRequest,
  isLoading = false,
  isLoadingIssues = false
}) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      try {
        console.log('TimelySimple: Initializing...');
        console.log('Props:', { worklogs, assignedIssues, userDetails, worklogRequest, assignedIssuesRequest });
        
        // Only initialize once
        setInitialized(true);
        
        // Fetch initial data
        if (assignedIssuesRequest && typeof assignedIssuesRequest === 'function') {
          console.log('Fetching assigned issues...');
          assignedIssuesRequest();
        }
        
        if (worklogRequest && typeof worklogRequest === 'function') {
          console.log('Fetching worklogs...');
          const now = moment();
          worklogRequest({
            startDate: now.startOf('week').format('YYYY-MM-DD'),
            endDate: now.endOf('week').format('YYYY-MM-DD')
          });
        }
      } catch (error) {
        console.error('Error in TimelySimple initialization:', error);
      }
    }
  }, [initialized, assignedIssuesRequest, worklogRequest]);

  const totalHours = worklogs.reduce((acc, log) => acc + (log.timeSpentSeconds || 0) / 3600, 0);

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <h2 style={{ marginBottom: '24px' }}>Time Summary - Simple</h2>
      
      <Spin spinning={isLoading || isLoadingIssues}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Time"
                value={Math.round(totalHours * 100) / 100}
                suffix="hrs"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#2090ea' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Time Entries"
                value={worklogs.length}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Assigned Issues"
                value={assignedIssues.length}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="User"
                value={userDetails?.displayName || 'No user'}
                valueStyle={{ color: '#722ed1', fontSize: '16px' }}
              />
            </Card>
          </Col>
        </Row>

        {worklogs.length === 0 && assignedIssues.length === 0 && !isLoading && !isLoadingIssues && (
          <Card style={{ marginTop: '24px' }}>
            <Empty description="No data available. Make sure you're logged in and have access to JIRA." />
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default TimelySimple;