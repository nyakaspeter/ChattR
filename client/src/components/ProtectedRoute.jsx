import { useHookstate } from "@hookstate/core";
import React from "react";
import { Redirect, Route } from "react-router-dom";
import { userState } from "../Store";

// Redirects users from protected pages before login

const ProtectedRoute = ({ component: Component, redirectTo = "/login", ...rest }) => {
  const user = useHookstate(userState);

  return (
    <Route
      {...rest}
      render={(routeProps) => (user.get() ? <Component {...routeProps} /> : <Redirect to={{ pathname: redirectTo }} />)}
    />
  );
};

export default ProtectedRoute;
