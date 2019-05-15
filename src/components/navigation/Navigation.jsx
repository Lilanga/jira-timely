import React, { Component } from "react";
import { Link } from "react-router-dom";
import Avatar from "@atlaskit/avatar";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import { Layout, Menu, Icon } from 'antd';
import { LinkContainer } from "react-router-bootstrap";
import logo from "./logo.svg";
import "./Navigation.scss"

export class Navigation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            collapsed: false,
        };

        this.handleLogout = this.handleLogout.bind(this);
    }

    async handleLogout(event) {
        this.props.logoutRequest();
    }

    onCollapse = (collapsed) => {
        this.setState({ collapsed });
    }

    onMenuClick = (item) => {
        if (item.key.charAt(0) === "/") {
            var path = `${item.key}`;
        } else {
            if (item.key === "logoff") {
                path = "/login";
                this.handleLogout();
            }
        }

        this.props.history.push(path);
    }

    render() {
        const { Sider } = Layout;
        const SubMenu = Menu.SubMenu;

        return (
            this.props.isLoggedIn ? (
                <Sider
                    collapsible
                    collapsed={this.state.collapsed}
                    onCollapse={this.onCollapse}
                >
                    <span className="avatar">
                        <Avatar
                            src={this.props.userDetails.avatarUrls.large}
                            name={this.props.userDetails.displayName}
                            enableTooltip={true}
                            presence="online"
                        />
                    </span>
                    <Menu theme="dark" mode="inline" onSelect={this.onMenuClick} style={{ paddingTop: "15px" }}>
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
                                        <img src={logo} className="app-logo" alt="logo" />
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
                )
        );
    }
}