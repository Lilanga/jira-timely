import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom";
import Avatar from '@atlaskit/avatar';
import { Nav, Navbar, NavItem, NavDropdown, MenuItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import Routes from "../../Routes";
import logo from './logo.svg';
import './App.scss';


export class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: false,
      userProfile: undefined,
    };
  }

  componentDidMount() {
  }

  userHasAuthenticated = authenticated => {
    this.setState({ isAuthenticated: authenticated });
  }

  updateProfile = profile => {
    this.setState({ userProfile: profile });
  }

  handleLogout = event => {
    this.userHasAuthenticated(false);
  }
  
  render() {

    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      updateProfile: this.updateProfile
    };

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
              {this.state.isAuthenticated
                ? 
                <Fragment>
                  <Avatar src={this.state.userProfile.avatarUrls["48x48"]} presence='online' />
                  <NavDropdown title={this.state.userProfile.displayName} id="basic-nav-dropdown">
                    <MenuItem onClick={this.handleLogout}>Logout</MenuItem>
                    <MenuItem divider />
                    <MenuItem>Work Logs</MenuItem>
                  </NavDropdown>

                </Fragment>
                : <Fragment>
                  <LinkContainer to="/signup">
                    <NavItem>Signup</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <NavItem>Login</NavItem>
                  </LinkContainer>
                </Fragment>
              }
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes childProps={childProps} />
      </div>
    );
  }
}
