import { useHookstate } from "@hookstate/core";
import React from "react";
import { Redirect, Route } from "react-router-dom";
import { globalStore } from "../core/store";

// Redirects users from auth pages after login

const AuthRoute = ({ component: Component, redirectTo = "/", ...rest }) => {
  const store = useHookstate(globalStore);
  const authenticated = store.user.get() !== null;

  return (
    <Route
      {...rest}
      render={(routeProps) =>
        !authenticated ? <Component {...routeProps} /> : <Redirect to={{ pathname: redirectTo }} />
      }
    />
  );
};

export default AuthRoute;
