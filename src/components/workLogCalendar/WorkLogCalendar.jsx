import React, { Component } from "react";
import BigCalendar from "react-big-calendar";
import dates from "../../utils/dates";
import ControlSlot from "../../utils/controlSlot";
import globalize from 'globalize';
import smalltalk from "smalltalk";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./WorkLogCalendar.scss";

const localizer = BigCalendar.globalizeLocalizer(globalize);
export class WorkLogCalendar extends Component {

  constructor(props) {
    super(props);

    let events = this.getListData();
    this.state = { events }

    this.handleSelect = this.handleSelect.bind(this);
  }

  getListData() {
    return [
      {
        id: 0,
        title: 'All Day Event very long title',
        allDay: true,
        start: dates.add(new Date(), -1, "day"),
        end: new Date(),
      },
      {
        id: 1,
        title: 'Long Event',
        start: dates.add(new Date(), -1, "day"),
        end: dates.add(new Date(), 1, "day"),
      },

      {
        id: 2,
        title: 'DTS STARTS',
        start: dates.add(new Date(), -5, "day"),
        end: dates.add(new Date(), -5, "day"),
      },

      {
        id: 3,
        title: 'DTS ENDS',
        start: dates.add(new Date(), -2, "day"),
        end: dates.add(new Date(), -2, "day"),
      },

      {
        id: 4,
        title: 'Some Event',
        start: dates.add(new Date(), 2, "day"),
        end: dates.add(new Date(), 2, "day"),
      },
      {
        id: 5,
        title: 'Conference',
        start: new Date(),
        end: new Date(),
        desc: 'Big conference for important people',
      },
      {
        id: 6,
        title: 'Meeting',
        start: new Date(),
        end: dates.add(new Date(), 1, "day"),
        desc: 'Pre-meeting meeting, to prepare for the meeting',
      },
      {
        id: 7,
        title: 'Lunch',
        start: dates.add(new Date(), -2, "day"),
        end: dates.add(new Date(), -1, "day"),
        desc: 'Power lunch',
      },
      {
        id: 8,
        title: 'Meeting',
        start: dates.add(new Date(), 1, "day"),
        end: dates.add(new Date(), 1, "day"),
      },
      {
        id: 9,
        title: 'Happy Hour',
        start: dates.add(new Date(), 3, "day"),
        end: dates.add(new Date(), 3, "day"),
        desc: 'Most important meal of the day',
      },
      {
        id: 10,
        title: 'Dinner',
        start: dates.add(new Date(), 2, "day"),
        end: dates.add(new Date(), 2, "day"),
      },
      {
        id: 11,
        title: 'Birthday Party',
        start: dates.add(new Date(), 1, "day"),
        end: dates.add(new Date(), 1, "day"),
      },
      {
        id: 12,
        title: 'Late Night Event',
        start: dates.add(new Date(), -4, "day"),
        end: dates.add(new Date(), -4, "day"),
      },
      {
        id: 12.5,
        title: 'Late Same Night Event',
        start: dates.add(new Date(), -5, "day"),
        end: dates.add(new Date(), -5, "day"),
      },
      {
        id: 13,
        title: 'Multi-day Event',
        start: dates.add(new Date(), -2, "day"),
        end: dates.add(new Date(), -2, "day"),
      },
      {
        id: 14,
        title: 'Today',
        start: new Date(new Date().setHours(new Date().getHours() - 3)),
        end: new Date(new Date().setHours(new Date().getHours() + 3)),
      },
      {
        id: 15,
        title: 'Point in Time Event',
        start: dates.add(new Date(), -1, "day"),
        end: dates.add(new Date(), -1, "day"),
      },
    ]
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