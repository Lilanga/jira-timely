import React, { Component } from "react";
import { Button, Form } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import "./Login.scss";

export class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: "",
      email: "",
      password: "",
      shouldRedirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidUpdate(prevProps) {
    if (this.props.isLoggedIn && !prevProps.isLoggedIn) {
      this.setState({url: "",  email: "", password: "", shouldRedirect: true});
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
    
    console.log("Login form submitted with data:", {
      url: this.state.url,
      email: this.state.email,
      password: this.state.password
    });
    
    this.props.loginRequest({
      url: this.state.url,
      email: this.state.email,
      password: this.state.password
    });
  }

  render() {
    if (this.state.shouldRedirect) {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="Login">
        <Form onSubmit={this.handleSubmit}>
          <Form.Group className="mb-3" controlId="url">
            <Form.Label>JIRA Url</Form.Label>
            <Form.Control
              autoFocus
              type="text"
              size="lg"
              value={this.state.url}
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              size="lg"
              value={this.state.email}
              onChange={this.handleChange}
              placeholder="your-email@company.com"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>API Token</Form.Label>
            <Form.Control
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
              size="lg"
              placeholder="Your JIRA API Token"
            />
            <Form.Text className="text-muted">
              For JIRA Cloud, use your API Token instead of password. 
              Create one at: Account Settings → Security → API Tokens
            </Form.Text>
          </Form.Group>
          <Button
            className="w-100"
            size="lg"
            disabled={!this.validateForm()}
            type="submit"
          >
            Login
          </Button>
        </Form>
      </div>
    );
  }
}