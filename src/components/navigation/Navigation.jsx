import React, { Component } from "react";
import { Link } from "react-router-dom";
import Avatar from "@atlaskit/avatar";
import { Nav, Navbar, Container } from "react-bootstrap";
import { Layout, Menu } from 'antd';
import { 
  AreaChartOutlined, 
  ScheduleOutlined, 
  CalendarOutlined, 
  SettingOutlined, 
  PoweroffOutlined 
} from '@ant-design/icons';
import logo from "./logo.svg";
import "./Navigation.scss"

export class Navigation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            collapsed: false
        };

        this.handleLogout = this.handleLogout.bind(this);
        this.onMenuClick = this.onMenuClick.bind(this);
    }

    async handleLogout(event) {
        this.props.logoutRequest();
    }

    onCollapse = (collapsed) => {
        this.setState({ collapsed });
    }

    onMenuClick = ({ key }) => {
        if (key.charAt(0) === "/") {
            // Navigate to the path
            window.location.pathname = key;
        } else if (key === "logoff") {
            this.handleLogout();
            window.location.pathname = "/login";
        }
    }

    render() {
        const { Sider } = Layout;

        const menuItems = [
            {
                key: '/',
                icon: <AreaChartOutlined />,
                label: 'Timely',
            },
            {
                key: 'sub-log',
                icon: <ScheduleOutlined />,
                label: 'Worklogs',
                children: [
                    {
                        key: '/worklog',
                        label: 'My worklog',
                    },
                    {
                        key: '4',
                        label: 'Team worklogs',
                    },
                    {
                        key: '5',
                        label: 'My Items',
                    },
                ],
            },
            {
                key: '/calendar',
                icon: <CalendarOutlined />,
                label: 'Calendar',
            },
            {
                key: '/settings',
                icon: <SettingOutlined />,
                label: 'Settings',
            },
            {
                key: 'logoff',
                icon: <PoweroffOutlined />,
                label: 'Logout',
            },
        ];

        return (
            this.props.isLoggedIn ? (
                <Sider
                    collapsible
                    collapsed={this.state.collapsed}
                    onCollapse={this.onCollapse}
                >
                    <span className="avatar">
                        <Avatar
                            src={this.props.userDetails?.avatarUrls?.large || ''}
                            name={this.props.userDetails?.displayName || 'User'}
                            enableTooltip={true}
                            presence="online"
                        />
                    </span>
                    <Menu 
                        theme="dark" 
                        mode="inline" 
                        onClick={this.onMenuClick} 
                        items={menuItems}
                        style={{ paddingTop: "15px" }}
                    />
                </Sider>) : (
                    <Navbar expand="lg" collapseOnSelect>
                        <Container fluid>
                            <Navbar.Brand as={Link} to="/">
                                <span className="header-line">
                                    <img src={logo} className="app-logo" alt="logo" />
                                    <span>Timely</span>
                                </span>
                            </Navbar.Brand>
                            <Navbar.Toggle />
                            <Navbar.Collapse>
                                <Nav className="ms-auto">
                                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                )
        );
    }
}