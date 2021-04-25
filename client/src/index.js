import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@material-ui/core";
import App from "./App";
import UserProvider from "./UserProvider";

ReactDOM.render(
  <UserProvider>
    <BrowserRouter>
      <CssBaseline>
        <App />
      </CssBaseline>
    </BrowserRouter>
  </UserProvider>,
  document.getElementById("root")
);
