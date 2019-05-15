import React, { Component } from "react";
import { Layout} from 'antd';
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
        <Navigation />
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
