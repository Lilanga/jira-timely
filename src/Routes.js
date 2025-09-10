import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { NotFound } from "./components";
import Timely from "./containers/Timely";
import Agenda from "./containers/Agenda";
import WorkLogCalendar from "./containers/WorkLogCalendar";
import Settings from "./containers/Settings";
import Login from "./containers/Login";
import Test from "./containers/Test";
// AppliedRoute is no longer necessary with React Router v6

const AppRoutes = ({ childProps }) => {
  const isLoggedIn = !!childProps?.isLoggedIn;

  return (
    <Routes>
      {isLoggedIn ? (
        <>
          <Route path="/" element={<Timely {...childProps} />} />
          <Route path="/timely" element={<Timely {...childProps} />} />
          <Route path="/agenda" element={<Agenda {...childProps} />} />
          <Route path="/calendar" element={<WorkLogCalendar {...childProps} />} />
          <Route path="/settings" element={<Settings {...childProps} />} />
          <Route path="/test" element={<Test {...childProps} />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Login {...childProps} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};

export default AppRoutes;
