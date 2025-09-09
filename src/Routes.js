import React from "react";
import { Route, Routes } from "react-router-dom";
import { Home, NotFound } from "./components";
import WorkLogCalendar from "./containers/WorkLogCalendar";
import Login from "./containers/Login";
import AppliedRoute from "./utils/AppliedRoute";

const AppRoutes = ({ childProps }) =>
  <Routes>
    <Route path="/" element={<AppliedRoute component={Home} props={childProps} />} />
    <Route path="/login" element={<AppliedRoute component={Login} props={childProps} />} />
    <Route path="/calendar" element={<WorkLogCalendar />} />
    <Route path="*" element={<NotFound />} />
  </Routes>;

export default AppRoutes;