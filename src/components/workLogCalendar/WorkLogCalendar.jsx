import React, { Component } from "react";
import { Calendar, Badge, Row, Col } from 'antd';
import "./WorkLogCalendar.scss";

export class WorkLogCalendar extends Component {

  constructor(props) {
    super(props);

    this.dateCellRender = this.dateCellRender.bind(this);
  }

    getListData(value) {
        let listData;
        switch (value.date()) {
          case 8:
            listData = [
              { type: 'warning', content: 'This is warning event.' },
              { type: 'success', content: 'This is usual event.' },
            ]; break;
          case 10:
            listData = [
              { type: 'warning', content: 'This is warning event.' },
              { type: 'success', content: 'This is usual event.' },
              { type: 'error', content: 'This is error event.' },
            ]; break;
          case 15:
            listData = [
              { type: 'warning', content: 'This is warning event' },
              { type: 'success', content: 'This is very long usual event。。....' },
              { type: 'error', content: 'This is error event 1.' },
              { type: 'error', content: 'This is error event 2.' },
              { type: 'error', content: 'This is error event 3.' },
              { type: 'error', content: 'This is error event 4.' },
            ]; break;
          default:
        }
        return listData || [];
      }
      
      dateCellRender(value) {
        const listData = this.getListData(value);
        return (
          <ul className="events">
            {
              listData.map(item => (
                <li key={item.content}>
                  <Badge status={item.type} text={item.content} />
                </li>
              ))
            }
          </ul>
        );
      }

  render() {
    return (
      <Row type="flex">
        <Col><Calendar dateCellRender={this.dateCellRender} /></Col>
      </Row>
    );
  }
}