import React, { Component } from "react";
import { Link } from "react-router-dom";
import Avatar from "@atlaskit/avatar";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import { Layout, Menu, Icon } from 'antd';
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
      userProfile: undefined,
      collapsed: false,
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

  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  }

  onMenuClick = (item) => {
    if(item.key.charAt(0) === "/"){
    var path = `${item.key}`;
    }else{
      if(item.key === "logoff"){
        path = "/login";
        this.handleLogout();
      }
    }

    this.props.history.push(path);
  }

  render() {
    const { Content, Sider } = Layout;
    const SubMenu = Menu.SubMenu;

    return (
      <Layout className="layout">
      {this.props.isLoggedIn ? (
      <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
        <span className="avatar">
          <Avatar
            src={this.props.userDetails.avatarUrls.large}
            presence="online"
          />
        </span>
          <Menu theme="dark" mode="inline" onSelect={this.onMenuClick} style={{paddingTop: "15px"}}>
          <Menu.Item key="/">
          <Icon type="area-chart" />
          <span>Timely</span>
            </Menu.Item>
            <SubMenu
              key="sub-log"
              title={<span><Icon type="schedule" /><span>worklogs</span></span>}
            >
              <Menu.Item key="/worklog">My worklog</Menu.Item>
              <Menu.Item key="4">Team worklogs</Menu.Item>
              <Menu.Item key="5">My Items</Menu.Item>
            </SubMenu>
            <Menu.Item key="/calendar">
            <Icon type="calendar" />
              <span>Calender</span>
            </Menu.Item>
            <Menu.Item key="/settings">
            <Icon type="setting" />
              <span>Settings</span>
            </Menu.Item>
            <Menu.Item key="logoff">
            <Icon type="poweroff" />
              <span>Logout</span>
            </Menu.Item>
          </Menu>
        </Sider>) : (
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
                  <LinkContainer to="/login">
                    <NavItem>Login</NavItem>
                  </LinkContainer>
                </Nav>
                </Navbar.Collapse>
              </Navbar>
              )}
        <Layout>       
        <Content>
          <Routes />
          <Loader />
        </Content>   
      </Layout>
      </Layout>
    );
  }
}
