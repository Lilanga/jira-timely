import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Tag, DatePicker, Select, Empty, Spin } from 'antd';
import { ClockCircleOutlined, ProjectOutlined, CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import './Timely.scss';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Timely = ({ 
  worklogs = [], 
  assignedIssues = [],
  userDetails, 
  worklogRequest, 
  assignedIssuesRequest,
  isLoading = false,
  isLoadingIssues = false
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [dateRange, setDateRange] = useState([moment().startOf('week'), moment().endOf('week')]);
  const [filteredWorklogs, setFilteredWorklogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch initial data on component mount
    try {
      if (assignedIssuesRequest && typeof assignedIssuesRequest === 'function') {
        assignedIssuesRequest();
      }
      
      // Fetch worklogs for current date range
      if (worklogRequest && typeof worklogRequest === 'function' && dateRange && dateRange[0] && dateRange[1]) {
        worklogRequest({
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        });
      }
    } catch (error) {
      console.error('Error in Timely component mount:', error);
    }
  }, []);

  useEffect(() => {
    filterWorklogs();
  }, [worklogs, dateRange]);

  useEffect(() => {
    // Fetch new worklogs when date range changes
    try {
      if (worklogRequest && typeof worklogRequest === 'function' && dateRange && dateRange[0] && dateRange[1]) {
        worklogRequest({
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        });
      }
    } catch (error) {
      console.error('Error fetching worklogs on date range change:', error);
    }
  }, [dateRange]);

  const filterWorklogs = () => {
    setLoading(true);
    const filtered = worklogs.filter(log => {
      const logDate = moment(log.started);
      return logDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
    });
    setFilteredWorklogs(filtered);
    setLoading(false);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const now = moment();
    let start, end;
    
    switch (period) {
      case 'today':
        start = now.clone().startOf('day');
        end = now.clone().endOf('day');
        break;
      case 'week':
        start = now.clone().startOf('week');
        end = now.clone().endOf('week');
        break;
      case 'month':
        start = now.clone().startOf('month');
        end = now.clone().endOf('month');
        break;
      default:
        start = now.clone().startOf('week');
        end = now.clone().endOf('week');
    }
    
    setDateRange([start, end]);
  };

  const calculateStats = () => {
    const totalTime = filteredWorklogs.reduce((acc, log) => acc + (log.timeSpentSeconds || 0), 0);
    const totalHours = Math.round((totalTime / 3600) * 100) / 100;
    
    const projectStats = {};
    const issueStats = {};
    
    filteredWorklogs.forEach(log => {
      const projectKey = log.issueKey?.split('-')[0] || 'Unknown';
      const issueKey = log.issueKey || 'Unknown';
      const timeHours = (log.timeSpentSeconds || 0) / 3600;
      
      if (!projectStats[projectKey]) {
        projectStats[projectKey] = { time: 0, issues: new Set() };
      }
      projectStats[projectKey].time += timeHours;
      projectStats[projectKey].issues.add(issueKey);
      
      if (!issueStats[issueKey]) {
        issueStats[issueKey] = {
          time: 0,
          summary: log.issueSummary || 'No summary',
          type: log.issueType || 'Task'
        };
      }
      issueStats[issueKey].time += timeHours;
    });

    return {
      totalHours,
      totalEntries: filteredWorklogs.length,
      projectCount: Object.keys(projectStats).length,
      issueCount: Object.keys(issueStats).length,
      projectStats,
      issueStats
    };
  };

  const stats = calculateStats();
  const targetHours = selectedPeriod === 'week' ? 40 : selectedPeriod === 'today' ? 8 : 160;
  const progressPercent = Math.min((stats.totalHours / targetHours) * 100, 100);

  const getIssueTypeColor = (type) => {
    const colors = {
      'Bug': 'red',
      'Task': 'blue',
      'Story': 'green',
      'Sub-task': 'orange',
      'Epic': 'purple'
    };
    return colors[type] || 'default';
  };

  return (
    <div className="timely-dashboard">
      <div className="dashboard-header">
        <h2>Time Summary</h2>
        <div className="period-selector">
          <Select 
            value={selectedPeriod} 
            onChange={handlePeriodChange}
            style={{ width: 120, marginRight: 16 }}
          >
            <Option value="today">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="MMM DD, YYYY"
          />
        </div>
      </div>

      <Spin spinning={isLoading || loading}>
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Time"
                value={stats.totalHours}
                suffix="hrs"
                prefix={<ClockCircleOutlined />}
                precision={2}
                valueStyle={{ color: '#2090ea' }}
              />
              <Progress
                percent={progressPercent}
                size="small"
                showInfo={false}
                strokeColor="#2090ea"
                style={{ marginTop: 8 }}
              />
              <div className="progress-label">
                {stats.totalHours}h of {targetHours}h target
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Time Entries"
                value={stats.totalEntries}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Projects"
                value={stats.projectCount}
                prefix={<ProjectOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Issues"
                value={stats.issueCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="details-row">
          <Col xs={24} lg={12}>
            <Card title="Time by Project" className="project-card">
              {Object.keys(stats.projectStats).length > 0 ? (
                <List
                  dataSource={Object.entries(stats.projectStats)
                    .sort((a, b) => b[1].time - a[1].time)}
                  renderItem={([project, data]) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar style={{ backgroundColor: '#2090ea' }}>{project}</Avatar>}
                        title={project}
                        description={`${data.issues.size} issues`}
                      />
                      <div className="time-display">
                        <span className="hours">{Math.round(data.time * 100) / 100}h</span>
                        <Progress
                          percent={(data.time / stats.totalHours) * 100}
                          size="small"
                          showInfo={false}
                          strokeColor="#2090ea"
                        />
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No project data available" />
              )}
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Recent Issues" className="issues-card">
              {Object.keys(stats.issueStats).length > 0 ? (
                <List
                  dataSource={Object.entries(stats.issueStats)
                    .sort((a, b) => b[1].time - a[1].time)
                    .slice(0, 10)}
                  renderItem={([issueKey, data]) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div>
                            <span className="issue-key">{issueKey}</span>
                            <Tag color={getIssueTypeColor(data.type)} size="small">
                              {data.type}
                            </Tag>
                          </div>
                        }
                        description={data.summary}
                      />
                      <div className="time-simple">
                        {Math.round(data.time * 100) / 100}h
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No issue data available" />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Timely;