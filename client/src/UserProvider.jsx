import Axios from "axios";
import React, { createContext, useEffect, useState } from "react";

const context = createContext(null);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    Axios.get("/api/user", { withCredentials: true })
      .then((res) => {
        if (res.data) setUser(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return <context.Provider value={user}>{children}</context.Provider>;
};

UserProvider.context = context;

export default UserProvider;
