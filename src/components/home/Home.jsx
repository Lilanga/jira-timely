import React, { Component } from "react";
import "./Home.scss";

export class Home extends Component {
  render() {
    return (
      <div className="Home">
        <div className="lander">
          <h1>Timely</h1>
          <p>A simple JIRA work-log recording app</p>
        </div>
      </div>
    );
  }
}