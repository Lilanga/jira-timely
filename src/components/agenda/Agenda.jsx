import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Avatar, Button, Input, Select, Empty, Spin, Row, Col, Statistic } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  BugOutlined, 
  CheckSquareOutlined,
  BookOutlined,
  ClockCircleOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import moment from 'moment';
import './Agenda.scss';

const { Search } = Input;
const { Option } = Select;

const Agenda = ({ 
  assignedIssues = [], 
  worklogs = [], 
  onLogTime,
  assignedIssuesRequest,
  isLoadingIssues = false
}) => {
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch assigned issues on component mount
    try {
      if (assignedIssuesRequest && typeof assignedIssuesRequest === 'function') {
        assignedIssuesRequest();
      }
    } catch (error) {
      console.error('Error in Agenda component mount:', error);
    }
  }, []);

  useEffect(() => {
    filterIssues();
  }, [assignedIssues, searchTerm, selectedProject, selectedStatus, selectedType]);

  const filterIssues = () => {
    setLoading(true);
    
    let filtered = assignedIssues.filter(issue => {
      const matchesSearch = !searchTerm || 
        issue.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.fields.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProject = selectedProject === 'all' || 
        issue.key.startsWith(selectedProject);
      
      const matchesStatus = selectedStatus === 'all' || 
        issue.fields.status?.name === selectedStatus;
        
      const matchesType = selectedType === 'all' || 
        issue.fields.issuetype?.name === selectedType;
      
      return matchesSearch && matchesProject && matchesStatus && matchesType;
    });

    setFilteredIssues(filtered);
    setLoading(false);
  };

  const getIssueTypeIcon = (type) => {
    const icons = {
      'Bug': <BugOutlined style={{ color: '#ff4d4f' }} />,
      'Task': <CheckSquareOutlined style={{ color: '#1890ff' }} />,
      'Story': <BookOutlined style={{ color: '#52c41a' }} />,
      'Sub-task': <CheckSquareOutlined style={{ color: '#faad14' }} />,
      'Epic': <BookOutlined style={{ color: '#722ed1' }} />
    };
    return icons[type] || <CheckSquareOutlined />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'default',
      'In Progress': 'processing',
      'Done': 'success',
      'Closed': 'success',
      'Resolved': 'success',
      'Open': 'error',
      'Reopened': 'warning'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Highest': '#ff4d4f',
      'High': '#fa8c16',
      'Medium': '#fadb14',
      'Low': '#52c41a',
      'Lowest': '#13c2c2'
    };
    return colors[priority] || '#d9d9d9';
  };

  const getLoggedTimeForIssue = (issueKey) => {
    const issueWorklogs = worklogs.filter(log => log.issueKey === issueKey);
    const totalSeconds = issueWorklogs.reduce((acc, log) => acc + (log.timeSpentSeconds || 0), 0);
    return totalSeconds / 3600; // Convert to hours
  };

  const getUniqueValues = (field) => {
    const values = new Set();
    assignedIssues.forEach(issue => {
      if (field === 'project') {
        values.add(issue.key.split('-')[0]);
      } else if (field === 'status') {
        values.add(issue.fields.status?.name);
      } else if (field === 'type') {
        values.add(issue.fields.issuetype?.name);
      }
    });
    return Array.from(values).filter(Boolean).sort();
  };

  const calculateStats = () => {
    const totalIssues = assignedIssues.length;
    const activeIssues = assignedIssues.filter(issue => 
      issue.fields.status?.name !== 'Done' && 
      issue.fields.status?.name !== 'Closed' &&
      issue.fields.status?.name !== 'Resolved'
    ).length;
    
    const projects = new Set();
    assignedIssues.forEach(issue => {
      projects.add(issue.key.split('-')[0]);
    });

    return {
      totalIssues,
      activeIssues,
      projectCount: projects.size
    };
  };

  const stats = calculateStats();

  return (
    <div className="agenda-container">
      <div className="agenda-header">
        <h2>My Agenda</h2>
        <div className="stats-summary">
          <Row gutter={16}>
            <Col>
              <Statistic
                title="Total Issues"
                value={stats.totalIssues}
                prefix={<CheckSquareOutlined />}
                valueStyle={{ fontSize: '16px', color: '#1890ff' }}
              />
            </Col>
            <Col>
              <Statistic
                title="Active"
                value={stats.activeIssues}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ fontSize: '16px', color: '#52c41a' }}
              />
            </Col>
            <Col>
              <Statistic
                title="Projects"
                value={stats.projectCount}
                prefix={<ProjectOutlined />}
                valueStyle={{ fontSize: '16px', color: '#faad14' }}
              />
            </Col>
          </Row>
        </div>
      </div>

      <Card className="filters-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search issues..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={8} sm={4} md={4}>
            <Select
              placeholder="Project"
              value={selectedProject}
              onChange={setSelectedProject}
              style={{ width: '100%' }}
            >
              <Option value="all">All Projects</Option>
              {getUniqueValues('project').map(project => (
                <Option key={project} value={project}>{project}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={8} sm={4} md={4}>
            <Select
              placeholder="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              {getUniqueValues('status').map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={8} sm={4} md={4}>
            <Select
              placeholder="Type"
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: '100%' }}
            >
              <Option value="all">All Types</Option>
              {getUniqueValues('type').map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card className="issues-list-card">
        <Spin spinning={isLoadingIssues || loading}>
          {filteredIssues.length > 0 ? (
            <List
              dataSource={filteredIssues}
              renderItem={(issue) => {
                const loggedHours = getLoggedTimeForIssue(issue.key);
                return (
                  <List.Item
                    className="issue-item"
                    actions={[
                      <Button 
                        type="primary" 
                        size="small"
                        icon={<ClockCircleOutlined />}
                        onClick={() => onLogTime && onLogTime(issue)}
                      >
                        Log Time
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="issue-avatar">
                          {getIssueTypeIcon(issue.fields.issuetype?.name)}
                          <div 
                            className="priority-indicator"
                            style={{ 
                              backgroundColor: getPriorityColor(issue.fields.priority?.name)
                            }}
                          />
                        </div>
                      }
                      title={
                        <div className="issue-title">
                          <span className="issue-key">{issue.key}</span>
                          <Tag color={getStatusColor(issue.fields.status?.name)}>
                            {issue.fields.status?.name}
                          </Tag>
                          <Tag>{issue.fields.issuetype?.name}</Tag>
                        </div>
                      }
                      description={
                        <div className="issue-description">
                          <div className="summary">{issue.fields.summary}</div>
                          <div className="meta-info">
                            <span>Updated: {moment(issue.fields.updated).fromNow()}</span>
                            {loggedHours > 0 && (
                              <span className="logged-time">
                                Logged: {Math.round(loggedHours * 100) / 100}h
                              </span>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          ) : (
            <Empty
              description={
                loading ? "Loading issues..." : "No issues found matching your criteria"
              }
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default Agenda;