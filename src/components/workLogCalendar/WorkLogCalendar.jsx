import React, { Component } from "react";
import { Calendar, Views } from "react-big-calendar";
import {getEventsFromWorklogs} from "../../utils/payloadMappings";
import ControlSlot from "../../utils/controlSlot";
import moment from 'moment';
import smalltalk from "smalltalk";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./WorkLogCalendar.scss";

import { momentLocalizer } from "react-big-calendar";
const localizer = momentLocalizer(moment);
export class WorkLogCalendar extends Component {

  constructor(props) {
    super(props);

    console.log("WorkLogCalendar props:", props);
    this.state = { events: getEventsFromWorklogs(props.worklogs || []) }

    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidUpdate(prevProps){
    if(this.props.worklogs !== prevProps.worklogs){
      console.log("WorkLogCalendar updating with new worklogs:", this.props.worklogs);
      let events = getEventsFromWorklogs(this.props.worklogs || []);
      this.setState({events});
    }
  }

  handleSelect = ({ start, end }) => {
    smalltalk
      .prompt("Create New Event", "Please specify an event name", "")
      .then((title) => {
        this.setState({
          events: [
            ...this.state.events,
            {
              start,
              end,
              title,
            },
          ],
        })
      })
      .catch(() => {
        console.log("cancel");
      });

  }

  render() {
    return (
      <>
        <ControlSlot.Entry waitForOutlet>
          <strong>
            Click an event to see more info, or drag the mouse over the calendar
            to select a date/time range.
          </strong>
        </ControlSlot.Entry>
        <Calendar
          selectable
          localizer={localizer}
          events={this.state.events}
          defaultView={Views.WEEK}
          scrollToTime={new Date(1970, 1, 1, 6)}
          defaultDate={new Date()}
          onSelectEvent={event => alert(event.title)}
          onSelectSlot={this.handleSelect}
        />
      </>
    );
  }
}