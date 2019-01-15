import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import Avatar from "@atlaskit/avatar";
import { Nav, Navbar, NavItem, NavDropdown, MenuItem } from "react-bootstrap";
import Loader from "../../containers/Loader";
import { LinkContainer } from "react-router-bootstrap";
import Routes from "../../Routes";
import logo from "./logo.svg";
import "./App.scss";
import { createDatabase } from "../../data/database";

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticating: true,
      userProfile: undefined
    };

    this.handleLogout = this.handleLogout.bind(this);
  }

  async componentDidMount() {
    this.db = await createDatabase();

    try {
      this.db.credentials
        .findOne()
        .exec()
        .then(creds => {
          this.setState({ isAuthenticating: creds });
          if (!creds) {
            return;
          }

          this.props.loginRequest(creds);
        });
    } catch (e) {
      this.setState({ isAuthenticating: false });
    }
  }

  async handleLogout(event) {
    const db = await createDatabase();
    await db.credentials.find().remove();
    await db.profile.find().remove();

    this.props.logoutRequest();
  }

  render() {
    return (
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">
                <span className="header-line">
                  <img src={logo} className="App-logo" alt="logo" />
                  <span>Timely</span>
                </span>
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              {this.props.isLoggedIn ? (
                <Fragment>
                  <Avatar
                    src={this.props.userDetails.avatarUrls.large}
                    presence="online"
                  />
                  <NavDropdown
                    title={this.props.userDetails.displayName}
                    id="basic-nav-dropdown"
                  >
                    <MenuItem onClick={this.handleLogout}>Logout</MenuItem>
                    <MenuItem divider />
                    <LinkContainer to="/worklogs">
                      <MenuItem>Work Logs</MenuItem>
                    </LinkContainer>
                    <LinkContainer to="/calendar">
                      <MenuItem>Calendar</MenuItem>
                    </LinkContainer>
                  </NavDropdown>
                </Fragment>
              ) : (
                <Fragment>
                  <LinkContainer to="/login">
                    <NavItem>Login</NavItem>
                  </LinkContainer>
                </Fragment>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes />
        <Loader />
      </div>
    );
  }
}
