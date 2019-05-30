import React, { Component } from "react";
import BigCalendar from "react-big-calendar";
import {getEventsFromWorklogs} from "../../utils/payloadMappings";
import ControlSlot from "../../utils/controlSlot";
import globalize from 'globalize';
import smalltalk from "smalltalk";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./WorkLogCalendar.scss";

const localizer = BigCalendar.globalizeLocalizer(globalize);
export class WorkLogCalendar extends Component {

  constructor(props) {
    super(props);

    this.state = { events: getEventsFromWorklogs(props.worklogs) }

    this.handleSelect = this.handleSelect.bind(this);
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.worklogs !== this.props.worklogs){
      let events = getEventsFromWorklogs(nextProps.worklogs);
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
        <BigCalendar
          selectable
          localizer={localizer}
          events={this.state.events}
          defaultView={BigCalendar.Views.WEEK}
          scrollToTime={new Date(1970, 1, 1, 6)}
          defaultDate={new Date()}
          onSelectEvent={event => alert(event.title)}
          onSelectSlot={this.handleSelect}
        />
      </>
    );
  }
}