import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import mongoose from "./config/mongoose.js";
import passport from "./config/passport.js";
import routes from "./routes/index.js";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

app.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

app.use(express.static(path.resolve("./client/build")));
app.get("*", (req, res) =>
  res.sendFile(path.resolve("./client/build", "index.html"))
);

mongoose.connection.once("open", () =>
  app.listen(port, () => console.log(`Server running on port ${port}`))
);
