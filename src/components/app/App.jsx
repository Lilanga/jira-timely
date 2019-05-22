import React, { Component } from "react";
import TitleBar from "frameless-titlebar";
import defaultIcon from "../../img/jira_sm.png"
import { Layout } from "antd";
import Loader from "../../containers/Loader";
import Navigation from "../../containers/Navigation";
import Routes from "../../Routes";
import "./App.scss";
import { getCredentials } from "../../data/database";

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticating: true,
    };
  }

  async componentDidMount() {
    try {
      let credentials = await getCredentials();
      this.setState({ isAuthenticating: credentials });

      if (credentials) {
        this.props.signInRequest(credentials);
      }
    } catch (e) {
      this.setState({ isAuthenticating: false });
    }
  }

  render() {
    const { Content } = Layout;

    return (
      <Layout className="layout">
        <TitleBar
          icon={defaultIcon}
          app="Jira Timely"
          theme={{
            barTheme: 'dark',
            barBackgroundColor: '#2090ea',
            menuHighlightColor: '#2090ea',
            barShowBorder: true,
            barBorderBottom: '1px solid #1a70b7',
          }}
        />
        <Layout>
          <Navigation />
          <Layout>
            <Content>
              <Routes />
              <Loader />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}
