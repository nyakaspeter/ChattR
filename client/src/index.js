import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import UserProvider from "./UserProvider";

ReactDOM.render(
  <UserProvider>
    <App />
  </UserProvider>,
  document.getElementById("root")
);
