import { useHookstate } from "@hookstate/core";
import React from "react";
import { Redirect, Route } from "react-router-dom";
import { userState } from "../Store";

// Redirects users from auth pages after login

const AuthRoute = ({ component: Component, redirectTo = "/", ...rest }) => {
  const user = useHookstate(userState);

  return (
    <Route
      {...rest}
      render={(routeProps) =>
        !user.get() ? <Component {...routeProps} /> : <Redirect to={{ pathname: redirectTo }} />
      }
    />
  );
};

export default AuthRoute;
