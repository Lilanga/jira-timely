import React from "react";
import { Route, Switch } from "react-router-dom";
import { Home, NotFound } from "./components";
import Login from "./containers/Login";
import AppliedRoute from "./utils/AppliedRoute";

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Home} props={childProps} />
    <AppliedRoute path="/login" exact component={Login} props={childProps} />
    <Route component={NotFound} />
  </Switch>;