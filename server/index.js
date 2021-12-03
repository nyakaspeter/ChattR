import MongoStore from 'connect-mongo';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import http from 'http';
import mongoose from './config/mongoose.js';
import passport from './config/passport.js';
import socketio from './config/socketio.js';
import routes from './routes/index.js';

const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';

export const app = express();
export const server = http.createServer(app);

mongoose.connection.once('open', () => {
  const sessionStore = MongoStore.create({
    client: mongoose.connection.getClient(),
  });

  const expressSession = session({
    secret: SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  });

  const passportMw = passport.initialize();
  const passportSession = passport.session();

  app.use(cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 }));
  app.use(express.json({ extended: true }));
  app.use(express.urlencoded({ extended: true }));
  app.use(expressSession);
  app.use(passportMw);
  app.use(passportSession);
  app.use(routes);

  socketio.init(server, expressSession, passportMw, passportSession);

  if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }

  app.emit('initialized');
});
