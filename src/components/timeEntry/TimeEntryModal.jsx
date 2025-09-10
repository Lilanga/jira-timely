import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  TimePicker, 
  InputNumber, 
  Input, 
  Button, 
  Row, 
  Col, 
  Card,
  Tag,
  Avatar,
  message
} from 'antd';
import { 
  ClockCircleOutlined, 
  CalendarOutlined, 
  CheckSquareOutlined,
  BugOutlined,
  BookOutlined
} from '@ant-design/icons';
import moment from 'moment';
import './TimeEntryModal.scss';

const { Option } = Select;
const { TextArea } = Input;

const TimeEntryModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  assignedIssues = [], 
  selectedIssue = null,
  selectedTimeSlot = null
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [timeInputType, setTimeInputType] = useState('duration'); // 'duration' or 'timerange'

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      form.resetFields();
      
      // Pre-populate with selected issue if provided
      if (selectedIssue) {
        form.setFieldsValue({
          issueKey: selectedIssue.key
        });
      }

      // Pre-populate with selected time slot if provided
      if (selectedTimeSlot) {
        const startTime = moment(selectedTimeSlot.start);
        const endTime = moment(selectedTimeSlot.end);
        const duration = moment.duration(endTime.diff(startTime)).asHours();
        
        form.setFieldsValue({
          date: startTime,
          startTime: startTime,
          endTime: endTime,
          duration: duration
        });
      } else {
        // Default to current date and 1 hour duration
        const now = moment();
        form.setFieldsValue({
          date: now,
          startTime: now,
          endTime: now.clone().add(1, 'hour'),
          duration: 1
        });
      }
    }
  }, [visible, selectedIssue, selectedTimeSlot, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const selectedIssueData = assignedIssues.find(issue => issue.key === values.issueKey);
      
      const worklogEntry = {
        issueKey: values.issueKey,
        issueSummary: selectedIssueData?.fields?.summary || '',
        issueType: selectedIssueData?.fields?.issuetype?.name || '',
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime ? values.endTime.format('HH:mm') : null,
        duration: values.duration,
        comment: values.comment || '',
        started: values.date.clone()
          .hour(values.startTime.hour())
          .minute(values.startTime.minute())
          .toISOString(),
        timeSpentSeconds: Math.round(values.duration * 3600)
      };

      await onSubmit(worklogEntry);
      message.success('Time entry logged successfully!');
      onCancel();
    } catch (error) {
      console.error('Error submitting time entry:', error);
      message.error('Failed to log time entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeInputTypeChange = (type) => {
    setTimeInputType(type);
    const currentValues = form.getFieldsValue();
    
    if (type === 'duration' && currentValues.startTime && currentValues.endTime) {
      const duration = moment.duration(currentValues.endTime.diff(currentValues.startTime)).asHours();
      form.setFieldsValue({ duration: Math.round(duration * 100) / 100 });
    } else if (type === 'timerange' && currentValues.startTime && currentValues.duration) {
      const endTime = currentValues.startTime.clone().add(currentValues.duration, 'hours');
      form.setFieldsValue({ endTime });
    }
  };

  const handleDurationChange = (value) => {
    if (timeInputType === 'duration') {
      const startTime = form.getFieldValue('startTime');
      if (startTime && value) {
        const endTime = startTime.clone().add(value, 'hours');
        form.setFieldsValue({ endTime });
      }
    }
  };

  const handleTimeRangeChange = () => {
    if (timeInputType === 'timerange') {
      const startTime = form.getFieldValue('startTime');
      const endTime = form.getFieldValue('endTime');
      
      if (startTime && endTime && endTime.isAfter(startTime)) {
        const duration = moment.duration(endTime.diff(startTime)).asHours();
        form.setFieldsValue({ duration: Math.round(duration * 100) / 100 });
      }
    }
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

  return (
    <Modal
      title={
        <div className="modal-title">
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          Log Time Entry
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="time-entry-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="time-entry-form"
      >
        <Card className="issue-selector-card" size="small">
          <Form.Item
            name="issueKey"
            label="Select Issue"
            rules={[{ required: true, message: 'Please select an issue' }]}
          >
            <Select
              placeholder="Choose a Jira issue..."
              showSearch
              filterOption={(input, option) => {
                try {
                  const key = option?.children?.props?.children?.[1]?.props?.children?.[0]?.toLowerCase?.() || '';
                  const summary = option?.children?.props?.children?.[1]?.props?.children?.[2]?.props?.children?.toLowerCase?.() || '';
                  return key.includes(input.toLowerCase()) || summary.includes(input.toLowerCase());
                } catch (e) {
                  return true;
                }
              }}
            >
              {assignedIssues.map(issue => (
                <Option key={issue.key} value={issue.key}>
                  <div className="issue-option">
                    <Avatar 
                      size="small" 
                      icon={getIssueTypeIcon(issue.fields.issuetype?.name)} 
                    />
                    <div className="issue-info">
                      <span className="issue-key">{issue.key}</span>
                      <Tag 
                        size="small" 
                        color={getStatusColor(issue.fields.status?.name)}
                      >
                        {issue.fields.status?.name}
                      </Tag>
                      <span className="issue-summary">{issue.fields.summary}</span>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                suffixIcon={<CalendarOutlined />}
                format="MMM DD, YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Time Input Method">
              <Select
                value={timeInputType}
                onChange={handleTimeInputTypeChange}
                style={{ width: '100%' }}
              >
                <Option value="duration">Duration (hours)</Option>
                <Option value="timerange">Time Range</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {timeInputType === 'duration' ? (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true, message: 'Please select start time' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  format="HH:mm"
                  minuteStep={15}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duration (hours)"
                rules={[
                  { required: true, message: 'Please enter duration' },
                  { type: 'number', min: 0.25, message: 'Minimum duration is 0.25 hours' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  step={0.25}
                  min={0.25}
                  max={24}
                  onChange={handleDurationChange}
                />
              </Form.Item>
            </Col>
          </Row>
        ) : (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true, message: 'Please select start time' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  format="HH:mm"
                  minuteStep={15}
                  onChange={handleTimeRangeChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="End Time"
                rules={[{ required: true, message: 'Please select end time' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  format="HH:mm"
                  minuteStep={15}
                  onChange={handleTimeRangeChange}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item
          name="comment"
          label="Work Description (Optional)"
        >
          <TextArea
            rows={3}
            placeholder="Describe what you worked on..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="form-actions">
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Log Time Entry
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default TimeEntryModal;
