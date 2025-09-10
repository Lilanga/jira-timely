import React, { Component } from "react";
import { Calendar, Views } from "react-big-calendar";
import { Card, Button, Tooltip, Tag, message } from "antd";
import { PlusOutlined, ClockCircleOutlined } from "@ant-design/icons";
import {getEventsFromWorklogs} from "../../utils/payloadMappings";
import TimeEntryModal from "../timeEntry/TimeEntryModal";
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./WorkLogCalendar.scss";

import { momentLocalizer } from "react-big-calendar";
const localizer = momentLocalizer(moment);

export class WorkLogCalendar extends Component {

  constructor(props) {
    super(props);

    this.state = { 
      events: getEventsFromWorklogs(props.worklogs || []),
      showTimeEntryModal: false,
      selectedTimeSlot: null,
      selectedIssue: null
    }

    this.handleSelect = this.handleSelect.bind(this);
    this.handleEventSelect = this.handleEventSelect.bind(this);
    this.handleTimeEntry = this.handleTimeEntry.bind(this);
    this.handleTimeEntrySubmit = this.handleTimeEntrySubmit.bind(this);
  }

  componentDidMount() {
    // Fetch initial data
    if (this.props.assignedIssuesRequest) {
      this.props.assignedIssuesRequest();
    }
    
    if (this.props.worklogRequest) {
      const now = moment();
      this.props.worklogRequest({
        startDate: now.clone().startOf('month').format('YYYY-MM-DD'),
        endDate: now.clone().endOf('month').format('YYYY-MM-DD')
      });
    }
  }

  componentDidUpdate(prevProps){
    if(this.props.worklogs !== prevProps.worklogs){
      let events = getEventsFromWorklogs(this.props.worklogs || []);
      this.setState({events});
    }
  }

  handleSelect = ({ start, end }) => {
    this.setState({
      showTimeEntryModal: true,
      selectedTimeSlot: { start, end },
      selectedIssue: null
    });
  }

  handleEventSelect = (event) => {
    message.info(`${event.title} - ${event.issueKey || 'No issue key'}`);
  }

  handleTimeEntry = (issue = null) => {
    this.setState({
      showTimeEntryModal: true,
      selectedIssue: issue,
      selectedTimeSlot: null
    });
  }

  handleTimeEntrySubmit = async (worklogEntry) => {
    try {
      if (this.props.addWorklogRequest) {
        this.props.addWorklogRequest(worklogEntry);
      }
      
      const newEvent = {
        title: `${worklogEntry.issueKey} - ${worklogEntry.duration}h`,
        start: new Date(worklogEntry.started),
        end: moment(worklogEntry.started).add(worklogEntry.duration, 'hours').toDate(),
        issueKey: worklogEntry.issueKey,
        duration: worklogEntry.duration,
        resource: worklogEntry
      };
      
      this.setState(prevState => ({
        events: [...prevState.events, newEvent]
      }));
      
    } catch (error) {
      throw error;
    }
  }

  closeTimeEntryModal = () => {
    this.setState({
      showTimeEntryModal: false,
      selectedTimeSlot: null,
      selectedIssue: null
    });
  }

  eventPropGetter = (event) => {
    let style = {
      backgroundColor: '#2090ea',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block'
    };

    if (event.issueKey) {
      const projectKey = event.issueKey.split('-')[0];
      const colors = {
        'BUG': '#ff4d4f',
        'TASK': '#1890ff',
        'STORY': '#52c41a',
        'EPIC': '#722ed1'
      };
      
      style.backgroundColor = colors[projectKey] || '#2090ea';
    }

    return { style };
  }

  render() {
    const { assignedIssues = [] } = this.props;
    
    return (
      <div className="enhanced-calendar-container">
        <Card 
          className="calendar-header-card"
          size="small"
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => this.handleTimeEntry()}
            >
              Log Time
            </Button>
          }
        >
          <div className="calendar-instructions">
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            <span>Click and drag to select a time slot, or click "Log Time" to create a new entry</span>
          </div>
        </Card>
        
        <Card className="calendar-card">
          <Calendar
            selectable
            localizer={localizer}
            events={this.state.events}
            defaultView={Views.WEEK}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            scrollToTime={new Date(1970, 1, 1, 8)}
            defaultDate={new Date()}
            onSelectEvent={this.handleEventSelect}
            onSelectSlot={this.handleSelect}
            eventPropGetter={this.eventPropGetter}
            style={{ height: 600 }}
            components={{
              event: ({ event }) => (
                <Tooltip title={`${event.issueKey} - ${event.duration}h`}>
                  <div className="calendar-event">
                    <strong>{event.issueKey}</strong>
                    <div>{event.duration}h</div>
                  </div>
                </Tooltip>
              )
            }}
          />
        </Card>

        <TimeEntryModal
          visible={this.state.showTimeEntryModal}
          onCancel={this.closeTimeEntryModal}
          onSubmit={this.handleTimeEntrySubmit}
          assignedIssues={assignedIssues}
          selectedIssue={this.state.selectedIssue}
          selectedTimeSlot={this.state.selectedTimeSlot}
        />
      </div>
    );
  }
}