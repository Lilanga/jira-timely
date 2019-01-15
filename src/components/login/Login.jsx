import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.scss";
import {createDatabase} from '../../data/database';

export class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: "",
      email: "",
      password: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.isLoggedIn) {
      const database = await createDatabase();
      database.credentials.insert(this.state);
      database.profile.insert(nextProps.userDetails);

      this.setState({url: "",  email: "", password: ""});
      this.props.history.push("/");
    }
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault();
    
    this.props.loginRequest({
      url: this.state.url,
      email: this.state.email,
      password: this.state.password
    });
  }

  render() {
    return (
      <div className="Login">
        <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="url" bsSize="large">
            <ControlLabel>JIRA Url</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              value={this.state.url}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>User Name</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
          >
            Login
          </Button>
        </form>
      </div>
    );
  }
}