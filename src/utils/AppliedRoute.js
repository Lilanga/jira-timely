import React from "react";

const AppliedRoute = ({ component: C, props: cProps }) =>
  <C {...cProps} />;

export default AppliedRoute;